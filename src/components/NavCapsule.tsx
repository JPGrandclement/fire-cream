import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { navigateWithTransition } from "../lib/viewTransition";
import { useLoveQuestStore } from "../store/useLoveQuestStore";

const links = [
  { href: "/", label: "Accueil" },
  { href: "/timeline", label: "Timeline" },
  { href: "/lettres", label: "Lettres" },
  { href: "/message-du-jour", label: "Message" },
];

export function NavCapsule() {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isVaultUnlocked = useLoveQuestStore((state) => state.isVaultUnlocked);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleClick = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    if (location.pathname === href) return;
    navigateWithTransition(() => navigate(href));
  };

  return (
    <nav className={`nav-capsule${scrolled ? " nav-capsule--compact" : ""}`}>
      {links.map((link) => (
        <a
          key={link.href}
          href={link.href}
          data-cursor="Voir"
          className={location.pathname === link.href ? "active" : ""}
          onClick={(e) => handleClick(e, link.href)}
        >
          {link.label}
        </a>
      ))}
    </nav>
  );
}
