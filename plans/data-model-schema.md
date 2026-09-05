# 📊 Modèle de Données Complet - Love Quest

## Vue d'Ensemble

Ce document définit l'intégralité du modèle de données pour Love Quest, incluant les schémas TypeScript, les structures JSON, et les validations Zod.

**Principes de conception:**
- Séparation stricte contenu/code
- Validation forte avec Zod
- Support multilingue (i18n ready)
- Extensibilité et évolutivité
- Compatibilité offline-first

---

## 1. Configuration Globale

### 1.1 Structure de Configuration

```typescript
// types/data.types.ts
export interface AppConfig {
  version: string
  partnerName: string
  appName: string
  startDate: string // ISO 8601 format: "YYYY-MM-DD"
  mascotName: string
  mascotEmoji: string
  theme: ThemeConfig
  features: FeatureFlags
}

export interface ThemeConfig {
  primaryColor: string
  secondaryColor: string
  accentColor: string
  backgroundColor: string
  customColors?: Record<string, string>
}

export interface FeatureFlags {
  enableCloudSync: boolean
  enableNotifications: boolean
  enableAnalytics: boolean
  enableSharing: boolean
  enableMultimedia: boolean
}
```

### 1.2 Exemple de Configuration (data/config.json)

```json
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
    "backgroundColor": "#FFF8F0"
  },
  "features": {
    "enableCloudSync": true,
    "enableNotifications": true,
    "enableAnalytics": false,
    "enableSharing": true,
    "enableMultimedia": true
  }
}
```

---

## 2. Modules de Contenu

### 2.1 Timeline (Notre Histoire)

```typescript
export interface TimelineEvent {
  id: string
  date: string // ISO 8601: "YYYY-MM-DD"
  title: string
  description: string
  emoji: string
  photo?: string // URL ou chemin local
  category?: 'first' | 'milestone' | 'memory' | 'special'
  tags?: string[]
  location?: {
    name: string
    lat?: number
    lng?: number
  }
}

export interface TimelineData {
  events: TimelineEvent[]
}
```

**Exemple JSON:**
```json
{
  "events": [
    {
      "id": "evt_001",
      "date": "2024-02-14",
      "title": "Notre première rencontre",
      "description": "Le jour où nos regards se sont croisés pour la première fois...",
      "emoji": "✨",
      "photo": "/images/timeline/first-meeting.jpg",
      "category": "first",
      "tags": ["rencontre", "début"],
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
      "description": "Sous les étoiles, un moment magique...",
      "emoji": "💋",
      "category": "milestone",
      "tags": ["romantique", "milestone"]
    }
  ]
}
```

### 2.2 Lettres Cachées

```typescript
export interface Letter {
  id: string
  title: string
  content: string // Markdown supporté
  unlockDate: string | null // ISO 8601 ou null si déjà débloquée
  emoji: string
  category?: 'love' | 'memory' | 'future' | 'special'
  mood?: 'romantic' | 'playful' | 'emotional' | 'inspiring'
  attachments?: {
    type: 'image' | 'audio' | 'video'
    url: string
    caption?: string
  }[]
}

export interface LettersData {
  letters: Letter[]
}
```

**Exemple JSON:**
```json
{
  "letters": [
    {
      "id": "letter_001",
      "title": "Pourquoi je t'aime",
      "content": "# Mon amour,\n\nChaque jour avec toi est un cadeau...\n\n- Tu me fais rire\n- Tu me comprends\n- Tu es ma meilleure amie\n\nJe t'aime infiniment 💕",
      "unlockDate": null,
      "emoji": "💌",
      "category": "love",
      "mood": "romantic"
    },
    {
      "id": "letter_002",
      "title": "Nos rêves ensemble",
      "content": "Je rêve de tous ces moments futurs avec toi...",
      "unlockDate": "2026-12-25",
      "emoji": "🌟",
      "category": "future",
      "mood": "inspiring"
    }
  ]
}
```

### 2.3 Calendrier (Avent Perpétuel)

```typescript
export interface CalendarDay {
  day: number // 1-31
  type: 'compliment' | 'challenge' | 'fun_fact' | 'coupon' | 'memory' | 'surprise'
  content: string
  emoji: string
  bonus?: {
    type: 'badge' | 'scratch_card' | 'letter'
    id: string
  }
}

export interface CalendarData {
  days: CalendarDay[]
  theme?: string
  description?: string
}
```

**Exemple JSON:**
```json
{
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
      "content": "Le saviez-vous ? Les câlins libèrent de l'ocytocine, l'hormone du bonheur !",
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
  ]
}
```

### 2.4 Défis Couple

```typescript
export interface Challenge {
  id: string
  title: string
  description: string
  difficulty: 1 | 2 | 3 // 1=Facile, 2=Moyen, 3=Difficile
  category: 'romantic' | 'fun' | 'creative' | 'adventure' | 'cozy' | 'surprise'
  emoji: string
  estimatedTime?: string // "30 min", "1 heure", "Une soirée"
  requirements?: string[] // ["À la maison", "Matériel: papier et crayons"]
  reward?: {
    type: 'badge' | 'points' | 'scratch_card'
    value: string | number
  }
}

export interface ChallengesData {
  challenges: Challenge[]
}
```

**Exemple JSON:**
```json
{
  "challenges": [
    {
      "id": "challenge_001",
      "title": "Soirée cinéma maison",
      "description": "Organisez une soirée cinéma avec pop-corn, couvertures et votre film préféré !",
      "difficulty": 1,
      "category": "cozy",
      "emoji": "🍿",
      "estimatedTime": "Une soirée",
      "requirements": ["À la maison", "Film choisi ensemble"],
      "reward": {
        "type": "badge",
        "value": "cinema_lover"
      }
    },
    {
      "id": "challenge_002",
      "title": "Lettre d'amour manuscrite",
      "description": "Écrivez-vous mutuellement une lettre d'amour à la main, sans téléphone !",
      "difficulty": 2,
      "category": "romantic",
      "emoji": "✍️",
      "estimatedTime": "1 heure",
      "requirements": ["Papier et stylo", "Moment calme"],
      "reward": {
        "type": "badge",
        "value": "poet"
      }
    },
    {
      "id": "challenge_003",
      "title": "Aventure surprise",
      "description": "Organisez une sortie surprise pour votre partenaire sans lui dire où vous allez !",
      "difficulty": 3,
      "category": "adventure",
      "emoji": "🎭",
      "estimatedTime": "Une journée",
      "requirements": ["Planification", "Transport"],
      "reward": {
        "type": "badge",
        "value": "adventurer"
      }
    }
  ]
}
```

### 2.5 Messages du Jour

```typescript
export interface DailyMessage {
  id: string
  content: string
  category?: 'compliment' | 'motivation' | 'love' | 'gratitude' | 'playful'
  emoji?: string
}

export interface DailyMessagesData {
  messages: DailyMessage[]
  algorithm?: 'sequential' | 'random' | 'day_of_year'
}
```

**Exemple JSON:**
```json
{
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
    },
    {
      "id": "msg_004",
      "content": "Avec toi, chaque jour est une aventure ! 🚀",
      "category": "playful",
      "emoji": "🚀"
    }
  ]
}
```

### 2.6 Bons à Gratter

```typescript
export interface ScratchCard {
  id: string
  title: string
  description: string
  emoji: string
  category: 'romantic' | 'fun' | 'relaxation' | 'food' | 'activity' | 'surprise'
  validityPeriod?: {
    start?: string // ISO 8601
    end?: string // ISO 8601
  }
  conditions?: string[]
  rarity?: 'common' | 'rare' | 'epic' | 'legendary'
}

export interface ScratchCardsData {
  cards: ScratchCard[]
}
```

**Exemple JSON:**
```json
{
  "cards": [
    {
      "id": "scratch_001",
      "title": "Massage relaxant",
      "description": "Bon pour un massage de 30 minutes, où tu veux, quand tu veux !",
      "emoji": "💆",
      "category": "relaxation",
      "rarity": "common"
    },
    {
      "id": "scratch_002",
      "title": "Dîner aux chandelles",
      "description": "Je prépare ton plat préféré avec une ambiance romantique 🕯️",
      "emoji": "🍽️",
      "category": "romantic",
      "rarity": "rare",
      "conditions": ["À utiliser le soir", "Prévenir 24h à l'avance"]
    },
    {
      "id": "scratch_003",
      "title": "Journée 100% toi",
      "description": "Une journée entière où on fait TOUT ce que tu veux !",
      "emoji": "👑",
      "category": "surprise",
      "rarity": "legendary",
      "validityPeriod": {
        "end": "2027-12-31"
      },
      "conditions": ["Week-end uniquement", "Prévenir 1 semaine à l'avance"]
    }
  ]
}
```

### 2.7 Quiz

```typescript
export interface QuizQuestion {
  id: string
  question: string
  options: [string, string, string, string] // Exactement 4 options
  answer: 0 | 1 | 2 | 3 // Index de la bonne réponse
  category: 'us' | 'preferences' | 'memories' | 'fun' | 'future'
  difficulty?: 'easy' | 'medium' | 'hard'
  explanation?: string // Explication après la réponse
  emoji?: string
}

export interface QuizData {
  questions: QuizQuestion[]
  passingScore?: number // Pourcentage minimum pour réussir
  perfectScoreBadge?: string // ID du badge pour 100%
}
```

**Exemple JSON:**
```json
{
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
      "question": "Quel est mon plat réconfort préféré ?",
      "options": [
        "Pizza",
        "Pâtes carbonara",
        "Sushi",
        "Burger maison"
      ],
      "answer": 1,
      "category": "preferences",
      "difficulty": "medium",
      "explanation": "Les pâtes carbonara, surtout quand c'est toi qui les prépares ! 🍝",
      "emoji": "🍴"
    },
    {
      "id": "quiz_004",
      "question": "Quel voyage rêvons-nous de faire ensemble ?",
      "options": [
        "Japon",
        "Islande",
        "Nouvelle-Zélande",
        "Italie"
      ],
      "answer": 0,
      "category": "future",
      "difficulty": "easy",
      "explanation": "Le Japon ! Cerisiers en fleurs, temples et ramen 🌸🍜",
      "emoji": "✈️"
    }
  ]
}
```

### 2.8 Carte des Souvenirs

```typescript
export interface MemoryLocation {
  id: string
  name: string
  description: string
  lat: number
  lng: number
  date: string // ISO 8601
  emoji: string
  photo?: string
  category?: 'first' | 'date' | 'trip' | 'special' | 'everyday'
  rating?: 1 | 2 | 3 | 4 | 5 // Étoiles
  tags?: string[]
}

export interface MemoryMapData {
  locations: MemoryLocation[]
  defaultCenter?: {
    lat: number
    lng: number
    zoom: number
  }
}
```

**Exemple JSON:**
```json
{
  "defaultCenter": {
    "lat": 48.8566,
    "lng": 2.3522,
    "zoom": 12
  },
  "locations": [
    {
      "id": "loc_001",
      "name": "Café des Arts",
      "description": "Là où tout a commencé... Notre première rencontre ✨",
      "lat": 48.8566,
      "lng": 2.3522,
      "date": "2024-02-14",
      "emoji": "☕",
      "photo": "/images/memories/cafe.jpg",
      "category": "first",
      "rating": 5,
      "tags": ["rencontre", "café", "début"]
    },
    {
      "id": "loc_002",
      "name": "Parc des Buttes-Chaumont",
      "description": "Notre premier pique-nique, sous le soleil de printemps 🌸",
      "lat": 48.8799,
      "lng": 2.3825,
      "date": "2024-03-20",
      "emoji": "🧺",
      "photo": "/images/memories/picnic.jpg",
      "category": "date",
      "rating": 5,
      "tags": ["pique-nique", "nature", "printemps"]
    },
    {
      "id": "loc_003",
      "name": "Tour Eiffel",
      "description": "Notre balade romantique au coucher du soleil 🌅",
      "lat": 48.8584,
      "lng": 2.2945,
      "date": "2024-06-21",
      "emoji": "🗼",
      "category": "special",
      "rating": 5,
      "tags": ["romantique", "coucher de soleil", "Paris"]
    }
  ]
}
```

### 2.9 Jardin Virtuel

```typescript
export interface Plant {
  id: string
  name: string
  emoji: string
  stages: PlantStage[]
  maxStage: number
  unlocked: boolean
  unlockCondition?: {
    type: 'waters' | 'days' | 'badge' | 'challenge'
    value: number | string
  }
  description?: string
  rarity?: 'common' | 'rare' | 'epic' | 'legendary'
}

export interface PlantStage {
  stage: number
  emoji: string
  name: string
  description: string
}

export interface GardenData {
  plants: Plant[]
  waterPerDay: number
  gardenTheme?: string
  achievements?: {
    id: string
    name: string
    description: string
    condition: string
  }[]
}
```

**Exemple JSON:**
```json
{
  "waterPerDay": 3,
  "gardenTheme": "Jardin de l'Amour",
  "plants": [
    {
      "id": "plant_001",
      "name": "Rose de l'Amour",
      "emoji": "🌹",
      "maxStage": 4,
      "unlocked": true,
      "rarity": "common",
      "description": "La fleur classique de l'amour",
      "stages": [
        {
          "stage": 0,
          "emoji": "🌱",
          "name": "Graine",
          "description": "Une petite graine pleine de promesses"
        },
        {
          "stage": 1,
          "emoji": "🌿",
          "name": "Pousse",
          "description": "La première pousse apparaît"
        },
        {
          "stage": 2,
          "emoji": "🥀",
          "name": "Bouton",
          "description": "Un bouton se forme"
        },
        {
          "stage": 3,
          "emoji": "🌹",
          "name": "Rose épanouie",
          "description": "Une magnifique rose en pleine floraison"
        }
      ]
    },
    {
      "id": "plant_002",
      "name": "Tournesol du Bonheur",
      "emoji": "🌻",
      "maxStage": 3,
      "unlocked": true,
      "rarity": "common",
      "description": "Symbole de joie et de lumière",
      "stages": [
        {
          "stage": 0,
          "emoji": "🌱",
          "name": "Graine",
          "description": "Une graine de tournesol"
        },
        {
          "stage": 1,
          "emoji": "🌿",
          "name": "Tige",
          "description": "La tige grandit vers le soleil"
        },
        {
          "stage": 2,
          "emoji": "🌻",
          "name": "Tournesol",
          "description": "Un tournesol radieux"
        }
      ]
    },
    {
      "id": "plant_003",
      "name": "Cerisier Magique",
      "emoji": "🌸",
      "maxStage": 5,
      "unlocked": false,
      "unlockCondition": {
        "type": "waters",
        "value": 50
      },
      "rarity": "rare",
      "description": "Un cerisier japonais légendaire",
      "stages": [
        {
          "stage": 0,
          "emoji": "🌱",
          "name": "Graine",
          "description": "Une graine rare de cerisier"
        },
        {
          "stage": 1,
          "emoji": "🌿",
          "name": "Pousse",
          "description": "Une jeune pousse délicate"
        },
        {
          "stage": 2,
          "emoji": "🌳",
          "name": "Jeune arbre",
          "description": "Un petit arbre en croissance"
        },
        {
          "stage": 3,
          "emoji": "🌸",
          "name": "Première floraison",
          "description": "Les premières fleurs apparaissent"
        },
        {
          "stage": 4,
          "emoji": "🌸",
          "name": "Cerisier en fleurs",
          "description": "Un magnifique cerisier en pleine floraison"
        }
      ]
    }
  ],
  "achievements": [
    {
      "id": "green_thumb",
      "name": "Main Verte",
      "description": "Arroser 10 fois",
      "condition": "waters >= 10"
    },
    {
      "id": "master_gardener",
      "name": "Maître Jardinier",
      "description": "Faire pousser toutes les plantes au maximum",
      "condition": "all_plants_max"
    }
  ]
}
```

### 2.10 Roue de la Fortune

```typescript
export interface WheelSegment {
  id: string
  label: string
  color: string
  emoji?: string
  probability?: number // Optionnel: pondération (1 = normal)
  reward?: {
    type: 'message' | 'badge' | 'scratch_card' | 'challenge' | 'surprise'
    value: string
  }
}

export interface WheelData {
  segments: WheelSegment[]
  spinCooldown?: number // Minutes entre chaque spin
  dailySpins?: number // Nombre de spins par jour
}
```

**Exemple JSON:**
```json
{
  "spinCooldown": 60,
  "dailySpins": 3,
  "segments": [
    {
      "id": "wheel_001",
      "label": "Câlin gratuit",
      "color": "#FFB5C2",
      "emoji": "🤗",
      "probability": 1,
      "reward": {
        "type": "message",
        "value": "Tu as gagné un câlin gratuit ! Valable immédiatement 💕"
      }
    },
    {
      "id": "wheel_002",
      "label": "Bisou surprise",
      "color": "#C3AED6",
      "emoji": "💋",
      "probability": 1,
      "reward": {
        "type": "message",
        "value": "Un bisou surprise t'attend ! 😘"
      }
    },
    {
      "id": "wheel_003",
      "label": "Compliment",
      "color": "#B5EAD7",
      "emoji": "💬",
      "probability": 1,
      "reward": {
        "type": "message",
        "value": "Tu es absolument incroyable ! ✨"
      }
    },
    {
      "id": "wheel_004",
      "label": "Bon à gratter",
      "color": "#FFDAC1",
      "emoji": "🎫",
      "probability": 0.5,
      "reward": {
        "type": "scratch_card",
        "value": "random"
      }
    },
    {
      "id": "wheel_005",
      "label": "Défi couple",
      "color": "#FFF5BA",
      "emoji": "🎯",
      "probability": 0.8,
      "reward": {
        "type": "challenge",
        "value": "random"
      }
    },
    {
      "id": "wheel_006",
      "label": "Badge spécial",
      "color": "#FFB5C2",
      "emoji": "🏆",
      "probability": 0.3,
      "reward": {
        "type": "badge",
        "value": "lucky_spin"
      }
    }
  ]
}
```

### 2.11 Ce Soir On Fait...

```typescript
export interface TonightCategory {
  id: string
  name: string
  emoji: string
  options: string[]
  mood?: 'romantic' | 'fun' | 'relaxing' | 'active' | 'creative'
}

export interface TonightData {
  categories: TonightCategory[]
  templates?: string[] // Templates de phrases: "{category}: {option}"
}
```

**Exemple JSON:**
```json
{
  "templates": [
    "Ce soir, on fait {category}: {option} !",
    "Que dirais-tu de {category}: {option} ?",
    "J'ai une idée ! {category}: {option} 💡"
  ],
  "categories": [
    {
      "id": "cat_food",
      "name": "On mange",
      "emoji": "🍽️",
      "mood": "fun",
      "options": [
        "Pizza maison",
        "Sushi",
        "Pâtes carbonara",
        "Raclette",
        "Tacos",
        "Burger maison",
        "Fondue",
        "Cuisine du monde",
        "Pique-nique intérieur",
        "Brunch tardif"
      ]
    },
    {
      "id": "cat_activity",
      "name": "Comme activité",
      "emoji": "🎮",
      "mood": "fun",
      "options": [
        "Jeux de société",
        "Jeux vidéo coop",
        "Film romantique",
        "Série Netflix",
        "Karaoké",
        "Danse dans le salon",
        "Atelier cuisine",
        "Puzzle géant",
        "Soirée quiz",
        "Jeux de cartes"
      ]
    },
    {
      "id": "cat_ambiance",
      "name": "Dans une ambiance",
      "emoji": "🕯️",
      "mood": "romantic",
      "options": [
        "Aux chandelles",
        "Cocooning sous les couvertures",
        "Musique douce",
        "Lumières tamisées",
        "Playlist années 80",
        "Ambiance spa",
        "Style pyjama party",
        "Romantique à souhait",
        "Décontractée",
        "Festive"
      ]
    },
    {
      "id": "cat_dessert",
      "name": "Avec comme dessert",
      "emoji": "🍰",
      "mood": "fun",
      "options": [
        "Glace maison",
        "Fondant au chocolat",
        "Crêpes",
        "Tiramisu",
        "Tarte aux fruits",
        "Cookies chauds",
        "Mousse au chocolat",
        "Gaufres",
        "Brownies",
        "Fruits frais"
      ]
    }
  ]
}
```

### 2.12 Badges (Succès)

```typescript
export interface Badge {
  id: string
  name: string
  description: string
  emoji: string
  category: 'milestone' | 'activity' | 'streak' | 'special' | 'secret'
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  condition: BadgeCondition
  reward?: {
    type: 'message' | 'scratch_card' | 'letter'
    value: string
  }
  hidden?: boolean // Badge secret
}

export interface BadgeCondition {
  type: 'first_visit' | 'streak' | 'module_visits' | 'challenges_completed' | 
        'quiz_perfect' | 'scratch_cards' | 'letters_read' | 'garden_waters' | 
        'wheel_spins' | 'calendar_days' | 'custom'
  value?: number | string
  operator?: 'equals' | 'greater_than' | 'greater_or_equal' | 'less_than'
}

export interface BadgesData {
  badges: Badge[]
}
```

**Exemple JSON:**
```json
{
  "badges": [
    {
      "id": "first_visit",
      "name": "Bienvenue !",
      "description": "Première visite de l'application",
      "emoji": "👋",
      "category": "milestone",
      "rarity": "common",
      "condition": {
        "type": "first_visit"
      }