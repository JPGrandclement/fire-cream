import { Letter } from "../data/lettersData";

interface LetterModalProps {
  letter: Letter;
  onClose: () => void;
}

export function LetterModal({ letter, onClose }: LetterModalProps) {
  return (
    <div className="letter-modal-overlay" onClick={onClose}>
      <div className="letter-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>×</button>
        <h2>{letter.title}</h2>
        <p className="date">{letter.date}</p>
        <div className="letter-content">
          {letter.content}
        </div>
      </div>
    </div>
  );
}
