---
render_with_liquid: false
---

# 🎨 Guide de Personnalisation - Love Quest

## Vue d'Ensemble

Ce guide explique comment personnaliser entièrement Love Quest pour créer un cadeau unique et personnel.

---

## 1. Configuration Initiale

### 1.1 Fichier de Configuration Principal

```json
// data/config.json
{
  "version": "1.0.0",
  "partnerName": "Mon Amour",
  "appName": "Love Quest",
  "startDate": "2024-02-14",
  "mascotName": "Cupidon",
  "mascotEmoji": "💘",
  
  "theme": {
    "primaryColor": "#FFB5C2",
    "secondaryColor": "#C3AED6",
    "accentColor": "#B5EAD7",
    "backgroundColor": "#FFF8F0",
    "textColor": "#4A3347"
  },
  
  "features": {
    "enableCloudSync": true,
    "enableNotifications": true,
    "enableAnalytics": false,
    "enableSharing": true,
    "enableMultimedia": true
  },
  
  "modules": {
    "timeline": true,
    "letters": true,
    "calendar": true,
    "challenges": true,
    "dailyMessage": true,
    "scratchCards": true,
    "quiz": true,
    "memoryMap": true,
    "garden": true,
    "wheel": true,
    "tonight": true,
    "badges": true
  }
}
```

---

## 2. Personnalisation du Contenu

### 2.1 Timeline (Notre Histoire)

```json
// data/content.json - Section Timeline
{
  "timeline": [
    {
      "id": "evt_001",
      "date": "2024-02-14",
      "title": "Notre première rencontre",
      "description": "Le jour où nos regards se sont croisés pour la première fois au Café des Arts. Tu portais cette robe bleue qui te va si bien...",
      "emoji": "✨",
      "photo": "/images/timeline/first-meeting.jpg",
      "category": "first",
      "tags": ["rencontre", "début", "café"],
      "location": {
        "name": "Café des Arts",
        "lat": 48.8566,
        "lng": 2.3522
      }
    },
    {
      "id": "evt_002",
      "date": "2024-03-01",
      "title": "Premier baiser",
      "description": "Sous les étoiles, dans le parc. Un moment magique que je n'oublierai jamais.",
      "emoji": "💋",
      "category": "milestone",
      "tags": ["romantique", "milestone"]
    }
    // Ajouter autant d'événements que souhaité
  ]
}
```

**Conseils:**
- Utilisez des dates réelles et significatives
- Soyez spécifique dans les descriptions
- Ajoutez des détails personnels (vêtements, météo, émotions)
- Utilisez des emojis qui représentent bien chaque moment
- Catégories disponibles: `first`, `milestone`, `memory`, `special`

### 2.2 Lettres Cachées

```json
{
  "letters": [
    {
      "id": "letter_001",
      "title": "Pourquoi je t'aime",
      "content": "# Mon amour,\n\nChaque jour avec toi est un cadeau. Voici pourquoi je t'aime :\n\n- **Ton sourire** illumine mes journées les plus sombres\n- **Ta gentillesse** me rend meilleur\n- **Ton humour** me fait rire même quand je suis triste\n- **Ta présence** me rassure et me réconforte\n\nTu es ma personne, mon âme sœur, mon tout.\n\nJe t'aime infiniment 💕",
      "unlockDate": null,
      "emoji": "💌",
      "category": "love",
      "mood": "romantic"
    },
    {
      "id": "letter_002",
      "title": "Nos rêves ensemble",
      "content": "Je rêve de tous ces moments futurs avec toi...\n\n🏡 Notre maison avec un jardin\n✈️ Voyager au Japon ensemble\n👶 Fonder une famille\n🌅 Vieillir ensemble, main dans la main\n\nChaque rêve est plus beau avec toi dedans.",
      "unlockDate": "2026-12-25",
      "emoji": "🌟",
      "category": "future",
      "mood": "inspiring"
    }
  ]
}
```

**Conseils:**
- Écrivez du cœur, soyez authentique
- Utilisez le Markdown pour la mise en forme
- `unlockDate: null` = lettre immédiatement disponible
- `unlockDate: "YYYY-MM-DD"` = lettre débloquée à cette date
- Catégories: `love`, `memory`, `future`, `special`
- Moods: `romantic`, `playful`, `emotional`, `inspiring`

### 2.3 Calendrier (31 Surprises)

```json
{
  "calendar": {
    "theme": "31 jours de douceur",
    "description": "Chaque jour du mois, une nouvelle surprise t'attend !",
    "days": [
      {
        "day": 1,
        "type": "compliment",
        "content": "Ton sourire illumine mes journées ☀️",
        "emoji": "😊"
      },
      {
        "day": 2,
        "type": "challenge",
        "content": "Aujourd'hui, faisons un selfie rigolo ensemble !",
        "emoji": "📸"
      },
      {
        "day": 3,
        "type": "fun_fact",
        "content": "Le saviez-vous ? Les câlins libèrent de l'ocytocine, l'hormone du bonheur ! 🤗",
        "emoji": "🤗"
      },
      {
        "day": 4,
        "type": "coupon",
        "content": "Bon pour un massage de 30 minutes 💆",
        "emoji": "🎫"
      },
      {
        "day": 5,
        "type": "memory",
        "content": "Tu te souviens de notre premier pique-nique ? C'était magique 🧺",
        "emoji": "🌸"
      }
      // Continuer jusqu'au jour 31
    ]
  }
}
```

**Types disponibles:**
- `compliment` - Un compliment sincère
- `challenge` - Un petit défi à faire ensemble
- `fun_fact` - Un fait amusant ou romantique
- `coupon` - Un bon cadeau
- `memory` - Un souvenir partagé
- `surprise` - Une surprise spéciale

### 2.4 Défis Couple

```json
{
  "challenges": [
    {
      "id": "challenge_001",
      "title": "Soirée cinéma maison",
      "description": "Organisez une soirée cinéma avec pop-corn, couvertures et votre film préféré ! Éteignez vos téléphones et profitez du moment.",
      "difficulty": 1,
      "category": "cozy",
      "emoji": "🍿",
      "estimatedTime": "Une soirée",
      "requirements": ["À la maison", "Film choisi ensemble", "Pop-corn"],
      "reward": {
        "type": "badge",
        "value": "cinema_lover"
      }
    },
    {
      "id": "challenge_002",
      "title": "Lettre d'amour manuscrite",
      "description": "Écrivez-vous mutuellement une lettre d'amour à la main. Prenez votre temps, soyez sincères, et échangez vos lettres autour d'un bon repas.",
      "difficulty": 2,
      "category": "romantic",
      "emoji": "✍️",
      "estimatedTime": "1 heure",
      "requirements": ["Papier et stylo", "Moment calme", "Sincérité"],
      "reward": {
        "type": "badge",
        "value": "poet"
      }
    }
  ]
}
```

**Niveaux de difficulté:**
- `1` = Facile (< 1 heure, peu de préparation)
- `2` = Moyen (1-3 heures, préparation modérée)
- `3` = Difficile (> 3 heures, préparation importante)

**Catégories:**
- `romantic` - Défis romantiques
- `fun` - Défis amusants
- `creative` - Défis créatifs
- `adventure` - Défis d'aventure
- `cozy` - Défis cocooning
- `surprise` - Défis surprise

### 2.5 Messages du Jour

```json
{
  "dailyMessages": {
    "algorithm": "day_of_year",
    "messages": [
      {
        "id": "msg_001",
        "content": "Tu es la plus belle chose qui me soit arrivée 💖",
        "category": "love",
        "emoji": "💖"
      },
      {
        "id": "msg_002",
        "content": "Ton rire est ma mélodie préférée 🎵",
        "category": "compliment",
        "emoji": "🎵"
      },
      {
        "id": "msg_003",
        "content": "Merci d'être toi, tout simplement 🌟",
        "category": "gratitude",
        "emoji": "🌟"
      }
      // Ajouter au moins 365 messages pour couvrir une année
    ]
  }
}
```

**Conseils:**
- Créez au moins 100 messages différents
- Variez les catégories et les tons
- Soyez sincère et personnel
- Évitez les répétitions

### 2.6 Bons à Gratter

```json
{
  "scratchCards": [
    {
      "id": "scratch_001",
      "title": "Massage relaxant",
      "description": "Bon pour un massage de 30 minutes, où tu veux, quand tu veux ! Huiles essentielles incluses 💆",
      "emoji": "💆",
      "category": "relaxation",
      "rarity": "common"
    },
    {
      "id": "scratch_002",
      "title": "Dîner aux chandelles",
      "description": "Je prépare ton plat préféré avec une ambiance romantique : bougies, musique douce, et toute mon attention 🕯️",
      "emoji": "🍽️",
      "category": "romantic",
      "rarity": "rare",
      "conditions": ["À utiliser le soir", "Prévenir 24h à l'avance"]
    },
    {
      "id": "scratch_003",
      "title": "Journée 100% toi",
      "description": "Une journée entière où on fait TOUT ce que tu veux ! Tes activités, tes choix, tes envies. Je suis à ton service 👑",
      "emoji": "👑",
      "category": "surprise",
      "rarity": "legendary",
      "validityPeriod": {
        "end": "2027-12-31"
      },
      "conditions": [
        "Week-end uniquement",
        "Prévenir 1 semaine à l'avance",
        "Budget raisonnable 😊"
      ]
    }
  ]
}
```

**Raretés:**
- `common` - Bons courants (70%)
- `rare` - Bons rares (20%)
- `epic` - Bons épiques (8%)
- `legendary` - Bons légendaires (2%)

**Idées de bons:**
- Massages, câlins, bisous
- Repas préparés, petit-déjeuner au lit
- Sorties (cinéma, restaurant, activité)
- Services (ménage, courses, vaisselle)
- Temps de qualité (soirée jeux, marathon série)
- Cadeaux (fleurs, chocolats, surprise)

### 2.7 Quiz

```json
{
  "quiz": {
    "passingScore": 70,
    "perfectScoreBadge": "quiz_master",
    "questions": [
      {
        "id": "quiz_001",
        "question": "Quelle est ma couleur préférée ?",
        "options": ["Bleu", "Rose", "Vert", "Violet"],
        "answer": 1,
        "category": "preferences",
        "difficulty": "easy",
        "explanation": "Tu adores le rose, surtout les tons pastel ! 💕",
        "emoji": "🎨"
      },
      {
        "id": "quiz_002",
        "question": "Où nous sommes-nous rencontrés ?",
        "options": [
          "Au café des Arts",
          "À la bibliothèque",
          "Dans un parc",
          "Chez des amis"
        ],
        "answer": 0,
        "category": "memories",
        "difficulty": "easy",
        "explanation": "C'était au Café des Arts, un jour de février ☕",
        "emoji": "📍"
      },
      {
        "id": "quiz_003",
        "question": "Quel est mon film préféré ?",
        "options": [
          "La La Land",
          "Amélie Poulain",
          "Inception",
          "The Notebook"
        ],
        "answer": 1,
        "category": "preferences",
        "difficulty": "medium",
        "explanation": "Amélie Poulain ! Tu adores l'univers poétique et coloré 🎬",
        "emoji": "🎬"
      }
    ]
  }
}
```

**Catégories de questions:**
- `us` - Questions sur votre couple
- `preferences` - Goûts et préférences
- `memories` - Souvenirs partagés
- `fun` - Questions amusantes
- `future` - Projets et rêves

**Conseils:**
- Créez au moins 20 questions
- Variez les difficultés
- Ajoutez des explications personnelles
- Soyez créatif et amusant

### 2.8 Carte des Souvenirs

```json
{
  "memoryMap": {
    "defaultCenter": {
      "lat": 48.8566,
      "lng": 2.3522,
      "zoom": 12
    },
    "locations": [
      {
        "id": "loc_001",
        "name": "Café des Arts",
        "description": "Là où tout a commencé... Notre première rencontre, un 14 février ensoleillé. Tu as commandé un cappuccino, moi un thé vert. Nos regards se sont croisés et j'ai su que ma vie allait changer ✨",
        "lat": 48.8566,
        "lng": 2.3522,
        "date": "2024-02-14",
        "emoji": "☕",
        "photo": "/images/memories/cafe.jpg",
        "category": "first",
        "rating": 5,
        "tags": ["rencontre", "café", "début", "coup de foudre"]
      },
      {
        "id": "loc_002",
        "name": "Parc des Buttes-Chaumont",
        "description": "Notre premier pique-nique, sous le soleil de printemps. On a ri, parlé pendant des heures, et partagé nos rêves 🌸",
        "lat": 48.8799,
        "lng": 2.3825,
        "date": "2024-03-20",
        "emoji": "🧺",
        "photo": "/images/memories/picnic.jpg",
        "category": "date",
        "rating": 5,
        "tags": ["pique-nique", "nature", "printemps"]
      }
    ]
  }
}
```

**Conseils:**
- Ajoutez tous vos lieux importants
- Soyez précis dans les coordonnées GPS
- Racontez l'histoire de chaque lieu
- Ajoutez des photos si possible

---

## 3. Personnalisation Visuelle

### 3.1 Thème de Couleurs

```typescript
// tailwind.config.js
export default {
  theme: {
    extend: {
      colors: {
        // Couleurs principales
        'primary': '#FFB5C2',
        'primary-light': '#FFD6E0',
        'primary-dark': '#E8899A',
        
        // Couleurs secondaires
        'secondary': '#C3AED6',
        'secondary-light': '#DDD0EC',
        'secondary-dark': '#9B7FC0',
        
        // Couleurs d'accent
        'accent': '#B5EAD7',
        'accent-light': '#D4F5E9',
        'accent-dark': '#7DC9A7',
        
        // Couleurs neutres
        'cream': '#FFF8F0',
        'text-primary': '#4A3347',
        'text-secondary': '#7B6178'
      }
    }
  }
}
```

**Palettes suggérées:**

**Romantique Classique:**
- Rose: `#FFB5C2`
- Lavande: `#C3AED6`
- Crème: `#FFF8F0`

**Moderne Élégant:**
- Corail: `#FF6B6B`
- Turquoise: `#4ECDC4`
- Blanc cassé: `#F7FFF7`

**Doux Pastel:**
- Pêche: `#FFDAC1`
- Menthe: `#B5EAD7`
- Jaune doux: `#FFF5BA`

### 3.2 Mascotte Personnalisée

```json
// data/config.json
{
  "mascot": {
    "name": "Cupidon",
    "emoji": "💘",
    "messages": [
      "Bienvenue mon amour ! 💕",
      "Tu m'as manqué ! 🥰",
      "Prêt(e) pour une nouvelle aventure ? ✨",
      "Je t'aime ! 💖"
    ],
    "animations": {
      "idle": "bounce",
      "happy": "jump",
      "love": "hearts"
    }
  }
}
```

**Emojis suggérés:**
- 💘 Cupidon classique
- 🦄 Licorne magique
- 🐻 Ours en peluche
- 🌟 Étoile brillante
- 💝 Cadeau d'amour
- 🎈 Ballon festif

### 3.3 Icônes et Images

**Structure des dossiers:**
```
public/
├── icons/
│   ├── icon-72x72.png
│   ├── icon-96x96.png
│   ├── icon-128x128.png
│   ├── icon-192x192.png
│   ├── icon-512x512.png
│   └── favicon.ico
├── images/
│   ├── timeline/
│   │   ├── first-meeting.jpg
│   │   ├── first-date.jpg
│   │   └── ...
│   ├── memories/
│   │   ├── cafe.jpg
│   │   ├── picnic.jpg
│   │   └── ...
│   └── background/
│       ├── hearts.svg
│       └── pattern.svg
└── splash/
    ├── splash-640x1136.png
    ├── splash-750x1334.png
    └── ...
```

**Conseils pour les images:**
- Format: JPG pour photos, PNG pour transparence, WebP pour performance
- Taille max: 1920x1080 pour les photos
- Compression: Utilisez TinyPNG ou Squoosh
- Nommage: Descriptif et cohérent

---

## 4. Personnalisation Avancée

### 4.1 Modules Personnalisés

```typescript
// features/custom-module/CustomModule.tsx
export const CustomModule = () => {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Mon Module Personnalisé</h1>
      {/* Votre contenu personnalisé */}
    </div>
  )
}

// Ajouter au router
import { CustomModule } from '@/features/custom-module/CustomModule'

{
  path: 'custom',
  element: <CustomModule />
}
```

### 4.2 Badges Personnalisés

```json
{
  "badges": [
    {
      "id": "custom_badge_001",
      "name": "Explorateur",
      "description": "Visité tous les modules",
      "emoji": "🗺️",
      "category": "milestone",
      "rarity": "rare",
      "condition": {
        "type": "module_visits",
        "value": 12
      }
    },
    {
      "id": "custom_badge_002",
      "name": "Romantique",
      "description": "Lu toutes les lettres",
      "emoji": "💌",
      "category": "activity",
      "rarity": "epic",
      "condition": {
        "type": "letters_read",
        "value": "all"
      }
    }
  ]
}
```

### 4.3 Animations Personnalisées

```typescript
// components/animations/CustomAnimation.tsx
import { motion } from 'framer-motion'

export const CustomAnimation = ({ children }: { children: React.ReactNode }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20
      }}
    >
      {children}
    </motion.div>
  )
}
```

---

## 5. Checklist de Personnalisation

### 5.1 Contenu Essentiel

- [ ] Configuration générale (noms, dates, thème)
- [ ] Au moins 10 événements de timeline
- [ ] Au moins 5 lettres cachées
- [ ] 31 surprises de calendrier
- [ ] Au moins 10 défis couple
- [ ] Au moins 100 messages du jour
- [ ] Au moins 10 bons à gratter
- [ ] Au moins 20 questions de quiz
- [ ] Au moins 5 lieux sur la carte
- [ ] Configuration du jardin virtuel
- [ ] Configuration de la roue
- [ ] Options "Ce soir on fait..."
- [ ] Badges personnalisés

### 5.2 Visuel

- [ ] Palette de couleurs choisie
- [ ] Mascotte configurée
- [ ] Icônes PWA créées (toutes les tailles)
- [ ] Photos optimisées et uploadées
- [ ] Favicon personnalisé
- [ ] Splash screens (iOS)

### 5.3 Technique

- [ ] Variables d'environnement configurées
- [ ] Firebase configuré
- [ ] Domaine personnalisé (optionnel)
- [ ] Analytics configuré (optionnel)
- [ ] Notifications configurées (optionnel)

---

## 6. Outils et Ressources

### 6.1 Générateurs

**Palette de Couleurs:**
- Coolors.co
- Adobe Color
- Paletton

**Images:**
- Unsplash (photos gratuites)
- Pexels (photos gratuites)
- Canva (création graphique)

**Icônes:**
- Favicon.io (générateur de favicon)
- RealFaviconGenerator (icônes PWA)

**Emojis:**
- Emojipedia
- Get Emoji

### 6.2 Validation

```bash
# Valider le JSON
pnpm run validate:content

# Tester localement
pnpm run dev

# Build de production
pnpm run build
pnpm run preview
```

---

## 7. Exemples Complets

### 7.1 Exemple: Thème "Voyage"

```json
{
  "theme": {
    "name": "Notre Tour du Monde",
    "colors": {
      "primary": "#FF6B6B",
      "secondary": "#4ECDC4",
      "accent": "#FFE66D"
    },
    "mascot": {
      "emoji": "✈️",
      "name": "Globetrotter"
    }
  },
  "modules": {
    "timeline": "Nos Aventures",
    "memoryMap": "Carte du Monde",
    "challenges": "Défis Voyage"
  }
}
```

### 7.2 Exemple: Thème "Geek/Gaming"

```json
{
  "theme": {
    "name": "Love Level Up",
    "colors": {
      "primary": "#9B59B6",
      "secondary": "#3498DB",
      "accent": "#2ECC71"
    },
    "mascot": {
      "emoji": "🎮",
      "name": "Player One"
    }
  },
  "badges": [
    {
      "name": "Achievement Unlocked",
      "emoji": "🏆"
    }
  ]
}
```

---

## 8. Support et Aide

### 8.1 Problèmes Courants

**Le contenu ne s'affiche pas:**
- Vérifier la syntaxe JSON (virgules, guillemets)
- Vérifier les chemins des images
- Consulter la console du navigateur

**Les dates ne fonctionnent pas:**
- Format requis: `YYYY-MM-DD`
- Vérifier la timezone

**Les images ne chargent pas:**
- Vérifier les chemins relatifs
- Optimiser la taille des images
- Vérifier les permissions

### 8.2 Validation du Contenu

```typescript
// utils/validateContent.ts
import { z } from 'zod'

const timelineSchema = z.object({
  id: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  title: z.string().min(1).max(100),
  description: z.string().min(1),
  emoji: z.string(),
  category: z.enum(['first', 'milestone', 'memory', 'special'])
})

export const validateTimeline = (data: unknown) => {
  return timelineSchema.array().parse(data)
}
```

