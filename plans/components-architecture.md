# 🧩 Architecture des Composants - Fire Cream

## Vue d'Ensemble

Ce document détaille l'architecture complète des composants React, les patterns de conception, et les bonnes pratiques d'implémentation.

---

## 1. Hiérarchie des Composants

```
App
├── Router
│   └── Layout
│       ├── FloatingHearts (Background)
│       ├── Header (Conditionnel)
│       ├── Main Content (Outlet)
│       │   ├── Home
│       │   │   ├── Mascot
│       │   │   ├── StatsCard
│       │   │   │   ├── DaysSinceStart
│       │   │   │   └── StreakCounter
│       │   │   └── ModulesGrid
│       │   │       └── ModuleCard (x12)
│       │   │
│       │   ├── Timeline
│       │   │   └── TimelineItem (multiple)
│       │   │
│       │   ├── Letters
│       │   │   ├── LettersList
│       │   │   │   └── Envelope (multiple)
│       │   │   └── LetterModal
│       │   │       └── Let