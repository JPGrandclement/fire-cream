import React, { useState, useEffect } from 'react';
import { updateMyPosition, listenToMyPosition } from '../lib/firebaseService';

import { testConnection } from '../lib/firebase';
import MapVisualizer from './MapVisualizer';

export function AdminLocationPage() {
  const [status, setStatus] = useState('');
  const [myPosition,  setMyPosition] = useState<{ lat: number, lng: number } | null>(null);

  useEffect(() => {
    testConnection();
    listenToMyPosition((pos) => {
      setStatus(`Position enregistrée : ${pos.lat.toFixed(4)}, ${pos.lng.toFixed(4)}`);
    });
  }, []);

  const sendLocation = async () => {
    setStatus('Envoi en cours...');
    try {
      const { getCurrentPosition } = await import('../lib/geolocation');
      const position = await getCurrentPosition();
      const { latitude, longitude } = position.coords;
      updateMyPosition(latitude, longitude);
      setMyPosition({ lat: latitude, lng: longitude });
      setStatus(`Position envoyée : ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
    } catch (error: any) {
      if (error.code === 2) {
        setStatus('Erreur : Position indisponible. Vérifiez vos paramètres de localisation ou testez sur mobile.');
      } else {
        setStatus(`Erreur : ${error.message || 'Impossible de récupérer la position'}`);
      }
    }
  };

  return (
    <div style={{ padding: '50px', textAlign: 'center', fontFamily: 'var(--font-body)' }}>
      <h1 style={{ color: 'var(--color-burgundy)' }}>Admin - Ma Position</h1>
      <button onClick={sendLocation} style={{ padding: '20px', fontSize: '18px', cursor: 'pointer', background: 'var(--color-burgundy)', color: 'white', border: 'none', borderRadius: 'var(--radius)' }}>
        Envoyer ma position actuelle
      </button>
      <div style={{ marginTop: '30px', padding: '20px', background: 'var(--color-paper-dark)', borderRadius: 'var(--radius)' }}>
        <p>Dernière position enregistrée :</p>
        {myPosition ? (
          <>
            <p style={{ fontWeight: 'bold', color: 'var(--color-ink)' }}>{status}</p>
            <MapVisualizer latitude={myPosition?.lat ?? 0} longitude={myPosition?.lng ?? 0 } />
          </>
        ) : (
          <p>Aucune position envoyée pour le moment.</p>
        )}
      </div>
    </div>
  );
}
