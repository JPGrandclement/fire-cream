import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { ContextualCursor } from "./components/ContextualCursor";
import { NavCapsule } from "./components/NavCapsule";
import { SealReveal } from "./components/SealReveal";
import { Hero } from "./components/Hero";
import { Timeline } from "./components/Timeline";
import { LettersPage } from "./components/LettersPage";
import { DailyMessagePage } from "./components/DailyMessagePage";
import { VaultPage } from "./components/VaultPage";
import { RadarPage } from "./components/RadarPage";
import { AdminLocationPage } from "./components/AdminLocationPage";
import { useLenis } from "./lib/useLenis";

const Home = () => (
  <SealReveal>
    <Hero />
  </SealReveal>
);

export default function App() {
  useLenis();

  return (
    <Router>
      <div className="layout-container">
        <ContextualCursor />
        <NavCapsule />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/timeline" element={<Timeline />} />
            <Route path="/lettres" element={<LettersPage />} />
            <Route path="/message-du-jour" element={<DailyMessagePage />} />
            <Route path="/vault" element={<VaultPage />} />
            <Route path="/radar" element={<RadarPage />} />
            <Route path="/admin-location" element={<AdminLocationPage />} />
          </Routes>
        </main>
        <footer style={{ position: 'fixed', bottom: 0, right: 0, opacity: 0.1 }}>
          <a href="/vault">V</a>
          <a href="/radar">R</a>
          <a href="/admin-location">A</a>
        </footer>
      </div>
    </Router>
  );
}

