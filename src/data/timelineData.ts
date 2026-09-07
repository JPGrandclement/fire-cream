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
    fullContent: "Dans ce camping, nos vies ont basculé. D'abord pour un été, pour quelques mois... Mais pour toujours en fait.",
    image: "/fire-cream/images/rencontre.png",
  },
  {
    id: "step-2",
    date: "20 Juin 2026",
    title: "Recontact",
    description: "Le message le plus important de ma vie.",
    fullContent: "Ce jour là ",
    image: "/fire-cream/images/message.png",
  },
  {
    id: "step-3",
    date: "25 Juin 2026",
    title: "La première fois",
    description: "qu'on se revoit. Qu'on se voit aussi...",
    fullContent: "J'ai passé une journée horrible, avec une migraine terrible. Et pourtant, cette journée a fini par être la plus romantique et douce de ma vie. Je me rappellerais éternellement, la sensation de la première fois. Avant de se mettre devant la fenêtre...",
    image: "/fire-cream/images/robeverte.jpg",
  },
  {
    id: "step-4",
    date: "2 Juillet 2026",
    title: "La tour",
    description: "\"Je me suis toujours dit que celui qui m'emmènera en haut de la tour, ce sera le bon.\"",
    fullContent: "Même le ciel était avec nous.",
    image: "/fire-cream/images/ciel.png",
  },
  {
    id: "step-5",
    date: "<3",
    title: "A suivre",
    description: "",
    fullContent: "Je t'aime.",
    image: "/fire-cream/images/tour.png",
  },
];
