import { motion } from "framer-motion";

export function Hero() {
  return (
    <section className="hero">
      <motion.h1
        initial={{ opacity: 0, y: 18, filter: "blur(6px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
      >
        Notre histoire
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        Une phrase d'intro à personnaliser — le ton que tu veux donner à la quête.
      </motion.p>
    </section>
  );
}
