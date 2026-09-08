import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLoveQuestStore } from '../store/useLoveQuestStore';

interface SecretCodeModalProps {
  onSuccess: () => void;
  correctCode: string;
}

export function SecretCodeModal({ onSuccess, correctCode }: SecretCodeModalProps) {
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const [opening, setOpening] = useState(false);

  const unlockVault = useLoveQuestStore((state) => state.unlockVault);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedInput = input
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, "");
    const normalizedCode = correctCode
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, "");

    if (normalizedInput === normalizedCode) {
      setSuccess(true);
      unlockVault();
      setTimeout(() => {
        setOpening(true);
        setTimeout(() => {
          onSuccess();
          navigate('/vault');
        }, 1500);
      }, 1000);
    } else {
      setError(true);
    }
  };

  return (
    <div className={`secret-code-modal ${success ? 'success-animation' : ''} ${opening ? 'vault-opening' : ''}`}>
      {success ? (
        <div className="success-message">
          <h3>Code validé !</h3>
          <p>Le coffre s'ouvre...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <h3>La Charade</h3>
          <div style={{ textAlign: 'left', marginBottom: '20px', fontSize: '0.9em', lineHeight: '1.6' }}>
            <p>Mon premier est ce qu'on fait quand on chante avec son cul</p>
            <p>Mon deuxième est ce qu'on vise à la pétanque</p>
            <p>Mon troisième est là où on glisse les bulletins de vote (à gauche)</p>
            <p><strong>Mon tout est ce que t'es !</strong></p>
          </div>
          <input
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setError(false);
            }}
            placeholder="Réponse..."
          />
          <button type="submit">Valider</button>
          {error && <p className="error">Code incorrect, essaie encore !</p>}
        </form>
      )}
    </div>
  );
}
