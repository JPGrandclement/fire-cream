export interface Letter {
  id: string;
  title: string;
  unlockDate: string; // Format: "YYYY-MM-DDTHH:mm:ss"
  content: string;
  isLocked: boolean;
}

// Note : une lettre est verrouillée si sa date est dans le futur.
// Le champ `isLocked` sert de garde-fou manuel (toujours vrai si false, jamais forcé verrouillé si false).
export const letters: Letter[] = [
  {
    id: "letter-1",
    title: "Le premier mot",
    unlockDate: "2026-09-07T23:23:20",
    content: "C'est ici que tout a commencé, avec ce premier message envoyé un peu par hasard...",
    isLocked: false,
  },
  {
    id: "letter-2",
    title: "Souvenirs d'été",
    unlockDate: "2026-09-08T10:00:00", // Déblocage demain à 10h
    content: "Le soleil, la plage, et nous deux. Un souvenir gravé à jamais.",
    isLocked: true,
  },
  {
    id: "letter-3",
    title: "Un automne doux",
    unlockDate: "2026-09-09T18:30:00", // Déblocage après-demain à 18h30
    content: "Les feuilles tombent, mais notre amour reste plus fort que jamais.",
    isLocked: true,
  },
  {
    id: "letter-4",
    title: "Promesses d'avenir",
    unlockDate: "2026-10-01T09:00:00",
    content: "Une nouvelle année, de nouveaux projets, et toujours toi à mes côtés.",
    isLocked: true,
  },
];
