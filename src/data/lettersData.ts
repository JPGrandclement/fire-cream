export interface Letter {
  id: string;
  title: string;
  date: string;
  content: string;
  isLocked: boolean;
}

export const letters: Letter[] = [
  {
    id: "letter-1",
    title: "Le premier mot",
    date: "2023-03-01",
    content: "C'est ici que tout a commencé, avec ce premier message envoyé un peu par hasard...",
    isLocked: false,
  },
  {
    id: "letter-2",
    title: "Souvenirs d'été",
    date: "2023-07-15",
    content: "Le soleil, la plage, et nous deux. Un souvenir gravé à jamais.",
    isLocked: true,
  },
  {
    id: "letter-3",
    title: "Un automne doux",
    date: "2023-11-20",
    content: "Les feuilles tombent, mais notre amour reste plus fort que jamais.",
    isLocked: true,
  },
  {
    id: "letter-4",
    title: "Promesses d'avenir",
    date: "2024-01-01",
    content: "Une nouvelle année, de nouveaux projets, et toujours toi à mes côtés.",
    isLocked: true,
  },
];
