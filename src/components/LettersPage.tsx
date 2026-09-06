import { useState } from "react";
import { letters, Letter } from "../data/lettersData";
import { Envelope } from "./Envelope";
import { LetterModal } from "./LetterModal";

export function LettersPage() {
  const [selectedLetter, setSelectedLetter] = useState<Letter | null>(null);

  return (
    <section className="letters-page">
      <h1 className="reveal-on-scroll">Lettres Cachées</h1>
      <div className="envelopes-grid">
        {letters.map((letter) => (
          <Envelope 
            key={letter.id} 
            letter={letter} 
            onOpen={setSelectedLetter} 
          />
        ))}
      </div>

      {selectedLetter && (
        <LetterModal 
          letter={selectedLetter} 
          onClose={() => setSelectedLetter(null)} 
        />
      )}
    </section>
  );
}
