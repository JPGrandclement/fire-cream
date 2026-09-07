# 💝 Cahier des Charges & Spécifications : "Fire Cream"

Ce document contient l'intégralité des spécifications fonctionnelles, techniques et graphiques du projet "Fire Cream", afin de pouvoir le recréer ou le porter sur n'importe quel autre framework ou outil (React, Vue, Flutter, SwiftUI, etc.).

---

## 1. Concept et Vision
**Fire Cream** est une application conçue comme un cadeau dématérialisé pour son ou sa partenaire.
- **Objectif** : Offrir un espace intime, mignon et gamifié rempli d'attentions, de souvenirs et de jeux.
- **Format** : Web App Progressive (PWA) ou application mobile native.
- **Tone of voice** : Romantique, bienveillant, mignon, ludique.

---

## 2. Architecture Globale

### 2.1 Principes Techniques
- **Séparation Contenu / Code** : L'intégralité du contenu personnalisé (textes, dates, quiz) doit être extraite dans un fichier de données statiques (ex: `data.json` ou une base de données NoSQL) pour que l'utilisateur puisse modifier le contenu de l'app sans toucher au code source.
- **Client-Side Storage** : La progression du joueur (badges, scores, lettres lues) doit être sauvegardée localement (LocalStorage sur le web, ou équivalent natif) pour conserver l'état entre les sessions.
- **Offline-First** : L'application doit pouvoir fonctionner hors-ligne (via Service Worker pour le web) car c'est une app de consultation.

### 2.2 Routing & Navigation
- **Hub Central (Accueil)** : Point d'entrée listant tous les modules sous forme de grille.
- **Bottom Navigation Bar** : Barre de navigation persistante avec 5 accès rapides : Accueil, Message du jour, Bouton central flottant (Roue de la fortune), Lettres cachées, Badges.

---

## 3. Design System (Thème "Kawaii")

### 3.1 Palette de Couleurs
- **Couleurs Principales (Pastels)** :
  - Rose : `#FFB5C2` (Light: `#FFD6E0`, Dark: `#E8899A`)
  - Lavande : `#C3AED6` (Light: `#DDD0EC`, Dark: `#9B7FC0`)
  - Menthe : `#B5EAD7` (Light: `#D4F5E9`, Dark: `#7DC9A7`)
  - Pêche : `#FFDAC1` (Light: `#FFE8D6`, Dark: `#E8B897`)
  - Jaune doux : `#FFF5BA` (Light: `#FFF9D6`, Dark: `#E8D97A`)
- **Fonds & Neutres** :
  - Fond global : Crème `#FFF8F0`
  - Fond de carte : Blanc `#FFFFFF`
  - Textes principaux : `#4A3347` (Gris/Violet très foncé)
  - Textes secondaires : `#7B6178`

### 3.2 Typographie et UI
- **Police** : *Quicksand* (ou police arrondie équivalente comme *Nunito*).
- **Formes** : Très arrondies (border-radius élevés, 16px à 24px pour les cartes).
- **Ombres** : Ombres douces, larges et teintées de rose (`0 8px 30px rgba(255, 181, 194, 0.25)`).

### 3.3 Système d'Animations Spécifiques
- **Bounces** : Les boutons et modales apparaissent avec un effet ressort.
- **Confettis** : Déclenchés lors de la réussite d'un défi, d'un bon gratté, ou d'un 100% au quiz.
- **Cœurs flottants** : Particules d'arrière-plan constantes remontant lentement vers le haut de l'écran.
- **Stagger effect** : Les listes (cartes, lettres) apparaissent les unes après les autres en cascade.

---

## 4. Gestion de l'État (State Management)

L'application doit traquer la progression de l'utilisateur. Voici le schéma de l'état (Store) à maintenir :

```json
{
  "firstVisit": boolean,       // Pour afficher les modales de bienvenue
  "lastVisit": "YYYY-MM-DD",   // Pour calculer la fidélité quotidienne
  "visitStreak": number,       // Nombre de jours consécutifs d'ouverture de l'app
  "totalVisits": number,       // Nombre total d'ouvertures
  "modulesVisited": string[],  // ID des modules ouverts au moins une fois
  "scratchCards": object,      // Clé = ID du bon, Valeur = "scratched" ou "used"
  "lettersRead": string[],     // ID des lettres ouvertes
  "calendarOpened": number[],  // Jours du calendrier (1 à 31) ouverts
  "challengesCompleted": string[], // ID des défis réussis
  "quizScores": number[],      // Historique des scores
  "wheelSpins": number,        // Nombre de fois où la roue a été tournée
  "gardenWaters": number,      // Nombre total d'arrosages
  "gardenPlants": object,      // Clé = ID de la plante, Valeur = Niveau (0 à Max)
  "badges": string[],          // ID des badges débloqués
  "tonightHistory": object[]   // Historique des idées d'activités générées
}
```

---

## 5. Schéma des Données (Contenu)

La source de vérité du contenu (`data.json`) doit respecter la structure suivante :

### Global Config
`config`: `partnerName`, `appName`, `startDate` (pour calculer les jours en couple), `mascotName`.

### Modules Data
1. **timeline**: `id`, `date`, `title`, `description`, `emoji`, `photo` (url/null).
2. **letters**: `id`, `title`, `content`, `unlockDate` (YYYY-MM-DD ou null), `emoji`.
3. **calendar**: `day` (1-31), `type` (compliment|challenge|fun_fact|coupon), `content`.
4. **challenges**: `id`, `title`, `description`, `difficulty` (1-3), `category`, `emoji`.
5. **dailyMessages**: `Array<string>` (Liste plate de compliments).
6. **scratchCards**: `id`, `title`, `description`, `emoji`, `category`.
7. **quiz**: `id`, `question`, `options` (Array<string> de 4 choix), `answer` (Index 0-3), `category`.
8. **memoryMap**: `id`, `name`, `description`, `lat`, `lng`, `date`, `emoji`, `photo`.
9. **garden**: `plants` (Array de `{id, name, emoji, stage, maxStage, unlocked}`), `waterPerDay` (int limit).
10. **wheel**: `Array<{label, color}>`.
11. **badges**: `id`, `name`, `description`, `emoji`, `condition` (ex: "streak_7").
12. **tonight**: `Array<{category, options, emoji}>`.

---

## 6. Spécifications Fonctionnelles des Modules

### 6.1 Hub Central & Navbar
- Affiche une mascotte.
- Calcule dynamiquement le nombre de jours en couple depuis `startDate`.
- Calcule la "Streak" (jours d'affilée) en comparant `lastVisit` avec la date du jour.
- Grille de 12 cartes menant aux modules.

### 6.2 📸 Timeline (Notre Histoire)
- Frise chronologique ordonnée par date.
- Affichage alterné gauche/droite ou aligné à gauche sur mobile.

### 6.3 💌 Lettres Cachées
- Liste d'enveloppes interactives.
- **Logique de verrouillage** : Si `unlockDate` > Aujourd'hui, l'enveloppe est verrouillée. Un clic affiche un toast "Patience". Sinon, l'enveloppe s'ouvre dans une modale et est marquée comme "lue" dans le State.

### 6.4 📅 Calendrier (Avent perpétuel)
- 31 cases.
- **Logique** : La case `N` n'est cliquable que si `Jour du mois courant >= N`.
- État visuel : Grisé (futur), Cliquable (disponible), Ouvert (avec icône du type de surprise).

### 6.5 🎯 Défis Couple
- Liste de cartes de missions avec étoiles de difficulté.
- Bouton "Défi accompli" qui déclenche l'animation de confettis, met à jour le State et change le statut de la carte en "Fait".

### 6.6 🔮 Message du Jour
- Un système qui sélectionne une phrase dans `dailyMessages` en fonction du jour de l'année (ex: `dayOfYear() % array.length`) pour garantir le même message toute la journée, et un nouveau le lendemain.

### 6.7 🎫 Bons à Gratter
- Cartes affichant un masque interactif (Canvas HTML ou équivalent natif permettant d'effacer une couche tactile).
- **Cycle de vie** :
  1. Non gratté (masqué).
  2. Gratté (contenu révélé, bouton "Utiliser" disponible).
  3. Utilisé (Validé après confirmation, badge visuel "Utilisé").

### 6.8 🧠 Quiz
- Affiche une question à la fois avec 4 propositions.
- Coloration verte (vrai) ou rouge (faux) au clic.
- Écran de résultat final avec calcul du pourcentage, affichage d'un message conditionnel, et bouton pour recommencer.
- Si score parfait, déblocage de badge.

### 6.9 🗺️ Carte Souvenirs
- Soit une liste de cartes (façon timeline), soit une véritable intégration Map (Google Maps / Mapbox / Apple Maps) avec des pins (marqueurs) utilisant les emojis/coordonnées du JSON.
- Clic sur un pin = Popup avec détails et photo.

### 6.10 🌱 Jardin Virtuel (Tamagotchi-like)
- X plantes affichées (Graine -> Pousse -> Fleur).
- **Logique d'arrosage** :
  - L'utilisateur a un nombre limité d'arrosages par jour calendaire (ex: 3 max/jour).
  - Un clic sur "Arroser" augmente le `stage` (niveau) de la plante de +1.
  - Au niveau maximum, la plante est bloquée.
  - L'arrosage global débloque de nouvelles graines dans le jardin.

### 6.11 🎰 Roue de la Fortune
- Composant visuel rotatif avec décélération mathématique (Easing Cubic-Out) pour simuler une vraie roue.
- Sélection aléatoire d'un segment, rotation jusqu'à ce segment.
- Popup de gain au terme de l'animation.

### 6.12 🎲 Ce soir on fait... (Générateur)
- Animation style "Machine à sous".
- Sélection aléatoire parmi les catégories, puis parmi les options de cette catégorie.
- Maintien d'un historique des 5 derniers résultats dans le State.

### 6.13 🏆 Badges (Succès)
- Le moteur de jeu doit évaluer à chaque interaction si une condition de badge est remplie.
- Exemples de déclencheurs : Première visite, Streak de 7 jours, 5 bons grattés, 1er quiz à 100%, plante niveau max.
- Si validé : Modale festive plein écran prioritaire sur l'interface.

---

## 7. Critères de Qualité et Recette
- **Responsive** : L'interface doit être conçue en Mobile-First. Largeur max recommandée pour l'UI sur Desktop : 480px à 600px (format téléphone centré).
- **Accessibilité** : Contrastes suffisants malgré les couleurs pastels.
- **Performances** : Pas de rechargement réseau lourd, utilisation intensive des transitions CSS / animations natives.
