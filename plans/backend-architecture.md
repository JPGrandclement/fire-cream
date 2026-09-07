---
render_with_liquid: false
---

# ☁️ Architecture Backend Léger - Love Quest

## Vue d'Ensemble

Architecture backend minimaliste basée sur Firebase pour l'authentification, le stockage cloud optionnel et la synchronisation des données.

---

## 1. Firebase Configuration

### 1.1 Setup Firebase

```typescript
// services/firebase/config.ts
import { initializeApp, FirebaseApp } from 'firebase/app'
import { getAuth, Auth } from 'firebase/auth'
import { getFirestore, Firestore } from 'firebase/firestore'
import { getStorage, FirebaseStorage } from 'firebase/storage'
import { getAnalytics, Analytics } from 'firebase/analytics'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
}

let app: FirebaseApp
let auth: Auth
let db: Firestore
let storage: FirebaseStorage
let analytics: Analytics | null = null

export const initializeFirebase = () => {
  if (!app) {
    app = initializeApp(firebaseConfig)
    auth = getAuth(app)
    db = getFirestore(app)
    storage = getStorage(app)
    
    // Analytics uniquement en production
    if (import.meta.env.PROD) {
      analytics = getAnalytics(app)
    }
  }
  
  return { app, auth, db, storage, analytics }
}

export { app, auth, db, storage, analytics }
```

### 1.2 Variables d'Environnement

```bash
# .env.example
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

---

## 2. Authentification

### 2.1 Auth Service

```typescript
// services/firebase/auth.ts
import {
  signInAnonymously,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile,
  sendPasswordResetEmail,
  EmailAuthProvider,
  linkWithCredential
} from 'firebase/auth'
import { auth } from './config'
import { useStore } from '@/store'

export class AuthService {
  /**
   * Connexion anonyme (par défaut pour l'app)
   */
  async signInAnonymously(): Promise<FirebaseUser> {
    const result = await signInAnonymously(auth)
    return result.user
  }
  
  /**
   * Créer un compte avec email/password
   */
  async signUpWithEmail(email: string, password: string, displayName?: string): Promise<FirebaseUser> {
    const result = await createUserWithEmailAndPassword(auth, email, password)
    
    if (displayName) {
      await updateProfile(result.user, { displayName })
    }
    
    return result.user
  }
  
  /**
   * Connexion avec email/password
   */
  async signInWithEmail(email: string, password: string): Promise<FirebaseUser> {
    const result = await signInWithEmailAndPassword(auth, email, password)
    return result.user
  }
  
  /**
   * Convertir un compte anonyme en compte permanent
   */
  async upgradeAnonymousAccount(email: string, password: string): Promise<FirebaseUser> {
    const currentUser = auth.currentUser
    
    if (!currentUser || !currentUser.isAnonymous) {
      throw new Error('No anonymous user to upgrade')
    }
    
    const credential = EmailAuthProvider.credential(email, password)
    const result = await linkWithCredential(currentUser, credential)
    
    return result.user
  }
  
  /**
   * Déconnexion
   */
  async signOut(): Promise<void> {
    await firebaseSignOut(auth)
    useStore.getState().clearUser()
  }
  
  /**
   * Réinitialisation du mot de passe
   */
  async resetPassword(email: string): Promise<void> {
    await sendPasswordResetEmail(auth, email)
  }
  
  /**
   * Observer les changements d'état d'authentification
   */
  onAuthStateChange(callback: (user: FirebaseUser | null) => void): () => void {
    return onAuthStateChanged(auth, callback)
  }
  
  /**
   * Obtenir l'utilisateur actuel
   */
  getCurrentUser(): FirebaseUser | null {
    return auth.currentUser
  }
}

export const authService = new AuthService()
```

### 2.2 Auth Hook

```typescript
// hooks/useAuth.ts
import { useState, useEffect } from 'react'
import { User as FirebaseUser } from 'firebase/auth'
import { authService } from '@/services/firebase/auth'
import { useStore } from '@/store'

export const useAuth = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const user = useStore(state => state.user)
  const setUser = useStore(state => state.setUser)
  const clearUser = useStore(state => state.clearUser)
  
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange((firebaseUser) => {
      if (firebaseUser) {
        setUser({
          id: firebaseUser.uid,
          isAnonymous: firebaseUser.isAnonymous,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          createdAt: firebaseUser.metadata.creationTime || new Date().toISOString(),
          lastLoginAt: firebaseUser.metadata.lastSignInTime || new Date().toISOString()
        })
      } else {
        clearUser()
      }
      setLoading(false)
    })
    
    return () => unsubscribe()
  }, [setUser, clearUser])
  
  const signInAnonymously = async () => {
    try {
      setError(null)
      await authService.signInAnonymously()
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }
  
  const signUpWithEmail = async (email: string, password: string, displayName?: string) => {
    try {
      setError(null)
      await authService.signUpWithEmail(email, password, displayName)
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }
  
  const signInWithEmail = async (email: string, password: string) => {
    try {
      setError(null)
      await authService.signInWithEmail(email, password)
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }
  
  const upgradeAccount = async (email: string, password: string) => {
    try {
      setError(null)
      await authService.upgradeAnonymousAccount(email, password)
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }
  
  const signOut = async () => {
    try {
      setError(null)
      await authService.signOut()
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }
  
  return {
    user,
    loading,
    error,
    signInAnonymously,
    signUpWithEmail,
    signInWithEmail,
    upgradeAccount,
    signOut
  }
}
```

---

## 3. Firestore Database

### 3.1 Structure de la Base de Données

```
firestore/
├── users/
│   └── {userId}/
│       ├── profile/
│       │   ├── displayName: string
│       │   ├── email: string
│       │   ├── photoURL: string
│       │   └── createdAt: timestamp
│       ├── progress/
│       │   ├── visitStreak: number
│       │   ├── totalVisits: number
│       │   ├── badges: string[]
│       │   ├── challengesCompleted: string[]
│       │   └── ... (tout le progress state)
│       ├── settings/
│       │   ├── theme: string
│       │   ├── notifications: boolean
│       │   └── ... (tous les settings)
│       └── media/
│           └── {mediaId}/
│               ├── type: string
│               ├── url: string
│               ├── metadata: object
│               └── uploadedAt: timestamp
│
└── content/ (optionnel - pour contenu dynamique)
    └── {contentId}/
        ├── type: string
        ├── data: object
        └── updatedAt: timestamp
```

### 3.2 Firestore Service

```typescript
// services/firebase/firestore.ts
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore'
import { db } from './config'

export class FirestoreService {
  /**
   * Sauvegarder la progression de l'utilisateur
   */
  async saveUserProgress(userId: string, progress: any): Promise<void> {
    const progressRef = doc(db, 'users', userId, 'data', 'progress')
    await setDoc(progressRef, {
      ...progress,
      updatedAt: serverTimestamp()
    }, { merge: true })
  }
  
  /**
   * Charger la progression de l'utilisateur
   */
  async loadUserProgress(userId: string): Promise<any | null> {
    const progressRef = doc(db, 'users', userId, 'data', 'progress')
    const progressSnap = await getDoc(progressRef)
    
    if (progressSnap.exists()) {
      return progressSnap.data()
    }
    
    return null
  }
  
  /**
   * Sauvegarder les paramètres de l'utilisateur
   */
  async saveUserSettings(userId: string, settings: any): Promise<void> {
    const settingsRef = doc(db, 'users', userId, 'data', 'settings')
    await setDoc(settingsRef, {
      ...settings,
      updatedAt: serverTimestamp()
    }, { merge: true })
  }
  
  /**
   * Charger les paramètres de l'utilisateur
   */
  async loadUserSettings(userId: string): Promise<any | null> {
    const settingsRef = doc(db, 'users', userId, 'data', 'settings')
    const settingsSnap = await getDoc(settingsRef)
    
    if (settingsSnap.exists()) {
      return settingsSnap.data()
    }
    
    return null
  }
  
  /**
   * Observer les changements en temps réel
   */
  subscribeToUserData(
    userId: string,
    onUpdate: (data: any) => void
  ): () => void {
    const progressRef = doc(db, 'users', userId, 'data', 'progress')
    
    return onSnapshot(progressRef, (snapshot) => {
      if (snapshot.exists()) {
        onUpdate(snapshot.data())
      }
    })
  }
  
  /**
   * Supprimer toutes les données utilisateur
   */
  async deleteUserData(userId: string): Promise<void> {
    const progressRef = doc(db, 'users', userId, 'data', 'progress')
    const settingsRef = doc(db, 'users', userId, 'data', 'settings')
    
    await Promise.all([
      deleteDoc(progressRef),
      deleteDoc(settingsRef)
    ])
  }
}

export const firestoreService = new FirestoreService()
```

---

## 4. Firebase Storage

### 4.1 Storage Service

```typescript
// services/firebase/storage.ts
import {
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  listAll,
  UploadTask
} from 'firebase/storage'
import { storage } from './config'

export class StorageService {
  /**
   * Upload une image
   */
  async uploadImage(
    userId: string,
    file: File,
    path: string,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    const storageRef = ref(storage, `users/${userId}/${path}/${file.name}`)
    
    if (onProgress) {
      return this.uploadWithProgress(storageRef, file, onProgress)
    }
    
    const snapshot = await uploadBytes(storageRef, file)
    return await getDownloadURL(snapshot.ref)
  }
  
  /**
   * Upload avec suivi de progression
   */
  private uploadWithProgress(
    storageRef: any,
    file: File,
    onProgress: (progress: number) => void
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadTask = uploadBytesResumable(storageRef, file)
      
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          onProgress(progress)
        },
        (error) => {
          reject(error)
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
          resolve(downloadURL)
        }
      )
    })
  }
  
  /**
   * Télécharger une image
   */
  async getImageURL(userId: string, path: string): Promise<string> {
    const storageRef = ref(storage, `users/${userId}/${path}`)
    return await getDownloadURL(storageRef)
  }
  
  /**
   * Supprimer une image
   */
  async deleteImage(userId: string, path: string): Promise<void> {
    const storageRef = ref(storage, `users/${userId}/${path}`)
    await deleteObject(storageRef)
  }
  
  /**
   * Lister toutes les images d'un utilisateur
   */
  async listUserImages(userId: string, folder: string = ''): Promise<string[]> {
    const storageRef = ref(storage, `users/${userId}/${folder}`)
    const result = await listAll(storageRef)
    
    const urls = await Promise.all(
      result.items.map(item => getDownloadURL(item))
    )
    
    return urls
  }
}

export const storageService = new StorageService()
```

---

## 5. Cloud Functions (Optionnel)

### 5.1 Functions Setup

```typescript
// functions/src/index.ts
import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'

admin.initializeApp()

/**
 * Fonction déclenchée lors de la création d'un utilisateur
 */
export const onUserCreated = functions.auth.user().onCreate(async (user) => {
  const db = admin.firestore()
  
  // Initialiser les données par défaut
  await db.collection('users').doc(user.uid).collection('data').doc('progress').set({
    firstVisit: true,
    visitStreak: 1,
    totalVisits: 1,
    badges: ['first_visit'],
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  })
  
  return null
})

/**
 * Fonction pour nettoyer les données d'un utilisateur supprimé
 */
export const onUserDeleted = functions.auth.user().onDelete(async (user) => {
  const db = admin.firestore()
  const storage = admin.storage()
  
  // Supprimer les données Firestore
  const userRef = db.collection('users').doc(user.uid)
  await deleteCollection(db, userRef.path, 10)
  
  // Supprimer les fichiers Storage
  const bucket = storage.bucket()
  await bucket.deleteFiles({
    prefix: `users/${user.uid}/`
  })
  
  return null
})

/**
 * Fonction pour calculer les statistiques quotidiennes
 */
export const dailyStatsCalculation = functions.pubsub
  .schedule('0 0 * * *') // Tous les jours à minuit
  .timeZone('Europe/Paris')
  .onRun(async (context) => {
    const db = admin.firestore()
    
    // Logique de calcul des stats
    // Réinitialiser les compteurs quotidiens, etc.
    
    return null
  })

/**
 * Fonction pour envoyer des notifications quotidiennes
 */
export const sendDailyReminders = functions.pubsub
  .schedule('0 20 * * *') // Tous les jours à 20h
  .timeZone('Europe/Paris')
  .onRun(async (context) => {
    const db = admin.firestore()
    
    // Récupérer les utilisateurs avec notifications activées
    const usersSnapshot = await db.collection('users')
      .where('settings.dailyReminder', '==', true)
      .get()
    
    // Envoyer les notifications
    // TODO: Implémenter avec FCM
    
    return null
  })

/**
 * Helper pour supprimer une collection
 */
async function deleteCollection(
  db: admin.firestore.Firestore,
  collectionPath: string,
  batchSize: number
): Promise<void> {
  const collectionRef = db.collection(collectionPath)
  const query = collectionRef.limit(batchSize)
  
  return new Promise((resolve, reject) => {
    deleteQueryBatch(db, query, resolve).catch(reject)
  })
}

async function deleteQueryBatch(
  db: admin.firestore.Firestore,
  query: admin.firestore.Query,
  resolve: () => void
): Promise<void> {
  const snapshot = await query.get()
  
  const batchSize = snapshot.size
  if (batchSize === 0) {
    resolve()
    return
  }
  
  const batch = db.batch()
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref)
  })
  await batch.commit()
  
  process.nextTick(() => {
    deleteQueryBatch(db, query, resolve)
  })
}
```

---

## 6. Règles de Sécurité

### 6.1 Firestore Rules

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // Users collection
    match /users/{userId} {
      // Lecture: uniquement le propriétaire
      allow read: if isOwner(userId);
      
      // Écriture: uniquement le propriétaire
      allow write: if isOwner(userId);
      
      // Sous-collections
      match /data/{document=**} {
        allow read: if isOwner(userId);
        allow write: if isOwner(userId);
      }
    }
    
    // Content collection (lecture seule pour tous)
    match /content/{contentId} {
      allow read: if isAuthenticated();
      allow write: if false; // Seulement via admin
    }
  }
}
```

### 6.2 Storage Rules

```javascript
// storage.rules
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    function isImage() {
      return request.resource.contentType.matches('image/.*');
    }
    
    function isValidSize() {
      return request.resource.size < 5 * 1024 * 1024; // 5MB max
    }
    
    // User files
    match /users/{userId}/{allPaths=**} {
      allow read: if isOwner(userId);
      allow write: if isOwner(userId) 
                   && isImage() 
                   && isValidSize();
      allow delete: if isOwner(userId);
    }
  }
}
```

---

## 7. API Endpoints (Optionnel)

### 7.1 REST API avec Cloud Functions

```typescript
// functions/src/api.ts
import * as functions from 'firebase-functions'
import * as express from 'express'
import * as cors from 'cors'
import * as admin from 'firebase-admin'

const app = express()
app.use(cors({ origin: true }))
app.use(express.json())

// Middleware d'authentification
const authenticate = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }
  
  const token = authHeader.split('Bearer ')[1]
  
  try {
    const decodedToken = await admin.auth().verifyIdToken(token)
    req.user = decodedToken
    next()
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' })
  }
}

// GET /api/progress
app.get('/progress', authenticate, async (req, res) => {
  try {
    const userId = req.user!.uid
    const db = admin.firestore()
    
    const progressDoc = await db
      .collection('users')
      .doc(userId)
      .collection('data')
      .doc('progress')
      .get()
    
    if (!progressDoc.exists) {
      res.status(404).json({ error: 'Progress not found' })
      return
    }
    
    res.json(progressDoc.data())
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

// POST /api/progress
app.post('/progress', authenticate, async (req, res) => {
  try {
    const userId = req.user!.uid
    const progressData = req.body
    const db = admin.firestore()
    
    await db
      .collection('users')
      .doc(userId)
      .collection('data')
      .doc('progress')
      .set(progressData, { merge: true })
    
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

// GET /api/badges
app.get('/badges', authenticate, async (req, res) => {
  try {
    const userId = req.user!.uid
    const db = admin.firestore()
    
    const progressDoc = await db
      .collection('users')
      .doc(userId)
      .collection('data')
      .doc('progress')
      .get()
    
    const badges = progressDoc.data()?.badges || []
    res.json({ badges })
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

export const api = functions.https.onRequest(app)
```

---

## 8. Monitoring & Analytics

### 8.1 Firebase Analytics

```typescript
// services/analytics/tracker.ts
import { logEvent, setUserId, setUserProperties } from 'firebase/analytics'
import { analytics } from '@/services/firebase/config'

export class AnalyticsService {
  trackPageView(pageName: string): void {
    if (!analytics) return
    
    logEvent(analytics, 'page_view', {
      page_title: pageName,
      page_location: window.location.href,
      page_path: window.location.pathname
    })
  }
  
  trackModuleVisit(moduleId: string, moduleName: string): void {
    if (!analytics) return
    
    logEvent(analytics, 'module_visit', {
      module_id: moduleId,
      module_name: moduleName
    })
  }
  
  trackBadgeUnlock(badgeId: string, badgeName: string): void {
    if (!analytics) return
    
    logEvent(analytics, 'badge_unlock', {
      badge_id: badgeId,
      badge_name: badgeName
    })
  }
  
  trackChallengeComplete(challengeId: string): void {
    if (!analytics) return
    
    logEvent(analytics, 'challenge_complete', {
      challenge_id: challengeId
    })
  }
  
  setUser(userId: string): void {
    if (!analytics) return
    
    setUserId(analytics, userId)
  }
  
  setUserProperty(name: string, value: string): void {
    if (!analytics) return
    
    setUserProperties(analytics, { [name]: value })
  }
}

export const analyticsService = new AnalyticsService()
```

---

## 9. Coûts et Limites Firebase

### 9.1 Plan Gratuit (Spark)

| Service | Limite Gratuite | Dépassement |
|---------|----------------|-------------|
| **Authentication** | Illimité | Gratuit |
| **Firestore** | 1 GB stockage, 50K lectures/jour, 20K écritures/jour | $0.18/GB, $0.06/100K lectures |
| **Storage** | 5 GB stockage, 1 GB/jour téléchargement | $0.026/GB |
| **Hosting** | 10 GB/mois | $0.15/GB |
| **Functions** | 125K invocations/mois, 40K GB-secondes | $0.40/million |

### 9.2 Optimisations pour Rester Gratuit

1. **Utiliser le cache local au maximum**
2. **Limiter les lectures Firestore** (utiliser IndexedDB)
3. **Compresser les images** avant upload
4. **Utiliser le CDN** pour les assets statiques
5. **Limiter les Cloud Functions** (privilégier le client-side)

---

## 10. Déploiement Backend

### 10.1 Firebase CLI

```bash
# Installation
npm install -g firebase-tools

# Login
firebase login

# Initialisation
firebase init

# Déploiement
firebase deploy

# Déploiement sélectif
firebase deploy --only firestore:rules
firebase deploy --only storage:rules
firebase deploy --only functions
firebase deploy --only hosting
```

### 10.2 CI/CD avec GitHub Actions

```yaml
# .github/workflows/firebase-deploy.yml
name: Deploy to Firebase

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Deploy to Firebase
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          channelId: live
          projectId: your-project-id
```

---

## 11. Backup et Récupération

### 11.1 Backup Automatique

```typescript
// functions/src/backup.ts
import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'

export const scheduledFirestoreBackup = functions.pubsub
  .schedule('0 2 * * *') // Tous les jours à 2h du matin
  .timeZone('Europe/Paris')
  .onRun(async (context) => {
    const projectId = process.env.GCP_PROJECT || process.env.GCLOUD_PROJECT
    const databaseName = '(default)'
    
    const client = new admin.firestore.v1.FirestoreAdminClient()
    
    const bucket = `gs://${projectId}-firestore-backups`
    
    await client.exportDocuments({
      name: client.databasePath(projectId!, databaseName),
      outputUriPrefix: bucket,
      collectionIds: ['users']
    })
    
    console.log('Backup completed successfully')
    return null
  })
```

