export interface Letter {
  id: string;
  title: string;
  unlockDate: string; // Format: "YYYY-MM-DDTHH:mm:ss"
  content: string;
  audioUrl?: string; // Optionnel : URL du fichier audio
  lyrics?: string; // Optionnel : Paroles de la chanson
  imageUrl?: string; // Optionnel : URL de l'image
}

// Note : une lettre est verrouillée si sa date est dans le futur.
import { fireCreamLyrics } from "./lyrics";

export const letters: Letter[] = [
  {
    id: "letter-1",
    title: "Bon anniversaire Amour :)",
    unlockDate: "2026-09-08T00:00:00",
    content: "Ici, tu vas découvrir certaines choses... Faut encore être patiente ! Bonne nuit Amour :)",
  },
  {
    id: "letter-2",
    title: "Bonne journée :)",
    unlockDate: "2026-09-08T07:34:00", // Déblocage demain à 10h
    content: "Titre : Fire Cream",
    audioUrl: "musics/FireCream.mp3",
    lyrics: fireCreamLyrics,
  },
  {
    id: "letter-3",
    title: "Bon appétit",
    unlockDate: "2026-09-08T12:14:00", // Déblocage après-demain à 18h30
    content: "Envie d'une pâtisserie ? N'hésite pas... On sait jamais ce que la vie peut t'offrir.",
    imageUrl: "images/ephemere.png",
  },
  {
    id: "letter-4",
    title: "On va se raconter",
    unlockDate: "2026-09-08T18:00:00",
    content: "des salades. Un colis ?",
  },
  {
    id: "letter-5",
    title: "Encore une surprise !",
    unlockDate: "2026-09-08T22:34:00",
    content: "SECRET_CODE_REQUIRED",
  },
];
