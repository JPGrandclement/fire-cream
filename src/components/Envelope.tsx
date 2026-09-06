import { useState } from "react";
import { Letter } from "../data/lettersData";

interface EnvelopeProps {
  letter: Letter;
  onOpen: (letter: Letter) => void;
}

export function Envelope({ letter, onOpen }: EnvelopeProps) {
  return (
    <div 
      className={`envelope ${letter.isLocked ? "locked" : "unlocked"}`}
      onClick={() => !letter.isLocked && onOpen(letter)}
      data-cursor={letter.isLocked ? "Verrouillé" : "Ouvrir"}
    >
      <div className="envelope-flap" />
      <div className="envelope-body">
        <h3>{letter.title}</h3>
        <p>{letter.date}</p>
      </div>
    </div>
  );
}
