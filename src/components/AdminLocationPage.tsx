import React, { useState, useEffect } from 'react';
import { updateMyPosition, listenToMyPosition } from '../lib/firebaseService';
import { useLoveQuestStore } from '../store/useLoveQuestStore';

import MapVisualizer from './MapVisualizer';

export function AdminLocationPage() {
  const [status, setStatus] = useState('');
  const [myPosition,  setMyPosition] = useState<{ lat: number, lng: number } | null>(null);
  const { showGift, setShowGift, resetRadarQuest } = useLoveQuestStore();

  useEffect(() => {
    const unsubscribe = listenToMyPosition((pos) => {
      setMyPosition({ lat: pos.lat, lng: pos.lng });
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let watchId: number;
    const startTracking = async () => {
      const { watchPosition } = await import('../lib/geolocation');
      watchId = watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          updateMyPosition(latitude, longitude);
          setMyPosition({ lat: latitude, lng: longitude });
          setStatus(`Position en direct : ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        },
        (error) => {
          if (error.code === 2) {
            setStatus('Erreur : Position indisponible. Vérifiez vos paramètres de localisation ou testez sur mobile.');
          } else {
            setStatus(`Erreur : ${error.message || 'Impossible de récupérer la position'}`);
          }
        }
      );
    };

    startTracking();
    return () => {
      if (watchId) {
        import('../lib/geolocation').then(({ clearWatch }) => clearWatch(watchId));
      }
    };
  }, []);

  return (
    <div style={{ padding: '50px', textAlign: 'center', fontFamily: 'var(--font-body)' }}>
      <h1 style={{ color: 'var(--color-burgundy)' }}>Admin - Ma Position</h1>
      <div style={{ padding: '20px', fontSize: '18px', background: 'var(--color-burgundy)', color: 'white', borderRadius: 'var(--radius)' }}>
        Suivi de position en direct activé
      </div>
      <div style={{ marginTop: '30px', padding: '20px', background: 'var(--color-paper-dark)', borderRadius: 'var(--radius)' }}>
        <p>Dernière position enregistrée :</p>
        {myPosition ? (
          <>
            <MapVisualizer latitude={myPosition?.lat ?? 0} longitude={myPosition?.lng ?? 0 } />
          </>
        ) : (
          <p>Aucune position envoyée pour le moment.</p>
        )}
      </div>
      <div style={{ marginTop: '30px', padding: '20px', background: 'var(--color-paper-dark)', borderRadius: 'var(--radius)' }}>
        <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={showGift}
            onChange={(e) => setShowGift(e.target.checked)}
          />
          Afficher cadeau ?
        </label>
        <button
          type="button"
          onClick={resetRadarQuest}
          style={{
            marginTop: '15px',
            padding: '8px 16px',
            background: '#ff5c5c',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--radius)',
            cursor: 'pointer'
          }}
        >
          Réinitialiser la quête du radar
        </button>
      </div>
    </div>
  );
}
