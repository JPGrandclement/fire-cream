import React, { useState } from 'react';

export function VaultPage() {
  const [challenges, setChallenges] = useState([false, false, false]);

  const completeChallenge = (index: number) => {
    const newChallenges = [...challenges];
    newChallenges[index] = true;
    setChallenges(newChallenges);
  };

  const allCompleted = challenges.every((c) => c);

  return (
    <div className="vault-page" style={{ padding: '100px 20px', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-burgundy)' }}>Le Coffre-Fort</h1>
      {!allCompleted ? (
        <div className="challenges" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {challenges.map((completed, index) => (
            <div key={index} className={`challenge ${completed ? 'completed' : ''}`} style={{ padding: '20px', border: '2px solid var(--color-burgundy)', borderRadius: 'var(--radius)', background: 'var(--color-paper-dark)' }}>
              <p style={{ margin: '0 0 10px 0', fontWeight: 'bold' }}>Défi {index + 1}</p>
              {!completed && (
                <button onClick={() => completeChallenge(index)} style={{ padding: '10px 20px', cursor: 'pointer', background: 'var(--color-burgundy)', color: 'white', border: 'none', borderRadius: 'var(--radius)' }}>Relever le défi</button>
              )}
              {completed && <p style={{ margin: 0, color: 'var(--color-ink-soft)' }}>Défi validé !</p>}
            </div>
          ))}
        </div>
      ) : (
        <div className="success" style={{ padding: '40px', border: '4px solid var(--color-gold-line)', borderRadius: 'var(--radius)', background: 'var(--color-white)' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-burgundy)' }}>Félicitations ! Le coffre est ouvert.</h2>
          
        </div>
      )}
    </div>
  );
}
