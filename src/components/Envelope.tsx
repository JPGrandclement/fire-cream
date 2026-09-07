import { useState, useEffect } from "react";
import { Letter } from "../data/lettersData";
import { useLoveQuestStore } from "../store/useLoveQuestStore";

interface EnvelopeProps {
  letter: Letter;
  onOpen: (letter: Letter) => void;
}

export function Envelope({ letter, onOpen }: EnvelopeProps) {
  const readLetters = useLoveQuestStore((state) => state.readLetters);
  const isRead = readLetters.includes(letter.id);
  
  // État local pour forcer le re-rendu quand la date de déblocage est atteinte
  const [isLocked, setIsLocked] = useState(new Date(letter.unlockDate) > new Date());

  useEffect(() => {
    const checkLock = () => {
      const locked = new Date(letter.unlockDate) > new Date();
      if (locked !== isLocked) {
        setIsLocked(locked);
      }
    };

    // Vérifier toutes les 10 secondes
    const interval = setInterval(checkLock, 10000);
    return () => clearInterval(interval);
  }, [letter.unlockDate, isLocked]);

  return (
    <div 
      className={`envelope ${isLocked ? "locked" : "unlocked"} ${isRead ? "read" : ""}`}
      onClick={() => !isLocked && onOpen(letter)}
      data-cursor={isLocked ? "Verrouillé" : "Ouvrir"}
    >
      <div className="envelope-flap" />
      <div className="envelope-body">
        <h3>{letter.title}</h3>
        <p>{new Date(letter.unlockDate).toLocaleString("fr-FR", { timeZone: "Europe/Paris" })}</p>
      </div>
    </div>
  );
}
