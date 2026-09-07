# 🔄 State Management & Persistance - Fire Cream

## Vue d'Ensemble

Ce document détaille l'architecture complète du state management avec Zustand, la stratégie de persistance des données, et la synchronisation cloud.

---

## 1. Architecture du Store

### 1.1 Structure Globale du Store

```typescript
// store/index.ts
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { createUserSlice, UserSlice } from './slices/userSlice'
import { createProgressSlice, ProgressSlice } from './slices/progressSlice'
import { createModulesSlice, ModulesSlice } from './slices/modulesSlice'
import { createSettingsSlice, SettingsSlice } from './slices/settingsSlice'

export type AppStore = UserSlice & ProgressSlice & ModulesSlice & SettingsSlice

export const useStore = create<AppStore>()(
  devtools(
    persist(
      immer((...args) => ({
        ...createUserSlice(...args),
        ...createProgressSlice(...args),
        ...createModulesSlice(...args),
        ...createSettingsSlice(...args)
      })),
      {
        name: 'love-quest-storage',
        partialize: (state) => ({
          // Sélectionner uniquement ce qui doit être persisté
          user: state.user,
          progress: state.progress,
          settings: state.settings
          // modules n'est pas persisté car chargé depuis JSON
        })
      }
    )
  )
)
```

---

## 2. Slices Détaillés

### 2.1 User Slice

```typescript
// store/slices/userSlice.ts
import { StateCreator } from 'zustand'
import { AppStore } from '../index'

export interface User {
  id: string | null
  isAnonymous: boolean
  email: string | null
  displayName: string | null
  photoURL: string | null
  createdAt: string
  lastLoginAt: string
}

export interface UserSlice {
  user: User | null
  isAuthenticated: boolean
  
  // Actions
  setUser: (user: User) => void
  clearUser: () => void
  updateUserProfile: (updates: Partial<User>) => void
}

export const createUserSlice: StateCreator<
  AppStore,
  [['zustand/immer', never], ['zustand/devtools', never], ['zustand/persist', unknown]],
  [],
  UserSlice
> = (set) => ({
  user: null,
  isAuthenticated: false,
  
  setUser: (user) => set((state) => {
    state.user = user
    state.isAuthenticated = true
  }, false, 'user/setUser'),
  
  clearUser: () => set((state) => {
    state.user = null
    state.isAuthenticated = false
  }, false, 'user/clearUser'),
  
  updateUserProfile: (updates) => set((state) => {
    if (state.user) {
      state.user = { ...state.user, ...updates }
    }
  }, false, 'user/updateProfile')
})
```

### 2.2 Progress Slice

```typescript
// store/slices/progressSlice.ts
import { StateCreator } from 'zustand'
import { AppStore } from '../index'
import { differenceInDays, format } from 'date-fns'

export interface Progress {
  // Visites
  firstVisit: boolean
  lastVisit: string // ISO 8601
  visitStreak: number
  totalVisits: number
  
  // Modules
  modulesVisited: string[]
  
  // Lettres
  lettersRead: string[]
  
  // Calendrier
  calendarOpened: number[] // Jours 1-31
  
  // Défis
  challengesCompleted: string[]
  
  // Quiz
  quizScores: {
    date: string
    score: number
    totalQuestions: number
  }[]
  bestQuizScore: number
  
  // Bons à gratter
  scratchCards: Record<string, 'scratched' | 'used'>
  
  // Roue
  wheelSpins: number
  lastWheelSpin: string | null
  wheelHistory: {
    date: string
    result: string
  }[]
  
  // Jardin
  gardenWaters: number
  lastWaterDate: string | null
  gardenPlants: Record<string, number> // plantId -> stage
  
  // Badges
  badges: string[]
  
  // Tonight
  tonightHistory: {
    date: string
    result: {
      category: string
      option: string
    }
  }[]
  
  // Stats globales
  totalTimeSpent: number // en minutes
  favoriteModule: string | null
}

export interface ProgressSlice {
  progress: Progress
  
  // Actions - Visites
  updateLastVisit: () => void
  incrementTotalVisits: () => void
  
  // Actions - Modules
  markModuleVisited: (moduleId: string) => void
  
  // Actions - Lettres
  markLetterRead: (letterId: string) => void
  isLetterRead: (letterId: string) => boolean
  
  // Actions - Calendrier
  openCalendarDay: (day: number) => void
  isCalendarDayOpened: (day: number) => boolean
  
  // Actions - Défis
  completeChallenge: (challengeId: string) => void
  isChallengeCompleted: (challengeId: string) => boolean
  
  // Actions - Quiz
  addQuizScore: (score: number, total: number) => void
  
  // Actions - Bons à gratter
  scratchCard: (cardId: string) => void
  useCard: (cardId: string) => void
  getCardStatus: (cardId: string) => 'locked' | 'scratched' | 'used'
  
  // Actions - Roue
  spinWheel: (result: string) => void
  canSpinWheel: () => boolean
  
  // Actions - Jardin
  waterPlant: (plantId: string) => boolean
  canWaterToday: () => boolean
  getPlantStage: (plantId: string) => number
  
  // Actions - Badges
  unlockBadge: (badgeId: string) => void
  hasBadge: (badgeId: string) => boolean
  
  // Actions - Tonight
  addTonightResult: (category: string, option: string) => void
  
  // Getters
  getDaysSinceStart: (startDate: string) => number
  getStreakStatus: () => { current: number; isActive: boolean }
}

export const createProgressSlice: StateCreator<
  AppStore,
  [['zustand/immer', never], ['zustand/devtools', never], ['zustand/persist', unknown]],
  [],
  ProgressSlice
> = (set, get) => ({
  progress: {
    firstVisit: true,
    lastVisit: new Date().toISOString(),
    visitStreak: 1,
    totalVisits: 1,
    modulesVisited: [],
    lettersRead: [],
    calendarOpened: [],
    challengesCompleted: [],
    quizScores: [],
    bestQuizScore: 0,
    scratchCards: {},
    wheelSpins: 0,
    lastWheelSpin: null,
    wheelHistory: [],
    gardenWaters: 0,
    lastWaterDate: null,
    gardenPlants: {},
    badges: [],
    tonightHistory: [],
    totalTimeSpent: 0,
    favoriteModule: null
  },
  
  updateLastVisit: () => set((state) => {
    const now = new Date()
    const lastVisit = new Date(state.progress.lastVisit)
    const daysDiff = differenceInDays(now, lastVisit)
    
    if (daysDiff === 1) {
      // Visite consécutive
      state.progress.visitStreak += 1
    } else if (daysDiff > 1) {
      // Streak cassée
      state.progress.visitStreak = 1
    }
    // Si daysDiff === 0, même jour, on ne change rien
    
    state.progress.lastVisit = now.toISOString()
    state.progress.firstVisit = false
  }, false, 'progress/updateLastVisit'),
  
  incrementTotalVisits: () => set((state) => {
    state.progress.totalVisits += 1
  }, false, 'progress/incrementTotalVisits'),
  
  markModuleVisited: (moduleId) => set((state) => {
    if (!state.progress.modulesVisited.includes(moduleId)) {
      state.progress.modulesVisited.push(moduleId)
    }
  }, false, 'progress/markModuleVisited'),
  
  markLetterRead: (letterId) => set((state) => {
    if (!state.progress.lettersRead.includes(letterId)) {
      state.progress.lettersRead.push(letterId)
    }
  }, false, 'progress/markLetterRead'),
  
  isLetterRead: (letterId) => {
    return get().progress.lettersRead.includes(letterId)
  },
  
  openCalendarDay: (day) => set((state) => {
    if (!state.progress.calendarOpened.includes(day)) {
      state.progress.calendarOpened.push(day)
    }
  }, false, 'progress/openCalendarDay'),
  
  isCalendarDayOpened: (day) => {
    return get().progress.calendarOpened.includes(day)
  },
  
  completeChallenge: (challengeId) => set((state) => {
    if (!state.progress.challengesCompleted.includes(challengeId)) {
      state.progress.challengesCompleted.push(challengeId)
    }
  }, false, 'progress/completeChallenge'),
  
  isChallengeCompleted: (challengeId) => {
    return get().progress.challengesCompleted.includes(challengeId)
  },
  
  addQuizScore: (score, total) => set((state) => {
    const percentage = Math.round((score / total) * 100)
    state.progress.quizScores.push({
      date: new Date().toISOString(),
      score: percentage,
      totalQuestions: total
    })
    if (percentage > state.progress.bestQuizScore) {
      state.progress.bestQuizScore = percentage
    }
  }, false, 'progress/addQuizScore'),
  
  scratchCard: (cardId) => set((state) => {
    state.progress.scratchCards[cardId] = 'scratched'
  }, false, 'progress/scratchCard'),
  
  useCard: (cardId) => set((state) => {
    state.progress.scratchCards[cardId] = 'used'
  }, false, 'progress/useCard'),
  
  getCardStatus: (cardId) => {
    const status = get().progress.scratchCards[cardId]
    return status || 'locked'
  },
  
  spinWheel: (result) => set((state) => {
    state.progress.wheelSpins += 1
    state.progress.lastWheelSpin = new Date().toISOString()
    state.progress.wheelHistory.push({
      date: new Date().toISOString(),
      result
    })
  }, false, 'progress/spinWheel'),
  
  canSpinWheel: () => {
    const { lastWheelSpin } = get().progress
    if (!lastWheelSpin) return true
    
    const now = new Date()
    const lastSpin = new Date(lastWheelSpin)
    const minutesDiff = (now.getTime() - lastSpin.getTime()) / (1000 * 60)
    
    return minutesDiff >= 60 // Cooldown de 60 minutes
  },
  
  waterPlant: (plantId) => {
    const state = get()
    if (!state.canWaterToday()) return false
    
    set((draft) => {
      const currentStage = draft.progress.gardenPlants[plantId] || 0
      draft.progress.gardenPlants[plantId] = currentStage + 1
      draft.progress.gardenWaters += 1
      draft.progress.lastWaterDate = new Date().toISOString()
    }, false, 'progress/waterPlant')
    
    return true
  },
  
  canWaterToday: () => {
    const { lastWaterDate, gardenWaters } = get().progress
    if (!lastWaterDate) return true
    
    const today = format(new Date(), 'yyyy-MM-DD')
    const lastWater = format(new Date(lastWaterDate), 'yyyy-MM-DD')
    
    if (today !== lastWater) return true
    
    // Vérifier le nombre d'arrosages aujourd'hui
    // TODO: Implémenter la logique de comptage quotidien
    return gardenWaters < 3 // Max 3 par jour
  },
  
  getPlantStage: (plantId) => {
    return get().progress.gardenPlants[plantId] || 0
  },
  
  unlockBadge: (badgeId) => set((state) => {
    if (!state.progress.badges.includes(badgeId)) {
      state.progress.badges.push(badgeId)
    }
  }, false, 'progress/unlockBadge'),
  
  hasBadge: (badgeId) => {
    return get().progress.badges.includes(badgeId)
  },
  
  addTonightResult: (category, option) => set((state) => {
    state.progress.tonightHistory.push({
      date: new Date().toISOString(),
      result: { category, option }
    })
    // Garder seulement les 10 derniers
    if (state.progress.tonightHistory.length > 10) {
      state.progress.tonightHistory = state.progress.tonightHistory.slice(-10)
    }
  }, false, 'progress/addTonightResult'),
  
  getDaysSinceStart: (startDate) => {
    const start = new Date(startDate)
    const now = new Date()
    return differenceInDays(now, start)
  },
  
  getStreakStatus: () => {
    const { visitStreak, lastVisit } = get().progress
    const now = new Date()
    const last = new Date(lastVisit)
    const daysDiff = differenceInDays(now, last)
    
    return {
      current: visitStreak,
      isActive: daysDiff <= 1
    }
  }
})
```

### 2.3 Modules Slice

```typescript
// store/slices/modulesSlice.ts
import { StateCreator } from 'zustand'
import { AppStore } from '../index'
import contentData from '@/data/content.json'

export interface ModulesSlice {
  // Données chargées depuis JSON
  timeline: any[]
  letters: any[]
  calendar: any[]
  challenges: any[]
  dailyMessages: any[]
  scratchCards: any[]
  quiz: any[]
  memoryMap: any[]
  garden: any
  wheel: any
  tonight: any
  badges: any[]
  
  // Actions
  loadContent: () => void
  refreshContent: () => Promise<void>
}

export const createModulesSlice: StateCreator<
  AppStore,
  [['zustand/immer', never], ['zustand/devtools', never], ['zustand/persist', unknown]],
  [],
  ModulesSlice
> = (set) => ({
  timeline: [],
  letters: [],
  calendar: [],
  challenges: [],
  dailyMessages: [],
  scratchCards: [],
  quiz: [],
  memoryMap: [],
  garden: null,
  wheel: null,
  tonight: null,
  badges: [],
  
  loadContent: () => set((state) => {
    // Charger depuis le JSON statique
    state.timeline = contentData.timeline || []
    state.letters = contentData.letters || []
    state.calendar = contentData.calendar || []
    state.challenges = contentData.challenges || []
    state.dailyMessages = contentData.dailyMessages || []
    state.scratchCards = contentData.scratchCards || []
    state.quiz = contentData.quiz || []
    state.memoryMap = contentData.memoryMap || []
    state.garden = contentData.garden || null
    state.wheel = contentData.wheel || null
    state.tonight = contentData.tonight || null
    state.badges = contentData.badges || []
  }, false, 'modules/loadContent'),
  
  refreshContent: async () => {
    // Pour le mode cloud: recharger depuis Firebase
    try {
      // const freshData = await fetchFromFirebase()
      // set((state) => { ... })
    } catch (error) {
      console.error('Failed to refresh content:', error)
    }
  }
})
```

### 2.4 Settings Slice

```typescript
// store/slices/settingsSlice.ts
import { StateCreator } from 'zustand'
import { AppStore } from '../index'

export interface Settings {
  // Préférences UI
  theme: 'light' | 'dark' | 'auto'
  language: 'fr' | 'en'
  animations: boolean
  soundEffects: boolean
  hapticFeedback: boolean
  
  // Notifications
  notificationsEnabled: boolean
  dailyReminder: boolean
  reminderTime: string // "HH:mm"
  
  // Synchronisation
  cloudSyncEnabled: boolean
  autoSync: boolean
  lastSyncDate: string | null
  
  // Confidentialité
  analyticsEnabled: boolean
  crashReportsEnabled: boolean
  
  // Accessibilité
  fontSize: 'small' | 'medium' | 'large'
  highContrast: boolean
  reduceMotion: boolean
}

export interface SettingsSlice {
  settings: Settings
  
  // Actions
  updateSettings: (updates: Partial<Settings>) => void
  resetSettings: () => void
  toggleSetting: (key: keyof Settings) => void
}

const defaultSettings: Settings = {
  theme: 'auto',
  language: 'fr',
  animations: true,
  soundEffects: true,
  hapticFeedback: true,
  notificationsEnabled: false,
  dailyReminder: false,
  reminderTime: '20:00',
  cloudSyncEnabled: false,
  autoSync: false,
  lastSyncDate: null,
  analyticsEnabled: false,
  crashReportsEnabled: true,
  fontSize: 'medium',
  highContrast: false,
  reduceMotion: false
}

export const createSettingsSlice: StateCreator<
  AppStore,
  [['zustand/immer', never], ['zustand/devtools', never], ['zustand/persist', unknown]],
  [],
  SettingsSlice
> = (set) => ({
  settings: defaultSettings,
  
  updateSettings: (updates) => set((state) => {
    state.settings = { ...state.settings, ...updates }
  }, false, 'settings/update'),
  
  resetSettings: () => set((state) => {
    state.settings = defaultSettings
  }, false, 'settings/reset'),
  
  toggleSetting: (key) => set((state) => {
    const currentValue = state.settings[key]
    if (typeof currentValue === 'boolean') {
      state.settings[key] = !currentValue as any
    }
  }, false, 'settings/toggle')
})
```

---

## 3. Persistance des Données

### 3.1 LocalStorage Strategy

```typescript
// services/storage/localStorage.ts
import { AppStore } from '@/store'

export const STORAGE_KEY = 'love-quest-storage'
export const STORAGE_VERSION = 1

export interface StorageData {
  version: number
  state: Partial<AppStore>
  timestamp: string
}

export const saveToLocalStorage = (state: Partial<AppStore>): void => {
  try {
    const data: StorageData = {
      version: STORAGE_VERSION,
      state,
      timestamp: new Date().toISOString()
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (error) {
    console.error('Failed to save to localStorage:', error)
  }
}

export const loadFromLocalStorage = (): Partial<AppStore> | null => {
  try {
    const item = localStorage.getItem(STORAGE_KEY)
    if (!item) return null
    
    const data: StorageData = JSON.parse(item)
    
    // Vérifier la version
    if (data.version !== STORAGE_VERSION) {
      console.warn('Storage version mismatch, migrating...')
      return migrateStorage(data)
    }
    
    return data.state
  } catch (error) {
    console.error('Failed to load from localStorage:', error)
    return null
  }
}

export const clearLocalStorage = (): void => {
  localStorage.removeItem(STORAGE_KEY)
}

const migrateStorage = (oldData: StorageData): Partial<AppStore> | null => {
  // Logique de migration entre versions
  // TODO: Implémenter selon les besoins
  return oldData.state
}
```

### 3.2 IndexedDB Strategy

```typescript
// services/storage/indexedDB.ts
import { openDB, DBSchema, IDBPDatabase } from 'idb'

interface LoveQuestDB extends DBSchema {
  progress: {
    key: string
    value: any
  }
  content: {
    key: string
    value: any
  }
  media: {
    key: string
    value: {
      id: string
      type: 'image' | 'audio' | 'video'
      blob: Blob
      metadata: Record<string, any>
      createdAt: string
    }
  }
}

const DB_NAME = 'love-quest-db'
const DB_VERSION = 1

let dbInstance: IDBPDatabase<LoveQuestDB> | null = null

export const initDB = async (): Promise<IDBPDatabase<LoveQuestDB>> => {
  if (dbInstance) return dbInstance
  
  dbInstance = await openDB<LoveQuestDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Store pour la progression
      if (!db.objectStoreNames.contains('progress')) {
        db.createObjectStore('progress')
      }
      
      // Store pour le contenu
      if (!db.objectStoreNames.contains('content')) {
        db.createObjectStore('content')
      }
      
      // Store pour les médias
      if (!db.objectStoreNames.contains('media')) {
        const mediaStore = db.createObjectStore('media', { keyPath: 'id' })
        mediaStore.createIndex('type', 'type')
        mediaStore.createIndex('createdAt', 'createdAt')
      }
    }
  })
  
  return dbInstance
}

export const saveProgress = async (key: string, value: any): Promise<void> => {
  const db = await initDB()
  await db.put('progress', value, key)
}

export const loadProgress = async (key: string): Promise<any> => {
  const db = await initDB()
  return await db.get('progress', key)
}

export const saveMedia = async (
  id: string,
  type: 'image' | 'audio' | 'video',
  blob: Blob,
  metadata: Record<string, any> = {}
): Promise<void> => {
  const db = await initDB()
  await db.put('media', {
    id,
    type,
    blob,
    metadata,
    createdAt: new Date().toISOString()
  })
}

export const loadMedia = async (id: string): Promise<Blob | undefined> => {
  const db = await initDB()
  const media = await db.get('media', id)
  return media?.blob
}

export const clearAllData = async (): Promise<void> => {
  const db = await initDB()
  await db.clear('progress')
  await db.clear('content')
  await db.clear('media')
}
```

---

## 4. Synchronisation Cloud

### 4.1 Sync Service

```typescript
// services/storage/syncService.ts
import { getFirestore, doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { useStore } from '@/store'

export class SyncService {
  private db = getFirestore()
  private unsubscribe: (() => void) | null = null
  
  async syncToCloud(): Promise<void> {
    const auth = getAuth()
    const user = auth.currentUser
    
    if (!user) {
      throw new Error('User not authenticated')
    }
    
    const state = useStore.getState()
    const dataToSync = {
      progress: state.progress,
      settings: state.settings,
      lastSync: new Date().toISOString()
    }
    
    const userDocRef = doc(this.db, 'users', user.uid)
    await setDoc(userDocRef, dataToSync, { merge: true })
  }
  
  async syncFromCloud(): Promise<void> {
    const auth = getAuth()
    const user = auth.currentUser
    
    if (!user) {
      throw new Error('User not authenticated')
    }
    
    const userDocRef = doc(this.db, 'users', user.uid)
    const docSnap = await getDoc(userDocRef)
    
    if (docSnap.exists()) {
      const cloudData = docSnap.data()
      
      // Merger avec les données locales
      const localState = useStore.getState()
      const mergedData = this.mergeData(localState, cloudData)
      
      // Mettre à jour le store
      useStore.setState(mergedData)
    }
  }
  
  enableRealtimeSync(): void {
    const auth = getAuth()
    const user = auth.currentUser
    
    if (!user) return
    
    const userDocRef = doc(this.db, 'users', user.uid)
    
    this.unsubscribe = onSnapshot(userDocRef, (doc) => {
      if (doc.exists()) {
        const cloudData = doc.data()
        const localState = useStore.getState()
        const mergedData = this.mergeData(localState, cloudData)
        useStore.setState(mergedData)
      }
    })
  }
  
  disableRealtimeSync(): void {
    if (this.unsubscribe) {
      this.unsubscribe()
      this.unsubscribe = null
    }
  }
  
  private mergeData(local: any, cloud: any): any {
    // Stratégie de merge: le plus récent gagne
    // Pour les tableaux: union
    // Pour les objets: merge profond
    
    const merged = { ...local }
    
    // Merger progress
    if (cloud.progress) {
      merged.progress = {
        ...local.progress,
        ...cloud.progress,
        // Arrays: union
        modulesVisited: Array.from(new Set([
          ...(local.progress.modulesVisited || []),
          ...(cloud.progress.modulesVisited || [])
        ])),
        lettersRead: Array.from(new Set([
          ...(local.progress.lettersRead || []),
          ...(cloud.progress.lettersRead || [])
        ])),
        badges: Array.from(new Set([
          ...(local.progress.badges || []),
          ...(cloud.progress.badges || [])
        ]))
      }
    }
    
    // Merger settings: cloud gagne
    if (cloud.settings) {
      merged.settings = cloud.settings
    }
    
    return merged
  }
}

export const syncService = new SyncService()
```

---

## 5. Hooks Personnalisés

### 5.1 useProgress Hook

```typescript
// hooks/useProgress.ts
import { useStore } from '@/store'
import { useCallback } from 'react'

export const useProgress = () => {
  const progress = useStore(state => state.progress)
  const actions = {
    updateLastVisit: useStore(state => state.updateLastVisit),
    markModuleVisited: useStore(state => state.markModuleVisited),
    markLetterRead: useStore(state => state.markLetterRead),
    completeChallenge: useStore(state => state.completeChallenge),
    unlockBadge: useStore(state => state.unlockBadge)
  }
  
  return {
    progress,
    ...actions
  }
}
```

### 5.2 useSync Hook

```typescript
// hooks/useSync.ts
import { useState, useEffect } from 'react'
import { syncService } from '@/services/storage/syncService'
import { useStore } from '@/store'

export const useSync = () => {
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSyncDate, setLastSyncDate] = useState<string | null>(null)
  const cloudSyncEnabled = useStore(state => state.settings.cloudSyncEnabled)
  
  const syncNow = useCallback(async () => {
    if (!cloudSyncEnabled) return
    
    setIsSyncing(true)
    try {
      await syncService.syncToCloud()
      const now = new Date().toISOString()
      setLastSyncDate(now)
      useStore.getState().updateSettings({ lastSyncDate: now })
    } catch (error) {
      console.error('Sync failed:', error)
    } finally {
      setIsSyncing(false)
    }
  }, [cloudSyncEnabled])
  
  useEffect(() => {
    if (cloudSyncEnabled) {
      syncService.enableRealtimeSync()