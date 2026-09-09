// RadarPage.tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { listenToMyPosition } from '../lib/firebaseService';

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

  const playBeep = useCallback(() => {
    if (muted) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
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
  }, [muted]);

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
      `}</style>

      <h1 className="radar-title">Radar</h1>
      <p className="radar-subtitle">Tu as trouvé l'objet ! Le radar est activé.</p>

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
    </div>
  );
}