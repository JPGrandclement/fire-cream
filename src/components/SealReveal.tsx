import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export function SealReveal({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <AnimatePresence mode="wait">
      {!open ? (
        <motion.div
          key="seal-wrap"
          style={{
            height: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "24px",
          }}
        >
          <motion.button
            className="seal"
            onClick={() => setOpen(true)}
            whileTap={{ scale: 0.92 }}
            exit={{
              scale: 1.4,
              opacity: 0,
              transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
            }}
            aria-label="Ouvrir la lettre"
            data-cursor="Ouvrir"
          >
            Ouvrir
          </motion.button>
          <motion.p
            className="seal-hint"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            exit={{ opacity: 0 }}
          >
            une lettre t'attend
          </motion.p>
        </motion.div>
      ) : (
        <motion.div
          key="content"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
