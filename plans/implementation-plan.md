# 🚀 Plan d'Implémentation Incrémental - Love Quest MVP

## 📋 Résumé Exécutif

**Objectif:** Créer un MVP fonctionnel et esthétique en ~24h
**Features:** Timeline + Lettres Cachées + Message du Jour
**Approche:** Incrémentale et méthodique

---

## 🎯 Scope du MVP

### Features Incluses (Priorité 1)
1. ✅ **Socle Technique** - Base propre et esthétique
2. ✅ **Timeline** - Feature principale (Notre Histoire)
3. ✅ **Lettres Cachées** - Messages secrets
4. ✅ **Message du Jour** - Compliment quotidien

### Features Exclues (Phase 2)
- ❌ Calendrier (31 surprises)
- ❌ Défis Couple
- ❌ Bons à Gratter
- ❌ Quiz
- ❌ Carte des Souvenirs
- ❌ Jardin Virtuel
- ❌ Roue de la Fortune
- ❌ Ce Soir On Fait...
- ❌ Badges (sauf basiques)
- ❌ Backend Firebase (100% local pour MVP)

---

## 📦 Phases d'Implémentation

### Phase 0: Setup Initial (1-2h)
**Objectif:** Environnement de développement prêt

**Tâches:**
1. Initialiser le projet Vite + React + TypeScript
2. Configurer Tailwind CSS
3. Installer les dépendances essentielles
4. Configurer ESLint + Prettier
5. Structure de dossiers de base
6. Git init + premier commit

**Livrables:**
- Projet qui compile
- Page blanche qui s'affiche
- Hot reload fonctionnel

---

### Phase 1: Socle UI/UX (3-4h)
**Objectif:** Base esthétique et navigation

**Tâches:**

#### 1.1 Design System (1h)
- [ ] Configuration Tailwind (couleurs, fonts)
- [ ] Composants UI de base (Button, Card, Modal)
- [ ] Animations de base (Framer Motion)
- [ ] Thème kawaii/romantique

#### 1.2 Layout & Navigation (1h)
- [ ] Layout principal avec Header
- [ ] Bottom Navigation (3 onglets: Home, Lettres, Message)
- [ ] Router React (3 routes)
- [ ] Transitions de page

#### 1.3 Page d'Accueil (1-2h)
- [ ] Hero section avec mascotte
- [ ] Compteur de jours ensemble
- [ ] Grille de modules (3 cartes cliquables)
- [ ] Animations d'entrée

**Livrables:**
- Application belle et responsive
- Navigation fluide
- Animations agréables
- Prête pour le contenu

---

### Phase 2: Timeline (4-5h)
**Objectif:** Feature principale fonctionnelle

**Tâches:**

#### 2.1 Data Layer (1h)
- [ ] Fichier `data/timeline.json`
- [ ] Types TypeScript pour Timeline
- [ ] Hook `useTimeline` pour charger les données
- [ ] Store Zustand minimal (juste timeline)

#### 2.2 Composants Timeline (2h)
- [ ] Composant `TimelineItem`
- [ ] Composant `TimelineView` (liste)
- [ ] Affichage alterné gauche/droite
- [ ] Support des photos
- [ ] Support des emojis

#### 2.3 Interactions (1h)
- [ ] Modal de détail au clic
- [ ] Animations d'apparition (stagger)
- [ ] Scroll fluide
- [ ] Responsive mobile

#### 2.4 Contenu (1h)
- [ ] Ajouter 5-10 événements réels
- [ ] Optimiser les photos
- [ ] Tester sur mobile

**Livrables:**
- Timeline complète et fonctionnelle
- Belle présentation des souvenirs
- Expérience fluide

---

### Phase 3: Lettres Cachées (3-4h)
**Objectif:** Messages secrets débloquables

**Tâches:**

#### 3.1 Data Layer (30min)
- [ ] Fichier `data/letters.json`
- [ ] Types TypeScript pour Letters
- [ ] Hook `useLetters`
- [ ] Logique de débloquage (date)

#### 3.2 Composants Lettres (2h)
- [ ] Composant `Envelope` (enveloppe fermée/ouverte)
- [ ] Composant `LetterModal` (contenu de la lettre)
- [ ] Animation d'ouverture d'enveloppe
- [ ] Support Markdown pour le contenu

#### 3.3 State Management (1h)
- [ ] Tracking des lettres lues (LocalStorage)
- [ ] Logique de verrouillage par date
- [ ] Toast pour lettres verrouillées

#### 3.4 Contenu (30min)
- [ ] Écrire 3-5 lettres personnelles
- [ ] Configurer les dates de débloquage

**Livrables:**
- Système de lettres fonctionnel
- Animations d'ouverture
- Contenu personnalisé

---

### Phase 4: Message du Jour (2h)
**Objectif:** Compliment quotidien

**Tâches:**

#### 4.1 Data & Logic (1h)
- [ ] Fichier `data/daily-messages.json`
- [ ] Algorithme de sélection (basé sur jour de l'année)
- [ ] Hook `useDailyMessage`
- [ ] Cache du message du jour

#### 4.2 UI (1h)
- [ ] Page Message du Jour
- [ ] Animation d'apparition
- [ ] Bouton "Partager" (optionnel)
- [ ] Historique des messages (optionnel)

#### 4.3 Contenu (inclus)
- [ ] 30-50 messages personnalisés

**Livrables:**
- Message quotidien fonctionnel
- Nouveau message chaque jour
- Interface agréable

---

### Phase 5: Polish & Optimisation (2-3h)
**Objectif:** Finitions et qualité

**Tâches:**

#### 5.1 Optimisations (1h)
- [ ] Lazy loading des images
- [ ] Code splitting des routes
- [ ] Optimisation du bundle
- [ ] Performance check (Lighthouse)

#### 5.2 Responsive & Accessibilité (1h)
- [ ] Test sur mobile (iOS + Android)
- [ ] Test sur tablette
- [ ] Contraste des couleurs
- [ ] Navigation clavier

#### 5.3 Contenu Final (1h)
- [ ] Relecture de tous les textes
- [ ] Vérification des photos
- [ ] Test du parcours complet
- [ ] Corrections de bugs

**Livrables:**
- Application optimisée
- Fonctionne sur tous les devices
- Prête pour le déploiement

---

### Phase 6: Déploiement (1h)
**Objectif:** Mise en ligne

**Tâches:**
- [ ] Build de production
- [ ] Déploiement sur Vercel/Netlify
- [ ] Test en production
- [ ] Partage du lien

**Livrables:**
- Application en ligne
- URL à partager
- Cadeau prêt ! 🎁

---

## ⏱️ Timeline Estimée

| Phase | Durée | Cumul | Priorité |
|-------|-------|-------|----------|
| **Phase 0: Setup** | 1-2h | 2h | Critique |
| **Phase 1: Socle UI** | 3-4h | 6h | Critique |
| **Phase 2: Timeline** | 4-5h | 11h | Critique |
| **Phase 3: Lettres** | 3-4h | 15h | Haute |
| **Phase 4: Message** | 2h | 17h | Moyenne |
| **Phase 5: Polish** | 2-3h | 20h | Haute |
| **Phase 6: Deploy** | 1h | 21h | Critique |

**Total: ~21h de développement**

---

## 🤖 Stratégie de Modèles IA

### Modèles Disponibles

Voici les modèles disponibles et leur coût relatif :

| Modèle | Coût | Vitesse | Qualité | Usage Recommandé |
|--------|------|---------|---------|------------------|
| **Claude Sonnet 4.5** | 💰💰💰 | ⚡⚡ | ⭐⭐⭐⭐⭐ | Architecture, décisions complexes |
| **Claude Sonnet 3.5** | 💰💰 | ⚡⚡⚡ | ⭐⭐⭐⭐ | Code métier, composants |
| **Claude Haiku 3.5** | 💰 | ⚡⚡⚡⚡ | ⭐⭐⭐ | Code simple, répétitif |
| **GPT-4o** | 💰💰 | ⚡⚡⚡ | ⭐⭐⭐⭐ | Alternative à Sonnet 3.5 |
| **GPT-4o Mini** | 💰 | ⚡⚡⚡⚡ | ⭐⭐⭐ | Alternative à Haiku |

### Stratégie Optimale par Phase

#### Phase 0: Setup Initial
**Modèle:** Claude Haiku 3.5 ou GPT-4o Mini
**Raison:** Tâches simples et répétitives
**Tâches:**
- Initialisation Vite
- Configuration Tailwind
- Installation dépendances
- Structure de dossiers

#### Phase 1: Socle UI/UX
**Modèle:** Claude Sonnet 3.5 ou GPT-4o
**Raison:** Besoin de qualité pour le design system
**Tâches:**
- Design system Tailwind
- Composants UI de base
- Layout et navigation
- Animations Framer Motion

#### Phase 2: Timeline (Feature Principale)
**Modèle:** Claude Sonnet 3.5 ou GPT-4o
**Raison:** Feature critique, besoin de qualité
**Tâches:**
- Architecture des composants
- Logique métier
- Animations complexes
- Optimisations

**Sous-tâches simples:** Haiku/Mini
- Fichiers de données JSON
- Types TypeScript basiques
- Styles CSS simples

#### Phase 3: Lettres Cachées
**Modèle:** Claude Sonnet 3.5 ou GPT-4o
**Raison:** Animations et interactions importantes
**Tâches:**
- Composants d'enveloppe
- Animations d'ouverture
- Modal de lettre
- Logique de débloquage

**Sous-tâches simples:** Haiku/Mini
- Fichiers JSON
- LocalStorage helpers

#### Phase 4: Message du Jour
**Modèle:** Claude Haiku 3.5 ou GPT-4o Mini
**Raison:** Feature simple
**Tâches:**
- Algorithme de sélection
- Page simple
- Animation basique

#### Phase 5: Polish & Optimisation
**Modèle:** Mix Sonnet 3.5 + Haiku
**Raison:** Optimisations (Sonnet) + corrections (Haiku)
**Tâches:**
- Optimisations: Sonnet 3.5
- Corrections de bugs: Haiku
- Tests: Haiku

#### Phase 6: Déploiement
**Modèle:** Claude Haiku 3.5
**Raison:** Tâches simples et scriptées
**Tâches:**
- Configuration Vercel
- Scripts de build
- Tests de déploiement

---

## 💡 Recommandations Finales

### Stratégie de Coûts

**Budget Optimal:**
- **70% Haiku/Mini** - Tâches simples et répétitives
- **25% Sonnet 3.5/GPT-4o** - Code métier et composants
- **5% Sonnet 4.5** - Décisions architecturales uniquement

**Économies Possibles:**
1. Utiliser Haiku pour tout le code "boilerplate"
2. Réserver Sonnet 3.5 pour les features critiques
3. Éviter Sonnet 4.5 sauf pour débloquer des problèmes

### Ordre d'Exécution Recommandé

**Jour 1 (Aujourd'hui - 5h restantes):**
1. Phase 0: Setup (1h) - Haiku
2. Phase 1: Socle UI (4h) - Sonnet 3.5

**Jour 2 (Demain - 16h):**
1. Phase 2: Timeline (5h) - Sonnet 3.5
2. Phase 3: Lettres (4h) - Sonnet 3.5
3. Phase 4: Message (2h) - Haiku
4. Phase 5: Polish (3h) - Mix
5. Phase 6: Deploy (1h) - Haiku
6. Buffer (1h) - Imprévus

### Points d'Attention

⚠️ **Risques:**
- Sous-estimation du temps de contenu personnalisé
- Bugs d'animations sur mobile
- Optimisation des images

✅ **Mitigation:**
- Préparer le contenu en parallèle
- Tester régulièrement sur mobile
- Utiliser des outils d'optimisation automatique

---

## 📝 Checklist de Démarrage

Avant de commencer le code:

- [ ] Environnement de dev vérifié (Node, pnpm, VS Code)
- [ ] Contenu préparé (photos, textes)
- [ ] Décision sur les couleurs/thème
- [ ] Nom de l'app décidé
- [ ] Date de début de relation connue
- [ ] Prêt à coder ! 🚀

---

## 🎯 Prochaine Étape

**Action immédiate:** Passer en mode Code et commencer la Phase 0 (Setup Initial) avec Claude Haiku pour économiser les coûts.

**Commande suggérée:**
```
Je veux commencer la Phase 0 (Setup Initial). Utilise Claude Haiku pour créer la structure de base du projet avec Vite + React + TypeScript + Tailwind CSS.
```

