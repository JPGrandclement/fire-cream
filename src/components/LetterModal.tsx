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
        <p className="date">{letter.date}</p>
        <div className="letter-content">
          {letter.content}
        </div>
      </div>
    </div>
  );
}
