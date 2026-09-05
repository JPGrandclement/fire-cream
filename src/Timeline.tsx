import React from 'react';
import { motion } from 'framer-motion';

const timelineData = [
  { id: 1, title: "La rencontre", date: "2023", description: "Le début de tout." },
  { id: 2, title: "Premier voyage", date: "2024", description: "Des souvenirs inoubliables." },
  { id: 3, title: "Aujourd'hui", date: "2025", description: "Plus forts que jamais." },
];

export function Timeline() {
  return (
    <div className="route">
      {timelineData.map((step) => (
        <motion.div 
          key={step.id} 
          className="route-step"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h3>{step.title} <small style={{ fontSize: '0.8em', color: 'var(--color-thread)' }}>({step.date})</small></h3>
          <p>{step.description}</p>
        </motion.div>
      ))}
    </div>
  );
}
