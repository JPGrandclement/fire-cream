// Contenu de la Timeline — modifiez librement ces entrées.
// Chaque étape apparaît dans l'ordre, reliée par le fil de la quête.
export interface TimelineStep {
  id: string;
  date: string;
  title: string;
  description: string;
  fullContent: string;
  image?: string;
}

export const timelineSteps: TimelineStep[] = [
  {
    id: "step-1",
    date: "Août 2009",
    title: "Oléron",
    description: "La naissance de l'amour.",
    fullContent: "C'était un mardi pluvieux, mais dans ce café, le soleil semblait s'être invité. Une discussion qui n'en finissait plus, et cette sensation étrange de se connaître depuis toujours.",
    image: "/images/rencontre.png",
  },
  {
    id: "step-2",
    date: "20 Juin 2026",
    title: "Recontact",
    description: "Le message le plus important de ma vie.",
    fullContent: "Ce jour là ",
    image: "/images/message.png",
  },
  {
    id: "step-3",
    date: "Septembre 2023",
    title: "Le premier concert",
    description: "La musique dans la peau.",
    fullContent: "Nos voix qui se mêlent sur nos chansons préférées. Un moment suspendu où le monde extérieur n'existait plus.",
  },
  {
    id: "step-4",
    date: "Janvier 2024",
    title: "Un chez-nous",
    description: "Les clés du bonheur.",
    fullContent: "Le premier appartement, les cartons à déballer, et cette fierté de construire notre propre cocon, brique par brique.",
  },
  {
    id: "step-5",
    date: "Août 2024",
    title: "L'été des sommets",
    description: "Plus haut, plus fort.",
    fullContent: "Une randonnée épique, des paysages à couper le souffle, et la preuve que nous pouvons gravir n'importe quelle montagne ensemble.",
  },
  {
    id: "step-6",
    date: "Décembre 2024",
    title: "Noël en famille",
    description: "La magie des fêtes.",
    fullContent: "Partager nos traditions, en créer de nouvelles, et sentir que nos deux familles ne font plus qu'une.",
  },
  {
    id: "step-7",
    date: "Mai 2025",
    title: "Aujourd'hui",
    description: "Le début de tout.",
    fullContent: "Plus forts, plus complices, plus sûrs — et encore tant de pages à écrire ensemble. Ce n'est que le début de notre plus belle aventure.",
  },
];
