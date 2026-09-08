import React, { useState } from 'react';

export function VaultPage() {
  const [error, setError] = useState('');
  const errors = [
    "Pas encore... essaie autre chose !",
    "Toujours pas, c'est plus subtil que ça.",
    "Tu chauffes, mais non.",
    "Allez, tente un truc, n'importe quoi !",
    "Non, ce n'est pas la bonne clé."
  ];

  const handleTry = () => {
    const randomError = errors[Math.floor(Math.random() * errors.length)];
    setError(randomError);
  };

  return (
    <div className="vault-page" style={{ padding: '100px 20px', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
      <div style={{ marginBottom: '30px' }}>
        <img src="images/tour.png" alt="Coffre-fort" style={{ width: '150px', height: 'auto', opacity: 0.8 }} />
      </div>
      <h1 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-burgundy)' }}>Le Coffre-Fort</h1>
      <div style={{ padding: '20px', border: '2px solid var(--color-burgundy)', borderRadius: 'var(--radius)', background: 'var(--color-paper-dark)' }}>
        <p style={{ margin: '0 0 20px 0', fontWeight: 'bold' }}>Défi unique</p>
        <button onClick={handleTry} style={{ padding: '10px 20px', cursor: 'pointer', background: 'var(--color-burgundy)', color: 'white', border: 'none', borderRadius: 'var(--radius)' }}>Tente un truc</button>
        {error && <p style={{ marginTop: '20px', color: 'var(--color-burgundy)' }}>{error}</p>}
      </div>
    </div>
  );
}
