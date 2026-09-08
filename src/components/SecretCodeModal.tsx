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
    if (input.toLowerCase() === correctCode.toLowerCase()) {
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
          <h3>Entrez le code secret</h3>
          <p>Pour accéder à la surprise, entre le code secret ! chuuut</p>
          <input
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setError(false);
            }}
            placeholder="Code..."
          />
          <button type="submit">Valider</button>
          {error && <p className="error">Code incorrect, essaie encore !</p>}
        </form>
      )}
    </div>
  );
}
