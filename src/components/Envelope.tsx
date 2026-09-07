import { Letter } from "../data/lettersData";
import { useLoveQuestStore } from "../store/useLoveQuestStore";

interface EnvelopeProps {
  letter: Letter;
  onOpen: (letter: Letter) => void;
}

export function Envelope({ letter, onOpen }: EnvelopeProps) {
  const readLetters = useLoveQuestStore((state) => state.readLetters);
  const isRead = readLetters.includes(letter.id);
  
  // Une lettre est débloquée si la date est passée ou si elle n'est pas verrouillée
  const isLocked = letter.isLocked && new Date(letter.unlockDate) > new Date();

  return (
    <div
      className={`envelope ${isLocked ? "locked" : "unlocked"} ${isRead ? "read" : ""}`}
      onClick={() => !isLocked && onOpen(letter)}
      data-cursor={isLocked ? "Verrouillé" : "Ouvrir"}
    >
      <div className="envelope-flap" />
      <div className="envelope-body">
        <h3>{letter.title}</h3>
        <p>{new Date(letter.unlockDate).toUTCString().replace(" GMT", "")}</p>
      </div>
    </div>
  );
}
