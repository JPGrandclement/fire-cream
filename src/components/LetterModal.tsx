import { Letter } from "../data/lettersData";
import { useLoveQuestStore } from "../store/useLoveQuestStore";
import { SecretCodeModal } from "./SecretCodeModal";

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
      <div
        className="letter-modal"
        onClick={(e) => e.stopPropagation()}
        onWheel={(e) => e.stopPropagation()}
      >
        <button className="close-btn" onClick={handleClose}>×</button>
        <h2>{letter.title}</h2>
        <p className="date">{new Date(letter.unlockDate).toLocaleString("fr-FR", { timeZone: "Europe/Paris" })}</p>
        {letter.imageUrl && (
          <div className="letter-image">
            <img src={letter.imageUrl} alt={letter.title} />
          </div>
        )}
        <div className="letter-content">
          {letter.content === "SECRET_CODE_REQUIRED" ? (
            <SecretCodeModal
              correctCode="pète burne"
              onSuccess={() => alert("Bien joué !")}
            />
          ) : (
            letter.content
          )}
        </div>
        {letter.audioUrl && (
          <div className="letter-audio">
            <audio controls src={letter.audioUrl}>
              Votre navigateur ne supporte pas l'élément audio.
            </audio>
          </div>
        )}
        {letter.lyrics && (
          <div className="letter-lyrics">
            <h4>Paroles (telles que je les ai écrites avant de générer quoi que ce soit. J'ai généré à partir de ça.)</h4>
            <p>{letter.lyrics}</p>
          </div>
        )}
      </div>
    </div>
  );
}
