import React, { useState, useEffect } from 'react';
import { updateMyPosition, listenToMyPosition } from '../lib/firebaseService';
import { useLoveQuestStore } from '../store/useLoveQuestStore';

import MapVisualizer from './MapVisualizer';

export function AdminLocationPage() {
  const [status, setStatus] = useState('');
  const [myPosition, setMyPosition] = useState<{ lat: number, lng: number } | null>(null);
  const [targetPos, setTargetPos] = useState<{ lat: number, lng: number } | null>(null);
  const { showGift, setShowGift, resetRadarQuest } = useLoveQuestStore();

  useEffect(() => {
    const unsubscribe = listenToMyPosition((pos) => {
      setTargetPos({ lat: pos.lat, lng: pos.lng });
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

  const distance = myPosition && targetPos
    ? Math.sqrt(Math.pow(myPosition.lat - targetPos.lat, 2) + Math.pow(myPosition.lng - targetPos.lng, 2)) * 111
    : null;

  return (
    <div style={{ padding: '50px', textAlign: 'center', fontFamily: 'var(--font-body)' }}>
      <h1 style={{ color: 'var(--color-burgundy)' }}>Admin - Ma Position</h1>
      
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
            <span style={{ color: '#9adfb0' }}>Ma position :</span> {myPosition ? `${myPosition.lat.toFixed(5)}, ${myPosition.lng.toFixed(5)}` : 'Recherche...'}
          </p>
          <p style={{ margin: 0 }}>
            <span style={{ color: '#9adfb0' }}>Position cible :</span> {targetPos ? `${targetPos.lat.toFixed(5)}, ${targetPos.lng.toFixed(5)}` : 'En attente...'}
          </p>
          <p style={{ margin: 0 }}>
            <span style={{ color: '#9adfb0' }}>Distance :</span> {distance !== null ? `${distance.toFixed(2)} km` : 'Calcul en cours...'}
          </p>
        </div>
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
