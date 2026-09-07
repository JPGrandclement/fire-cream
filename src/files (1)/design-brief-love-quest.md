---
render_with_liquid: false
---

# 🎨 Design Brief V2 — "Love Quest" (niveau premium / signature)

À copier-coller dans ton prompt à Gemini Flash. Version plus poussée : moins "carte de Saint-Valentin", plus "site d'agence créative haut de gamme qui parle d'amour".

---

## 1. Trois directions possibles (choisis celle qui te parle, ou donne les 3 à Gemini et laisse-le trancher)

### A. "Nuit de Velours" — luxe sombre, cinématique
Fond quasi noir bordeaux, or qui brille, ombres profondes, ambiance "bijouterie / film noir romantique". Très contrasté, très dramatique.

### B. "Papier & Lumière" — éditorial, presse mode
Fond crème/papier légèrement texturé (grain), encre bordeaux, typographie de magazine haut de gamme (genre Vogue). Beaucoup de blanc, mise en page aérée, une seule touche de couleur forte.

### C. "Old Money Romance" — luxe discret
Palette sourde (sauge, crème, bordeaux mat, pas de doré criard), serif italique, animations très lentes et retenues. Rien ne crie, tout chuchote.

👉 Pour un projet perso pour ta copine, **B ou C** rendent souvent plus "waouh, ça a l'air pro" que A qui peut vite faire "template".

---

## 2. Palette (exemple sur la direction B — Papier & Lumière)

```css
:root {
  --color-paper: #f7f2ec;        /* fond principal, papier crème */
  --color-paper-dark: #efe6da;   /* fond secondaire */
  --color-ink: #2a1a1f;          /* texte principal, encre presque noire */
  --color-burgundy: #7a2333;     /* accent fort, CTA, liens */
  --color-burgundy-soft: #b5606f;/* accent doux */
  --color-gold-line: #c9a05c;    /* filets, séparateurs, détails */
  --color-white: #fffaf5;

  --shadow-card: 0 20px 60px rgba(42,26,31,0.12);
  --shadow-hover: 0 30px 80px rgba(122,35,51,0.2);
  --radius: 4px; /* éditorial = angles presque droits, pas de gros radius */
}
```

*(dis à Gemini d'adapter cette palette à la direction A ou C si tu préfères — donne-lui juste le nom de la direction choisie)*

---

## 3. Typographie (le vrai facteur "ça a l'air cher")

- **Titre principal / accroche** : `"Fraunces"` en italique, graisse variable (light pour le corps, bold pour les mots clés) — cette police *seule* change complètement la perception de qualité.
- **Sous-titres** : `"Cormorant Garamond"` ou `"Canela"` si dispo.
- **Corps de texte / UI** : `"Neue Montreal"` ou à défaut `"Inter"` avec `letter-spacing: -0.01em`.
- Un seul mot par écran en italique serif géant (60-90px) comme signature visuelle — c'est LA technique la plus utilisée par les sites primés Awwwards en ce moment.

```css
.hero-word { font-family: "Fraunces", serif; font-style: italic; font-size: clamp(48px, 8vw, 96px); font-weight: 300; }
```

---

## 4. Effets avancés (le "chiadé" que tout le monde ne fait pas)

### Grain / texture papier (donne un côté tangible, premium)
```css
.grain::before {
  content: "";
  position: fixed; inset: 0; z-index: 999; pointer-events: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E");
  opacity: 0.035; mix-blend-mode: overlay;
}
```

### Curseur personnalisé (un petit point qui suit la souris avec un léger délai)
```js
// dans App.tsx, avec framer-motion
const [pos, setPos] = useState({x:0,y:0});
useEffect(() => {
  const move = e => setPos({x: e.clientX, y: e.clientY});
  window.addEventListener("mousemove", move);
  return () => window.removeEventListener("mousemove", move);
}, []);
// <motion.div className="cursor-dot" animate={{x: pos.x, y: pos.y}} transition={{type:"spring", damping:25, stiffness:200}} />
```

### Boutons "magnétiques" (le bouton est légèrement attiré par le curseur)
Effet classique des sites d'agences — quand la souris s'approche d'un bouton, il se décale de quelques px vers elle. Demande à Gemini d'implémenter ça avec `onMouseMove` + calcul de distance relative au centre du bouton, `transform: translate()`.

### Révélation au scroll (kinetic typography)
Chaque titre apparaît mot par mot ou lettre par lettre au scroll, avec un léger décalage (`stagger`). Avec **Framer Motion** :
```jsx
<motion.h1
  initial={{ opacity: 0, y: 40 }}
  whileInView={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
  viewport={{ once: true }}
>
  Ton titre
</motion.h1>
```

### Scroll fluide
Ajoute **Lenis** (`npm install lenis`) pour un défilement "soyeux" au lieu du scroll natif brut — ça change complètement la sensation de navigation.

### Transition d'écran façon rideau
Entre deux étapes de la quête : un panneau plein écran (couleur burgundy ou gold-line) qui balaie l'écran façon rideau de théâtre, plutôt qu'un simple fade.

### Loader d'intro
Un cœur en SVG qui se dessine trait par trait (`stroke-dasharray` / `stroke-dashoffset` animés) avant que le contenu apparaisse — bien plus élégant qu'un spinner.

### Cartes avec léger tilt 3D au survol
`npm install react-parallax-tilt` — les cartes de la quête s'inclinent légèrement en suivant la souris, avec une ombre qui bouge en conséquence.

---

## 5. Stack technique à demander à Gemini

```
npm install framer-motion lenis react-parallax-tilt
```

- **framer-motion** → toutes les animations (reveal au scroll, transitions, curseur)
- **lenis** → scroll fluide
- **react-parallax-tilt** → effet 3D sur les cartes

---

## 6. Prompt prêt à coller pour Gemini Flash (version chiadée)

```
Contexte : projet React + Vite + TypeScript (App.tsx, index.css). 
Direction artistique : [choisis A / B / C ci-dessus, ex "Papier & Lumière — éditorial luxe"].

Palette exacte à utiliser : [colle la section 2]
Typographie : Fraunces (titres, italique, variable weight) + Inter (corps de texte). 
Un mot-clé par section affiché en très grand, italique, serif, comme signature visuelle.

Effets à intégrer :
1. Overlay de grain/texture très léger sur tout le site (opacity ~0.035, mix-blend-mode overlay)
2. Scroll fluide via la librairie lenis
3. Animations de révélation au scroll avec framer-motion (whileInView, stagger sur les titres)
4. Boutons avec effet magnétique (attirés légèrement par le curseur)
5. Cartes avec léger tilt 3D au survol (react-parallax-tilt)
6. Un loader d'intro avec un cœur SVG qui se dessine (stroke animation) avant l'affichage du contenu
7. Transition en "rideau" plein écran entre les étapes de la quête, pas de simple fade

Installe et utilise : framer-motion, lenis, react-parallax-tilt.
Réécris index.css avec les tokens en variables CSS, et adapte App.tsx pour intégrer 
tous ces effets de façon cohérente et fluide, sans surcharge (le raffinement vient 
de la retenue, pas de l'accumulation d'effets).
```

---

## 7. Le conseil qui fait toute la différence
Dis explicitement à Gemini : **"le raffinement vient de la sobriété, pas de l'accumulation"** — sinon il a tendance à tout mettre en même temps (confettis + particules + gradient animé + grain + curseur...) et ça devient chargé au lieu de classe. Un ou deux effets signature bien exécutés > dix effets moyens.

Colle-lui aussi 1-2 captures d'écran de référence (Awwwards.com, filtre "Site of the Day" + mot-clé "editorial" ou "luxury") pour ancrer le style visuel exact.

---

# 🚀 V3 — Passer au "design du futur" (niveau technique maximal)

## Pourquoi ça reste plat malgré les briefs précédents
Un brief en prose laisse toujours la porte ouverte aux effets faciles (couleurs, un peu de motion) et à zapper tout ce qui touche à des API récentes ou à plusieurs fichiers à coordonner. Solution : des consignes numérotées et non négociables, avec le nom exact de la technique à chaque fois.

## 1. La navigation ne doit plus ressembler à une barre de navigation
Un header plein-largeur avec des liens texte est le motif le plus générique qui existe. Remplace-le par une **capsule flottante centrée** (pas collée aux bords de l'écran), avec un fond qui glisse derrière le lien actif au lieu d'un simple soulignement — motif "dock" au lieu de motif "menu". Code : `NavCapsule.tsx` fourni plus bas.

## 2. Curseur contextuel
Pas juste un point qui suit la souris : il doit changer de taille et afficher un mot ("Voir", "Ouvrir"...) au survol d'un élément précis, via un attribut `data-cursor` posé sur cet élément. Désactivé automatiquement sur écran tactile (`@media (pointer: coarse)`). Code : `ContextualCursor.tsx`.

## 3. Un moment interactif signature, ancré dans le concept de quête
Remplace le reveal automatique et passif du hero par un **vrai geste** : un sceau de cire que la personne clique pour "ouvrir la lettre" et démarrer la quête. C'est le seul gros geste créatif du site — tout le reste doit rester sobre autour de lui (spend your boldness in one place). Code : `SealReveal.tsx`.

## 4. Animations liées au scroll — en CSS natif, pas en JS
`animation-timeline: view()` (API CSS récente, supportée nativement par Chrome et Safari depuis 2026) fait apparaître texte/cartes progressivement au scroll sans écouteur JS ni librairie. Toujours enrobé dans un `@supports` pour un fallback propre sur navigateurs plus anciens : le contenu s'affiche normalement, sans animation, jamais invisible. Classe fournie : `.reveal-on-scroll`.

## 5. Transitions de page avec la View Transitions API
`document.startViewTransition()` (API navigateur native) pour un morphing fluide entre pages plutôt qu'un simple démontage/remontage React. Quelques lignes suffisent, l'effet perçu est immédiat. Snippet fourni : `viewTransition.ts`.

## 6. Fond avec un soupçon de profondeur (optionnel, à faire seulement si tout le reste marche déjà)
Un léger fond animé en WebGL (librairie légère `ogl`, ~5kb) avec un dégradé fluide bordeaux/doré qui bouge très lentement, jamais au premier plan, jamais distrayant. Plus lourd à mettre en place — dernière priorité.

## 7. Fondations qui font la différence perçue (souvent zappées)
- `prefers-reduced-motion` respecté partout (déjà dans le CSS)
- Focus clavier visible et stylé (pas l'outline bleu par défaut)
- Animations uniquement sur `transform`/`opacity`, jamais `top`/`left`/`width`
- Mobile : ligne de route simplifiée, curseur custom désactivé, capsule de nav réduite si besoin

## 8. Son (bonus, seulement si tout le reste est déjà exceptionnel)
Un unique micro-son discret au clic sur le sceau de cire. Jamais de musique d'ambiance en autoplay (bloqué par les navigateurs de toute façon, et casse l'expérience). Bouton mute visible.

---

## Prompt exhaustif final à donner à Gemini Flash

```
Contexte : projet React + Vite + TypeScript. Voici le code de référence déjà en place 
(Navbar/Hero/index.css) — colle-les ici, plus les nouveaux fichiers NavCapsule.tsx, 
ContextualCursor.tsx, SealReveal.tsx, viewTransition.ts et le CSS additionnel fournis.

Implémente EXACTEMENT ces points, un par un, sans en sauter aucun :

1. NAVIGATION : remplace le header actuel par NavCapsule (capsule flottante centrée, 
   fond qui glisse derrière le lien actif). Ne garde pas l'ancienne barre de navigation.

2. CURSEUR : intègre ContextualCursor. Ajoute data-cursor="Voir" sur toute carte 
   cliquable du site. Désactive-le automatiquement sur point tactile.

3. MOMENT D'OUVERTURE : utilise SealReveal pour envelopper le contenu de la page d'accueil. 
   Le contenu ne doit apparaître qu'après le clic sur le sceau.

4. SCROLL REVEAL : ajoute .reveal-on-scroll sur chaque titre de section et chaque étape 
   de la Timeline. Garde le @supports fallback tel quel.

5. TRANSITIONS DE PAGE : enveloppe chaque changement de route avec 
   document.startViewTransition() via la fonction fournie. Fallback silencieux si non supporté.

6. Respecte prefers-reduced-motion, les focus clavier visibles, et n'anime que 
   transform/opacity.

7. Teste sur mobile : la nav doit se réduire proprement, le curseur custom doit 
   disparaître sur écrans tactiles.

Ne change RIEN d'autre dans la palette de couleurs ou la typographie déjà en place — 
ce prompt ajoute des interactions, il ne touche pas à l'identité visuelle déjà validée.
```
