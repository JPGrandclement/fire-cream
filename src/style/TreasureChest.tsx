import React, { useState } from 'react';
import './Chest.css';

// 1. On définit l'interface pour les propriétés (Props)
interface TreasureChestProps {
  message?: string; // Le '?' signifie que la prop est optionnelle
  itemIcon?: React.ReactNode;
}

// 2. On type le composant avec React.FC (Function Component) et notre interface
const TreasureChest: React.FC<TreasureChestProps> = ({ 
  message = "Bravo, tu as ouvert le coffre ! 🎉", // Valeur par défaut
  itemIcon = "💎" // Valeur par défaut
}) => {
  // 3. On type l'état (inutile de le faire explicitement pour un booléen car TS le déduit, mais c'est une bonne pratique)
  const [isOpen, setIsOpen] = useState<boolean>(false);

  // 4. On type la fonction de retour (void = ne retourne rien)
  const handleOpenChest = (): void => {
    if (!isOpen) {
      setIsOpen(true);
    }
  };

  return (
    <div className="treasure-wrapper">
      {isOpen && (
        <div className="success-message">
          {message}
        </div>
      )}

      <div 
        className={`chest-container ${isOpen ? 'is-open' : ''}`} 
        onClick={handleOpenChest}
      >
        <div className="item">{itemIcon}</div>
        <div className="chest">
          {isOpen ? '🎁' : '📦'}
        </div>
      </div>

      {!isOpen && (
        <p className="hint">Cliquez sur la boîte pour l'ouvrir</p>
      )}
    </div>
  );
};

export default TreasureChest;