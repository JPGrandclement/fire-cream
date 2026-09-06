import { useEffect, useState } from "react";

const links = [
  { href: "/", label: "Accueil" },
  { href: "/timeline", label: "Timeline" },
];

export function NavCapsule() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState(links[0].href);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className={`nav-capsule${scrolled ? " nav-capsule--compact" : ""}`}>
      {links.map((link) => (
        <a
          key={link.href}
          href={link.href}
          className={active === link.href ? "active" : ""}
          onClick={() => setActive(link.href)}
        >
          {link.label}
        </a>
      ))}
    </nav>
  );
}
