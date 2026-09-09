import React, { useEffect, useState } from 'react';
import { getDistance } from '../lib/geolocation';
import { listenToOtherPosition } from '../lib/firebaseService';

export function VaultPage() {
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [isSleeping, setIsSleeping] = useState(false);
  const [isNear, setIsNear] = useState(false);
  const [checking, setChecking] = useState(false);
  const [otherPosition, setOtherPosition] = useState<{ lat: number, lng: number } | null>(null);

  useEffect(() => {
    listenToOtherPosition((pos) => setOtherPosition(pos));
  }, []);

  const errors = [
    "Pas encore... essaie autre chose !",
    "Toujours pas, c'est plus subtil que ça.",
    "Tu chauffes, mais non.",
    "Allez, tente un truc, n'importe quoi !",
    "Non, ce n'est pas la bonne clé.",
    "Essaie encore, le coffre résiste !",
    "Rien ne se passe... c'est frustrant, hein ?",
    "Tu es sûr de ton coup ?",
    "Le coffre est bien fermé, cherche mieux.",
    "Perdu ! Recommence."
  ];

  const handleTry = () => {
    const hour = new Date().getHours();
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    if (hour >= 0 && hour < 7 && newAttempts >= 15) {
      setIsSleeping(true);
      return;
    }

    const randomError = errors[Math.floor(Math.random() * errors.length)];
    setError(randomError);
  };

  const checkPosition = () => {
    if (!otherPosition) {
      setError("Position de l'autre non disponible.");
      return;
    }

    setChecking(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const distance = getDistance(latitude, longitude, otherPosition.lat, otherPosition.lng);
        
        if (distance < 50) {
          setIsNear(true);
          setError('');
        } else {
          setError(`Trop loin ! Tu es à ${Math.round(distance)} mètres.`);
        }
        setChecking(false);
      },
      () => {
        setError("Impossible d'obtenir ta position.");
        setChecking(false);
      }
    );
  };

  if (isSleeping) {
    return (
      <div className="vault-page-sleep" style={{ padding: '100px 20px', textAlign: 'center', animation: 'successFade 2s' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-burgundy)' }}>ZZzz...</h1>
        <p>Allez, va te coucher, le coffre est fatigué !</p>
        <img src="images/ciel.png" alt="Bonne nuit" style={{ width: '200px', marginTop: '20px' }} />
      </div>
    );
  }

  return (
    <div className="vault-page" style={{ padding: '100px 20px', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
      <div style={{ marginBottom: '30px' }}>
        <img src="images/tour.png" alt="Coffre-fort" style={{ width: '150px', height: 'auto', opacity: 0.8 }} />
      </div>
      <h1 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-burgundy)' }}>Le Coffre-Fort</h1>
      <div style={{ padding: '20px', border: '2px solid var(--color-burgundy)', borderRadius: 'var(--radius)', background: 'var(--color-paper-dark)' }}>
        <p style={{ margin: '0 0 20px 0', fontWeight: 'bold' }}>Défi de proximité</p>
        <button onClick={checkPosition} disabled={checking} style={{ padding: '10px 20px', cursor: 'pointer', background: 'var(--color-burgundy)', color: 'white', border: 'none', borderRadius: 'var(--radius)' }}>
          {checking ? "Vérification..." : "Vérifier ma position"}
        </button>
        {isNear && <button style={{ marginLeft: '10px', padding: '10px 20px', background: 'green', color: 'white', border: 'none', borderRadius: 'var(--radius)' }}>Débloquer !</button>}
        {error && <p style={{ marginTop: '20px', color: 'var(--color-burgundy)' }}>{error}</p>}
      </div>
    </div>
  );
}
