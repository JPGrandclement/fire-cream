import { Letter } from "../data/lettersData";
import { useLoveQuestStore } from "../store/useLoveQuestStore";

interface LetterModalProps {
  letter: Letter;
  onClose: () => void;
}

export function LetterModal({ letter, onClose }: LetterModalProps) {
  const markLetterAsRead = useLoveQuestStore((state) => state.markLetterAsRead);

  const handleClose = () => {
    markLetterAsRead(letter.id);
    onClose();
  };

  return (
    <div className="letter-modal-overlay" onClick={handleClose}>
      <div className="letter-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={handleClose}>×</button>
        <h2>{letter.title}</h2>
        <p className="date">{new Date(letter.unlockDate).toLocaleString("fr-FR", { timeZone: "Europe/Paris" })}</p>
        <div className="letter-content">
          {letter.content}
        </div>
        {letter.audioUrl && (
          <div className="letter-audio">
            <audio controls src={letter.audioUrl}>
              Votre navigateur ne supporte pas l'élément audio.
            </audio>
          </div>
        )}
      </div>
    </div>
  );
}
