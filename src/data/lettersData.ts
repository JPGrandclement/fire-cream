export interface Letter {
  id: string;
  title: string;
  date: string;
  content: string;
  isLocked: boolean;
}

// Note : une lettre est verrouillée si sa date est dans le futur.
// Le champ `isLocked` sert de garde-fou manuel (toujours vrai si false, jamais forcé verrouillé si false).
export const letters: Letter[] = [
  {
    id: "letter-1",
    title: "Le premier mot",
    date: "2025-01-01",
    content: "C'est ici que tout a commencé, avec ce premier message envoyé un peu par hasard...",
    isLocked: false,
  },
  {
    id: "letter-2",
    title: "Souvenirs d'été",
    date: "2026-12-25",
    content: "Le soleil, la plage, et nous deux. Un souvenir gravé à jamais.",
    isLocked: true,
  },
  {
    id: "letter-3",
    title: "Un automne doux",
    date: "2027-03-01",
    content: "Les feuilles tombent, mais notre amour reste plus fort que jamais.",
    isLocked: true,
  },
  {
    id: "letter-4",
    title: "Promesses d'avenir",
    date: "2027-06-01",
    content: "Une nouvelle année, de nouveaux projets, et toujours toi à mes côtés.",
    isLocked: true,
  },
];
