import React, { useState } from 'react';

export function VaultPage() {
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [isSleeping, setIsSleeping] = useState(false);

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

  if (isSleeping) {
    return (
      <div className="vault-page-sleep" style={{ padding: '100px 20px', textAlign: 'center', animation: 'successFade 2s' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-burgundy)' }}>ZZzz...</h1>
        <p>Allez, va te coucher, le coffre est fatigué !</p>
        <img src="images/dodo.png" alt="Bonne nuit" style={{ width: '200px', marginTop: '20px' }} />
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
        <p style={{ margin: '0 0 20px 0', fontWeight: 'bold' }}>Chiottes ! Encore un défi ! Celui-là sera plus compliqué... Tu risques de devoir attendre un moment avant de comprendre. Peut-être qu'en plus d'actions à faire sur le site, il y a des choses à faire dans la vie pour y arriver ;) (Je t'aime amour)</p>
        <button onClick={handleTry} style={{ padding: '10px 20px', cursor: 'pointer', background: 'var(--color-burgundy)', color: 'white', border: 'none', borderRadius: 'var(--radius)' }}>Tente un truc</button>
        {error && <p style={{ marginTop: '20px', color: 'var(--color-burgundy)' }}>{error}</p>}
      </div>
    </div>
  );
}
