// RadarPage.tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { listenToMyPosition } from '../lib/firebaseService';

/* ---------- Configuration du cadeau ---------- */
// Le PDF vit dans le dossier public du site, exactement comme tes images
// (ex: /public/documents/... ou le dossier où atterrissent déjà tes assets).
// Adapte simplement ce chemin à ton arborescence réelle.
const GIFT_PDF_URL = '/documents/billets-nawell-madani.pdf';
const GIFT_EVENT_TITLE = 'Nawell Madani — Tout Court';
const GIFT_EVENT_DATE = 'Samedi 24 octobre 2026 · 20h00';
const GIFT_EVENT_VENUE = 'Casino de Paris';
const GIFT_EVENT_SEATS = '2 places · Balcon de face pair, rang V';
const GIFT_STORAGE_KEY = 'radar_gift_unlocked_v1';

// Distance (en km) sous laquelle on considère la cible "atteinte".
// 0.03 km = 30 m : à ajuster selon la précision GPS réelle des appareils visés.
const GIFT_UNLOCK_DISTANCE_KM = 0.03;

function readGiftUnlockedFromStorage(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(GIFT_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

// ---------- Helpers géographiques ----------
const toRad = (deg: number) => (deg * Math.PI) / 180;
const toDeg = (rad: number) => (rad * 180) / Math.PI;

function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // rayon terrestre en km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function bearingDeg(lat1: number, lon1: number, lat2: number, lon2: number) {
  const y = Math.sin(toRad(lon2 - lon1)) * Math.cos(toRad(lat2));
  const x =
    Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
    Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(toRad(lon2 - lon1));
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

function formatKm(km: number) {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toString()} km`;
}

function compassLabel(deg: number) {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];
  return dirs[Math.round(deg / 45) % 8];
}

// Paliers d'échelle du rayon radar, du plus large au plus précis
const SCALE_STEPS_KM = [2000, 1000, 500, 200, 100, 50, 20, 10, 5, 2, 1, 0.5, 0.2, 0.1, 0.05];
const WAVE_PERIOD_MS = 3200;

type LatLng = { lat: number; lng: number };

export function RadarPage() {
  const [visitorPos, setVisitorPos] = useState<LatLng | null>(null); // toi, au centre
  const [targetPos, setTargetPos] = useState<LatLng | null>(null); // ta position perso stockée sur Firebase
  const [accuracy, setAccuracy] = useState<number | null>(null); // précision GPS en mètres
  const [scaleIndex, setScaleIndex] = useState(0); // 2000km par défaut
  const [showScaleIndicator, setShowScaleIndicator] = useState(false);
  const scaleIndicatorTimeoutRef = useRef<number | null>(null);
  const [error, setError] = useState('');
  const [muted, setMuted] = useState(false);

  const [waveProgress, setWaveProgress] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [revealCount, setRevealCount] = useState(0);

  const waveStartRef = useRef(0);
  const wasBeforeThresholdRef = useRef(true);
  const revealTimeoutRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // --- État du cadeau ---
  const [giftUnlocked, setGiftUnlocked] = useState<boolean>(() => readGiftUnlockedFromStorage());
  const [showGiftOverlay, setShowGiftOverlay] = useState(false);
  const [chestOpen, setChestOpen] = useState(false);
  const hasTriggeredGiftRef = useRef<boolean>(readGiftUnlockedFromStorage());

  // L'échelle la plus précise ne peut pas descendre sous la précision GPS réelle
  const usableSteps = useMemo(() => {
    const minKm = accuracy ? Math.max(accuracy / 1000, 0.02) : 0.05;
    const steps = SCALE_STEPS_KM.filter((km) => km >= minKm);
    return steps.length > 0 ? steps : [SCALE_STEPS_KM[SCALE_STEPS_KM.length - 1]];
  }, [accuracy]);

  useEffect(() => {
    if (scaleIndex > usableSteps.length - 1) setScaleIndex(usableSteps.length - 1);
  }, [usableSteps, scaleIndex]);

  const scaleKm = usableSteps[scaleIndex] ?? usableSteps[0];

  // --- Géolocalisation live de l'utilisateur courant (centre du radar) ---
  useEffect(() => {
    let watchId: number;
    (async () => {
      const { watchPosition } = await import('../lib/geolocation');
      watchId = watchPosition(
        (position) => {
          const { latitude, longitude, accuracy: acc } = position.coords;
          setVisitorPos({ lat: latitude, lng: longitude });
          setAccuracy(acc ?? null);
          setError('');
        },
        (err) => {
          if (err.code === 2) {
            setError('Position indisponible. Vérifiez vos paramètres de localisation.');
          } else {
            setError(err.message || 'Impossible de récupérer votre position.');
          }
        }
      );
    })();
    return () => {
      if (watchId) {
        import('../lib/geolocation').then(({ clearWatch }) => clearWatch(watchId));
      }
    };
  }, []);

  // --- Position cible enregistrée sur Firebase ---
  useEffect(() => {
    const unsubscribe = listenToMyPosition((pos) => {
      setTargetPos({ lat: pos.lat, lng: pos.lng });
    });
    return () => unsubscribe();
  }, []);

  // --- Boucle d'animation de la vague sonar ---
  useEffect(() => {
    waveStartRef.current = performance.now();
    let raf: number;
    const tick = (now: number) => {
      const elapsed = (now - waveStartRef.current) % WAVE_PERIOD_MS;
      setWaveProgress(elapsed / WAVE_PERIOD_MS);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Distance / azimut entre toi et la cible
  const { dist, brng, inRange } = useMemo(() => {
    if (!visitorPos || !targetPos) return { dist: null as number | null, brng: 0, inRange: false };
    const d = distanceKm(visitorPos.lat, visitorPos.lng, targetPos.lat, targetPos.lng);
    const b = bearingDeg(visitorPos.lat, visitorPos.lng, targetPos.lat, targetPos.lng);
    return { dist: d, brng: b, inRange: d <= scaleKm };
  }, [visitorPos, targetPos, scaleKm]);

  // Position (%) de la cible sur l'écran radar, seulement si elle est à portée
  const targetPoint = useMemo(() => {
    if (dist === null || !inRange) return null;
    const ratio = Math.min(dist / scaleKm, 1);
    const angleRad = toRad(brng);
    return {
      xPct: 50 + 50 * ratio * Math.sin(angleRad),
      yPct: 50 - 50 * ratio * Math.cos(angleRad),
    };
  }, [dist, brng, scaleKm, inRange]);

  // Petit chevron discret au bord si la cible est hors de portée à l'échelle actuelle
  const offRangePoint = useMemo(() => {
    if (dist === null || inRange) return null;
    const angleRad = toRad(brng);
    const r = 46;
    return {
      xPct: 50 + r * Math.sin(angleRad),
      yPct: 50 - r * Math.cos(angleRad),
      rotation: brng,
    };
  }, [dist, brng, inRange]);

  const getAudioCtx = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioCtxRef.current;
  }, []);

  const playBeep = useCallback(() => {
    if (muted) return;
    try {
      const ctx = getAudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.15, ctx.currentTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch {
      // audio indisponible, on ignore silencieusement
    }
  }, [muted, getAudioCtx]);

  const playVictoryChime = useCallback(() => {
    if (muted) return;
    try {
      const ctx = getAudioCtx();
      const notes = [523.25, 659.25, 783.99, 1046.5]; // petit arpège triomphal
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = freq;
        const start = ctx.currentTime + i * 0.12;
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(0.18, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.45);
      });
    } catch {
      // audio indisponible, on ignore
    }
  }, [muted, getAudioCtx]);

  const triggerReveal = useCallback(() => {
    setRevealCount((c) => c + 1);
    setRevealed(true);
    playBeep();
    if (revealTimeoutRef.current) window.clearTimeout(revealTimeoutRef.current);
    revealTimeoutRef.current = window.setTimeout(() => setRevealed(false), WAVE_PERIOD_MS * 0.85);
  }, [playBeep]);

  // Déclenche le "bip" exactement quand le front de la vague croise la distance de la cible
  useEffect(() => {
    if (dist === null || !inRange) {
      wasBeforeThresholdRef.current = true;
      return;
    }
    const targetRatio = Math.min(dist / scaleKm, 1);
    const beforeThreshold = waveProgress < targetRatio;
    if (wasBeforeThresholdRef.current && !beforeThreshold) {
      triggerReveal();
    }
    wasBeforeThresholdRef.current = beforeThreshold;
  }, [waveProgress, dist, inRange, scaleKm, triggerReveal]);

  // Confettis générés une seule fois (positions/couleurs aléatoires)
  const confettiPieces = useMemo(() => {
    const colors = ['#ffd166', '#37d67a', '#ff5c5c', '#f4f4f4', '#c94f7c'];
    return Array.from({ length: 32 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.6,
      duration: 2.4 + Math.random() * 1.6,
      rotate: Math.random() * 360,
      color: colors[i % colors.length],
      size: 6 + Math.random() * 6,
    }));
  }, []);

  // Déclenche l'ouverture du cadeau quand la cible est atteinte (une seule fois)
  useEffect(() => {
    if (dist === null || dist > GIFT_UNLOCK_DISTANCE_KM) return;
    if (hasTriggeredGiftRef.current) return;
    hasTriggeredGiftRef.current = true;

    setGiftUnlocked(true);
    setShowGiftOverlay(true);
    try {
      window.localStorage.setItem(GIFT_STORAGE_KEY, 'true');
    } catch {
      // stockage indisponible, tant pis
    }
    playVictoryChime();
    const chestTimer = window.setTimeout(() => setChestOpen(true), 250);
    return () => window.clearTimeout(chestTimer);
  }, [dist, playVictoryChime]);

  // Bloque le scroll de la page pendant que l'overlay cadeau est ouvert
  useEffect(() => {
    if (!showGiftOverlay) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [showGiftOverlay]);

  const closeGiftOverlay = useCallback(() => {
    setShowGiftOverlay(false);
    setChestOpen(false);
  }, []);

  const reopenGiftOverlay = useCallback(() => {
    setShowGiftOverlay(true);
    setChestOpen(true);
  }, []);

  return (
    <div className="radar-page">
      <style>{`
        .radar-page {
          padding: 60px 20px 100px;
          text-align: center;
          font-family: var(--font-body, sans-serif);
          color: #eafff0;
          background: radial-gradient(circle at top, #0b1b12 0%, #05100a 70%);
          min-height: 100vh;
        }
        .radar-title {
          font-family: var(--font-display);
          color: var(--color-burgundy);
          margin-bottom: 4px;
          font-size: 2.2rem;
          letter-spacing: 2px;
        }
        .radar-subtitle { color: #9adfb0; margin-bottom: 24px; }
        .radar-error { color: #ff6b6b; margin-bottom: 16px; }

        .radar-controls {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: center;
          gap: 16px;
          margin-bottom: 24px;
        }
        .radar-scale-label { color: #cfeede; font-size: 0.95rem; }
        .radar-controls input[type='range'] { width: 220px; accent-color: #37d67a; }
        .radar-mute-btn {
          background: rgba(55, 214, 122, 0.12);
          border: 1px solid #37d67a;
          color: #d7fff0;
          padding: 6px 14px;
          border-radius: 999px;
          cursor: pointer;
          font-size: 0.85rem;
        }

        .radar-frame {
          width: min(92vw, 520px);
          aspect-ratio: 1 / 1;
          margin: 0 auto;
          border-radius: 50%;
          padding: 14px;
          background: linear-gradient(145deg, #2c2c2c, #0d0d0d);
          box-shadow:
            inset 0 0 0 3px #444,
            0 20px 45px rgba(0, 0, 0, 0.6),
            0 0 40px rgba(55, 214, 122, 0.15);
        }
        .radar-screen {
          position: relative;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          overflow: hidden;
          background: radial-gradient(circle, #06210f 0%, #01120a 75%, #000 100%);
          box-shadow: inset 0 0 30px rgba(0, 0, 0, 0.9);
        }

        .radar-ring {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          border: 1px solid rgba(55, 214, 122, 0.35);
          border-radius: 50%;
        }

        .radar-crosshair-v, .radar-crosshair-h {
          position: absolute;
          background: rgba(55, 214, 122, 0.25);
        }
        .radar-crosshair-v { top: 0; bottom: 0; left: 50%; width: 1px; }
        .radar-crosshair-h { left: 0; right: 0; top: 50%; height: 1px; }

        .radar-compass {
          position: absolute;
          color: rgba(215, 255, 240, 0.8);
          font-size: 0.75rem;
          font-family: var(--font-display, monospace);
        }
        .radar-compass-n { top: 4px; left: 50%; transform: translateX(-50%); }
        .radar-compass-s { bottom: 4px; left: 50%; transform: translateX(-50%); }
        .radar-compass-e { right: 6px; top: 50%; transform: translateY(-50%); }
        .radar-compass-w { left: 6px; top: 50%; transform: translateY(-50%); }

        .radar-sweep {
          position: absolute;
          inset: 0;
          background: conic-gradient(
            from 0deg,
            rgba(55, 214, 122, 0.55) 0deg,
            rgba(55, 214, 122, 0) 55deg,
            rgba(55, 214, 122, 0) 360deg
          );
          animation: radar-rotate 3.2s linear infinite;
          mix-blend-mode: screen;
        }

        .radar-wave-echo, .radar-wave-main {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          border-radius: 50%;
          border: 2px solid #37d67a;
        }
        .radar-wave-echo { width: 0; height: 0; animation: radar-ping 3.2s ease-out infinite; opacity: 0; }
        .radar-wave-echo-1 { animation-delay: 1.07s; }
        .radar-wave-echo-2 { animation-delay: 2.13s; }
        .radar-wave-main { border-color: #6bffb0; box-shadow: 0 0 12px rgba(107, 255, 176, 0.6); }

        .radar-center-marker {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: #ffd166;
          filter: drop-shadow(0 0 6px rgba(255, 209, 102, 0.8));
          z-index: 5;
        }

        .radar-target-blip {
          position: absolute;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #ff5c5c;
          box-shadow: 0 0 14px rgba(255, 92, 92, 0.9);
          animation: blip-pop 2.7s ease-out forwards;
          z-index: 6;
        }

        .radar-offrange {
          position: absolute;
          width: 0;
          height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-bottom: 12px solid rgba(255, 209, 102, 0.6);
          z-index: 4;
        }

        .radar-info-panel {
          margin-top: 24px;
          font-size: 0.9rem;
          color: #bfe9d2;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        @keyframes radar-rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes radar-ping {
          0% { width: 0; height: 0; opacity: 0.55; }
          70% { opacity: 0.12; }
          100% { width: 100%; height: 100%; opacity: 0; }
        }
        @keyframes blip-pop {
          0% { transform: translate(-50%, -50%) scale(0.2); opacity: 0; }
          15% { transform: translate(-50%, -50%) scale(1.8); opacity: 1; }
          40% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
        }

        /* --- Badge de rappel une fois le cadeau débloqué --- */
        .gift-banner {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin: 0 auto 20px auto;
          padding: 10px 20px;
          background: linear-gradient(120deg, #ffd166, #f4a53a);
          color: #3a2100;
          border: none;
          border-radius: 999px;
          font-weight: bold;
          cursor: pointer;
          box-shadow: 0 6px 18px rgba(244, 165, 58, 0.4);
        }

        /* --- Overlay cadeau --- */
        .gift-overlay {
          position: fixed;
          inset: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          background: radial-gradient(circle at center, rgba(20, 10, 5, 0.92) 0%, rgba(0,0,0,0.96) 80%);
          backdrop-filter: blur(2px);
          animation: gift-fade-in 0.4s ease;
          padding: 20px;
        }
        .gift-close-btn {
          position: absolute;
          top: 20px;
          right: 20px;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.3);
          background: rgba(255,255,255,0.08);
          color: #fff;
          font-size: 1.1rem;
          cursor: pointer;
          z-index: 5;
        }
        .gift-confetti-layer {
          position: absolute;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
        }
        .gift-confetti-piece {
          position: absolute;
          top: -20px;
          border-radius: 2px;
          animation-name: gift-confetti-fall;
          animation-timing-function: ease-in;
          animation-fill-mode: forwards;
        }
        .gift-stage {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          max-width: 420px;
          width: 100%;
        }
        .gift-glow {
          position: absolute;
          top: 10px;
          width: 280px;
          height: 280px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255, 209, 102, 0.55) 0%, rgba(255, 209, 102, 0) 70%);
          animation: gift-glow-pulse 2.4s ease-in-out infinite;
          pointer-events: none;
        }
        .gift-chest {
          position: relative;
          width: 140px;
          height: 110px;
          perspective: 600px;
          margin-bottom: 16px;
        }
        .gift-chest-base {
          position: absolute;
          bottom: 0;
          width: 100%;
          height: 65px;
          background: linear-gradient(160deg, #b5762b, #7a4a18);
          border: 3px solid #4a2c0d;
          border-radius: 10px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.5);
        }
        .gift-chest-band {
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 18px;
          height: 65px;
          background: #ffd166;
          box-shadow: 0 0 10px rgba(255,209,102,0.7);
        }
        .gift-chest-lid {
          position: absolute;
          top: 0;
          width: 100%;
          height: 46px;
          background: linear-gradient(160deg, #d99a44, #96601f);
          border: 3px solid #4a2c0d;
          border-radius: 10px 10px 4px 4px;
          transform-origin: bottom center;
          transform: rotateX(0deg);
          transition: transform 0.9s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .gift-chest.is-open .gift-chest-lid {
          transform: rotateX(-115deg);
        }
        .gift-chest-light {
          position: absolute;
          top: -10px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 60px solid transparent;
          border-right: 60px solid transparent;
          border-bottom: 140px solid rgba(255, 236, 179, 0);
          transition: border-bottom-color 0.6s ease 0.5s;
          pointer-events: none;
        }
        .gift-chest.is-open .gift-chest-light {
          border-bottom-color: rgba(255, 236, 179, 0.35);
        }
        .gift-card {
          position: relative;
          width: 100%;
          background: linear-gradient(160deg, #fff8e7, #fdeecb);
          border-radius: 18px;
          padding: 22px 24px;
          text-align: center;
          box-shadow: 0 20px 45px rgba(0,0,0,0.5), 0 0 0 2px #ffd166 inset;
          opacity: 0;
          transform: translateY(16px);
          transition: opacity 0.6s ease 0.5s, transform 0.6s ease 0.5s;
        }
        .gift-card.is-visible {
          opacity: 1;
          transform: translateY(0);
        }
        .gift-card-eyebrow {
          font-size: 0.75rem;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: var(--color-burgundy, #8a2444);
          font-weight: bold;
          margin: 0 0 6px 0;
        }
        .gift-card-title {
          font-family: var(--font-display);
          font-size: 1.4rem;
          margin: 0 0 4px 0;
          color: #3a2100;
        }
        .gift-card-meta {
          font-size: 0.9rem;
          color: #6b4b1f;
          margin: 2px 0;
        }
        .gift-card-actions {
          margin-top: 18px;
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          justify-content: center;
        }
        .gift-btn {
          border: none;
          border-radius: 999px;
          padding: 10px 20px;
          font-weight: bold;
          cursor: pointer;
          text-decoration: none;
          font-size: 0.9rem;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .gift-btn-primary {
          background: var(--color-burgundy, #8a2444);
          color: #fff8e7;
          box-shadow: 0 8px 20px rgba(138,36,68,0.4);
        }
        .gift-btn-secondary {
          background: rgba(138,36,68,0.08);
          color: var(--color-burgundy, #8a2444);
          border: 1px solid rgba(138,36,68,0.3);
        }

        @keyframes gift-fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes gift-glow-pulse {
          0%, 100% { transform: scale(0.9); opacity: 0.6; }
          50% { transform: scale(1.05); opacity: 1; }
        }
        @keyframes gift-confetti-fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(90vh) rotate(540deg); opacity: 0; }
        }
      `}</style>

      <h1 className="radar-title">Radar</h1>
      <p className="radar-subtitle">Tu as trouvé l'objet ! Le radar est activé.</p>

      {giftUnlocked && !showGiftOverlay && (
        <div>
          <button type="button" className="gift-banner" onClick={reopenGiftOverlay}>
            🎁 Cadeau débloqué — voir mes places
          </button>
        </div>
      )}

      {/* Debug panel */}
      <div style={{
        background: 'rgba(55, 214, 122, 0.05)',
        border: '1px solid rgba(55, 214, 122, 0.2)',
        padding: '12px',
        borderRadius: '12px',
        marginBottom: '24px',
        fontSize: '0.85rem',
        textAlign: 'left',
        color: '#cfeede',
        maxWidth: '520px',
        margin: '0 auto 24px auto'
      }}>
        <p style={{ margin: '0 0 8px 0', color: '#37d67a', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
          📡 État du signal
        </p>
        <div style={{ display: 'grid', gap: '4px' }}>
          <p style={{ margin: 0 }}>
            <span style={{ color: '#9adfb0' }}>Ma position :</span> {visitorPos ? `${visitorPos.lat.toFixed(5)}, ${visitorPos.lng.toFixed(5)}` : 'Recherche...'}
          </p>
          <p style={{ margin: 0 }}>
            <span style={{ color: '#9adfb0' }}>Position cible :</span> {targetPos ? `${targetPos.lat.toFixed(5)}, ${targetPos.lng.toFixed(5)}` : 'En attente...'}
          </p>
        </div>
      </div>

      {error && <p className="radar-error">{error}</p>}

      <div className="radar-controls">
        <label htmlFor="radar-scale" className="radar-scale-label">
          Échelle : <strong>{formatKm(scaleKm)}</strong> de rayon
        </label>
        <input
          id="radar-scale"
          type="range"
          min={0}
          max={usableSteps.length - 1}
          step={1}
          value={scaleIndex}
          onChange={(e) => {
            setScaleIndex(Number(e.target.value));
            setShowScaleIndicator(true);
            if (scaleIndicatorTimeoutRef.current) clearTimeout(scaleIndicatorTimeoutRef.current);
            scaleIndicatorTimeoutRef.current = window.setTimeout(() => setShowScaleIndicator(false), 1000);
          }}
        />
        <button type="button" className="radar-mute-btn" onClick={() => setMuted((m) => !m)}>
          {muted ? '🔇 Son coupé' : '🔊 Bip activé'}
        </button>
      </div>

      <div className="radar-frame">
        <div className="radar-screen">
          <div className="radar-ring" style={{ width: '25%', height: '25%' }} />
          <div className="radar-ring" style={{ width: '50%', height: '50%' }} />
          <div className="radar-ring" style={{ width: '75%', height: '75%' }} />
          <div className="radar-ring" style={{ width: '100%', height: '100%' }} />

          <div className="radar-crosshair-v" />
          <div className="radar-crosshair-h" />

          <span className="radar-compass radar-compass-n">N</span>
          <span className="radar-compass radar-compass-e">E</span>
          <span className="radar-compass radar-compass-s">S</span>
          <span className="radar-compass radar-compass-w">O</span>

          <div className="radar-sweep" />

          <div className="radar-wave-echo radar-wave-echo-1" />
          <div className="radar-wave-echo radar-wave-echo-2" />

          <div
            className="radar-wave-main"
            style={{
              width: `${waveProgress * 100}%`,
              height: `${waveProgress * 100}%`,
              opacity: Math.max(0, 1 - waveProgress),
            }}
          />

          {/* Toi : toujours fixe au centre de l'écran, quelle que soit ta position réelle */}
          <div className="radar-center-marker" title="Votre position">
            <svg viewBox="0 0 24 24" width="22" height="22">
              <path d="M12 2 L19 21 L12 17 L5 21 Z" fill="currentColor" />
            </svg>
          </div>

          {/* La cible : n'apparaît que lorsque la vague la traverse */}
          {targetPoint && revealed && (
            <div
              key={revealCount}
              className="radar-target-blip"
              style={{ left: `${targetPoint.xPct}%`, top: `${targetPoint.yPct}%` }}
            />
          )}

          {/* Indicateur discret si la cible est hors de portée à l'échelle actuelle */}
          {offRangePoint && (
            <div
              className="radar-offrange"
              style={{
                left: `${offRangePoint.xPct}%`,
                top: `${offRangePoint.yPct}%`,
                transform: `translate(-50%, -50%) rotate(${offRangePoint.rotation}deg)`,
              }}
            />
          )}

          {/* Indicateur de changement d'échelle */}
          {showScaleIndicator && (
            <div style={{
              position: 'absolute',
              top: '10px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(55, 214, 122, 0.8)',
              color: '#000',
              padding: '4px 12px',
              borderRadius: '999px',
              fontSize: '0.8rem',
              fontWeight: 'bold',
              zIndex: 10
            }}>
              Échelle : {formatKm(scaleKm)}
            </div>
          )}
        </div>
      </div>

      <div className="radar-info-panel">
        {!visitorPos && <p>Recherche du signal GPS…</p>}
        {visitorPos && (
          <p>
            Votre position : {visitorPos.lat.toFixed(5)}, {visitorPos.lng.toFixed(5)}
            {accuracy !== null && ` (précision ≈ ${Math.round(accuracy)} m)`}
          </p>
        )}
        {!targetPos && <p>En attente de la position enregistrée…</p>}
        {dist !== null && (
          <p>
            Cible : {formatKm(dist)} — {compassLabel(brng)}
            {!inRange && ' — hors de portée à cette échelle'}
          </p>
        )}
      </div>

      {showGiftOverlay && (
        <div className="gift-overlay" role="dialog" aria-modal="true" aria-label="Cadeau débloqué">
          <button type="button" className="gift-close-btn" onClick={closeGiftOverlay} aria-label="Fermer">
            ✕
          </button>

          <div className="gift-confetti-layer">
            {confettiPieces.map((c) => (
              <div
                key={c.id}
                className="gift-confetti-piece"
                style={{
                  left: `${c.left}%`,
                  width: c.size,
                  height: c.size * 0.4,
                  background: c.color,
                  animationDelay: `${c.delay}s`,
                  animationDuration: `${c.duration}s`,
                  transform: `rotate(${c.rotate}deg)`,
                }}
              />
            ))}
          </div>

          <div className="gift-stage">
            <div className="gift-glow" />

            <div className={`gift-chest ${chestOpen ? 'is-open' : ''}`}>
              <div className="gift-chest-base" />
              <div className="gift-chest-band" />
              <div className="gift-chest-lid" />
              <div className="gift-chest-light" />
            </div>

            <div className={`gift-card ${chestOpen ? 'is-visible' : ''}`}>
              <p className="gift-card-eyebrow">Cadeau débloqué</p>
              <h2 className="gift-card-title">{GIFT_EVENT_TITLE}</h2>
              <p className="gift-card-meta">{GIFT_EVENT_DATE}</p>
              <p className="gift-card-meta">{GIFT_EVENT_VENUE}</p>
              <p className="gift-card-meta">{GIFT_EVENT_SEATS}</p>
              <div className="gift-card-actions">
                <a className="gift-btn gift-btn-primary" href={GIFT_PDF_URL} download>
                  ⬇️ Télécharger les billets
                </a>
                <a className="gift-btn gift-btn-secondary" href={GIFT_PDF_URL} target="_blank" rel="noreferrer">
                  👁️ Ouvrir en plein écran
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}