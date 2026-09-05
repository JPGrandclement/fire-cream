# 🔒 Sécurité & Confidentialité - Love Quest

## Vue d'Ensemble

Ce document détaille toutes les mesures de sécurité et de confidentialité pour protéger les données personnelles et romantiques des utilisateurs.

---

## 1. Principes de Sécurité

### 1.1 Principes Fondamentaux

1. **Privacy by Design** - La confidentialité est intégrée dès la conception
2. **Data Minimization** - Collecter uniquement les données nécessaires
3. **Encryption at Rest & in Transit** - Chiffrement des données
4. **User Control** - L'utilisateur contrôle ses données
5. **Transparency** - Communication claire sur l'utilisation des données

### 1.2 Classification des Données

| Type de Données | Sensibilité | Stockage | Chiffrement |
|----------------|-------------|----------|-------------|
| **Contenu romantique** (lettres, messages) | Très élevée | Local + Cloud (opt) | Oui |
| **Photos personnelles** | Très élevée | Local + Cloud (opt) | Oui |
| **Progression/Stats** | Moyenne | Local + Cloud (opt) | Oui |
| **Préférences UI** | Faible | Local | Non |
| **Email** (si compte) | Élevée | Firebase Auth | Oui |
| **Données analytiques** | Faible | Firebase Analytics | Anonymisées |

---

## 2. Authentification & Autorisation

### 2.1 Stratégie d'Authentification

```typescript
// services/security/authStrategy.ts

export enum AuthMode {
  ANONYMOUS = 'anonymous',      // Par défaut - aucune donnée cloud
  EMAIL = 'email',              // Compte avec email/password
  UPGRADED = 'upgraded'         // Anonyme converti en compte permanent
}

export interface AuthConfig {
  mode: AuthMode
  requirePassword: boolean
  enableBiometric: boolean      // Touch ID / Face ID
  sessionTimeout: number        // Minutes d'inactivité
  requireReauth: boolean        // Pour actions sensibles
}

export const defaultAuthConfig: AuthConfig = {
  mode: AuthMode.ANONYMOUS,
  requirePassword: false,
  enableBiometric: false,
  sessionTimeout: 30,
  requireReauth: true
}
```

### 2.2 Protection par Code PIN (Optionnel)

```typescript
// features/security/PinLock.tsx
import { useState, useEffect } from 'react'
import { useStore } from '@/store'
import { hashPin, verifyPin } from '@/utils/crypto'

export const usePinLock = () => {
  const [isLocked, setIsLocked] = useState(true)
  const [attempts, setAttempts] = useState(0)
  const pinHash = useStore(state => state.settings.pinHash)
  
  const setupPin = async (pin: string): Promise<void> => {
    const hash = await hashPin(pin)
    useStore.getState().updateSettings({ 
      pinHash: hash,
      pinEnabled: true 
    })
  }
  
  const verifyPinCode = async (pin: string): Promise<boolean> => {
    if (!pinHash) return true
    
    const isValid = await verifyPin(pin, pinHash)
    
    if (isValid) {
      setIsLocked(false)
      setAttempts(0)
      return true
    }
    
    setAttempts(prev => prev + 1)
    
    // Blocage après 5 tentatives
    if (attempts >= 4) {
      // Déclencher un délai ou effacer les données
      console.warn('Too many failed attempts')
    }
    
    return false
  }
  
  const lockApp = (): void => {
    setIsLocked(true)
  }
  
  return {
    isLocked,
    attempts,
    setupPin,
    verifyPinCode,
    lockApp
  }
}
```

### 2.3 Biométrie (Touch ID / Face ID)

```typescript
// services/security/biometric.ts

export class BiometricService {
  async isAvailable(): Promise<boolean> {
    // Vérifier si l'API Web Authentication est disponible
    return 'credentials' in navigator && 'PublicKeyCredential' in window
  }
  
  async register(userId: string): Promise<void> {
    const publicKey: PublicKeyCredentialCreationOptions = {
      challenge: new Uint8Array(32), // Générer un challenge aléatoire
      rp: {
        name: 'Love Quest',
        id: window.location.hostname
      },
      user: {
        id: new TextEncoder().encode(userId),
        name: userId,
        displayName: 'Love Quest User'
      },
      pubKeyCredParams: [
        { type: 'public-key', alg: -7 },  // ES256
        { type: 'public-key', alg: -257 } // RS256
      ],
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        userVerification: 'required'
      },
      timeout: 60000
    }
    
    const credential = await navigator.credentials.create({ publicKey })
    
    // Stocker la credential
    if (credential) {
      localStorage.setItem('biometric_credential', JSON.stringify(credential))
    }
  }
  
  async authenticate(): Promise<boolean> {
    try {
      const storedCredential = localStorage.getItem('biometric_credential')
      if (!storedCredential) return false
      
      const publicKey: PublicKeyCredentialRequestOptions = {
        challenge: new Uint8Array(32),
        timeout: 60000,
        userVerification: 'required'
      }
      
      const assertion = await navigator.credentials.get({ publicKey })
      
      return assertion !== null
    } catch (error) {
      console.error('Biometric authentication failed:', error)
      return false
    }
  }
}

export const biometricService = new BiometricService()
```

---

## 3. Chiffrement des Données

### 3.1 Chiffrement Local

```typescript
// utils/crypto.ts
import { pbkdf2, randomBytes, createCipheriv, createDecipheriv } from 'crypto-browserify'

const ALGORITHM = 'aes-256-gcm'
const KEY_LENGTH = 32
const IV_LENGTH = 16
const SALT_LENGTH = 64
const TAG_LENGTH = 16
const ITERATIONS = 100000

/**
 * Générer une clé de chiffrement depuis un mot de passe
 */
export const deriveKey = (password: string, salt: Buffer): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    pbkdf2(password, salt, ITERATIONS, KEY_LENGTH, 'sha256', (err, key) => {
      if (err) reject(err)
      else resolve(key)
    })
  })
}

/**
 * Chiffrer des données
 */
export const encrypt = async (data: string, password: string): Promise<string> => {
  const salt = randomBytes(SALT_LENGTH)
  const iv = randomBytes(IV_LENGTH)
  const key = await deriveKey(password, salt)
  
  const cipher = createCipheriv(ALGORITHM, key, iv)
  
  let encrypted = cipher.update(data, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  
  const tag = cipher.getAuthTag()
  
  // Format: salt:iv:tag:encrypted
  return `${salt.toString('hex')}:${iv.toString('hex')}:${tag.toString('hex')}:${encrypted}`
}

/**
 * Déchiffrer des données
 */
export const decrypt = async (encryptedData: string, password: string): Promise<string> => {
  const parts = encryptedData.split(':')
  if (parts.length !== 4) {
    throw new Error('Invalid encrypted data format')
  }
  
  const [saltHex, ivHex, tagHex, encrypted] = parts
  
  const salt = Buffer.from(saltHex, 'hex')
  const iv = Buffer.from(ivHex, 'hex')
  const tag = Buffer.from(tagHex, 'hex')
  const key = await deriveKey(password, salt)
  
  const decipher = createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(tag)
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  
  return decrypted
}

/**
 * Hasher un PIN
 */
export const hashPin = async (pin: string): Promise<string> => {
  const salt = randomBytes(SALT_LENGTH)
  const key = await deriveKey(pin, salt)
  return `${salt.toString('hex')}:${key.toString('hex')}`
}

/**
 * Vérifier un PIN
 */
export const verifyPin = async (pin: string, hash: string): Promise<boolean> => {
  const [saltHex, keyHex] = hash.split(':')
  const salt = Buffer.from(saltHex, 'hex')
  const key = await deriveKey(pin, salt)
  return key.toString('hex') === keyHex
}
```

### 3.2 Chiffrement des Données Sensibles

```typescript
// services/security/dataEncryption.ts
import { encrypt, decrypt } from '@/utils/crypto'
import { useStore } from '@/store'

export class DataEncryptionService {
  private encryptionKey: string | null = null
  
  /**
   * Initialiser avec la clé de chiffrement
   */
  async initialize(password: string): Promise<void> {
    this.encryptionKey = password
  }
  
  /**
   * Chiffrer le contenu d'une lettre
   */
  async encryptLetter(content: string): Promise<string> {
    if (!this.encryptionKey) {
      throw new Error('Encryption key not initialized')
    }
    return await encrypt(content, this.encryptionKey)
  }
  
  /**
   * Déchiffrer le contenu d'une lettre
   */
  async decryptLetter(encryptedContent: string): Promise<string> {
    if (!this.encryptionKey) {
      throw new Error('Encryption key not initialized')
    }
    return await decrypt(encryptedContent, this.encryptionKey)
  }
  
  /**
   * Chiffrer toutes les données sensibles
   */
  async encryptSensitiveData(): Promise<void> {
    const state = useStore.getState()
    
    // Chiffrer les lettres
    const encryptedLetters = await Promise.all(
      state.letters.map(async (letter) => ({
        ...letter,
        content: await this.encryptLetter(letter.content)
      }))
    )
    
    // Mettre à jour le store
    // TODO: Implémenter la mise à jour
  }
}

export const dataEncryptionService = new DataEncryptionService()
```

---

## 4. Protection des Données en Transit

### 4.1 HTTPS Obligatoire

```typescript
// vite.config.ts - Configuration pour forcer HTTPS
export default defineConfig({
  server: {
    https: true, // En développement
    headers: {
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin'
    }
  }
})
```

### 4.2 Content Security Policy

```html
<!-- index.html -->
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.gstatic.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  img-src 'self' data: https: blob:;
  connect-src 'self' https://*.firebaseio.com https://*.googleapis.com;
  frame-src 'none';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
">
```

---

## 5. Protection contre les Attaques

### 5.1 XSS (Cross-Site Scripting)

```typescript
// utils/sanitize.ts
import DOMPurify from 'dompurify'

/**
 * Nettoyer le HTML pour éviter les XSS
 */
export const sanitizeHTML = (dirty: string): string => {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['href', 'target', 'rel']
  })
}

/**
 * Échapper les caractères spéciaux
 */
export const escapeHTML = (text: string): string => {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}
```

### 5.2 CSRF (Cross-Site Request Forgery)

```typescript
// services/security/csrf.ts

export class CSRFProtection {
  private token: string | null = null
  
  /**
   * Générer un token CSRF
   */
  generateToken(): string {
    const array = new Uint8Array(32)
    crypto.getRandomValues(array)
    this.token = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
    sessionStorage.setItem('csrf_token', this.token)
    return this.token
  }
  
  /**
   * Vérifier le token CSRF
   */
  verifyToken(token: string): boolean {
    const storedToken = sessionStorage.getItem('csrf_token')
    return storedToken === token
  }
  
  /**
   * Ajouter le token aux requêtes
   */
  addTokenToRequest(headers: Record<string, string>): Record<string, string> {
    if (!this.token) {
      this.generateToken()
    }
    return {
      ...headers,
      'X-CSRF-Token': this.token!
    }
  }
}

export const csrfProtection = new CSRFProtection()
```

### 5.3 Rate Limiting

```typescript
// services/security/rateLimit.ts

interface RateLimitConfig {
  maxAttempts: number
  windowMs: number
  blockDurationMs: number
}

export class RateLimiter {
  private attempts: Map<string, number[]> = new Map()
  private blocked: Map<string, number> = new Map()
  
  /**
   * Vérifier si une action est autorisée
   */
  isAllowed(key: string, config: RateLimitConfig): boolean {
    const now = Date.now()
    
    // Vérifier si bloqué
    const blockedUntil = this.blocked.get(key)
    if (blockedUntil && now < blockedUntil) {
      return false
    }
    
    // Nettoyer les anciennes tentatives
    const attempts = this.attempts.get(key) || []
    const recentAttempts = attempts.filter(
      timestamp => now - timestamp < config.windowMs
    )
    
    // Vérifier le nombre de tentatives
    if (recentAttempts.length >= config.maxAttempts) {
      this.blocked.set(key, now + config.blockDurationMs)
      return false
    }
    
    // Enregistrer la tentative
    recentAttempts.push(now)
    this.attempts.set(key, recentAttempts)
    
    return true
  }
  
  /**
   * Réinitialiser les tentatives
   */
  reset(key: string): void {
    this.attempts.delete(key)
    this.blocked.delete(key)
  }
}

export const rateLimiter = new RateLimiter()

// Exemple d'utilisation
export const loginRateLimit: RateLimitConfig = {
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000, // 15 minutes
  blockDurationMs: 30 * 60 * 1000 // 30 minutes
}
```

---

## 6. Gestion des Sessions

### 6.1 Session Management

```typescript
// services/security/sessionManager.ts

export class SessionManager {
  private sessionTimeout: number = 30 * 60 * 1000 // 30 minutes
  private lastActivity: number = Date.now()
  private timeoutId: NodeJS.Timeout | null = null
  
  /**
   * Initialiser la gestion de session
   */
  initialize(timeoutMinutes: number = 30): void {
    this.sessionTimeout = timeoutMinutes * 60 * 1000
    this.resetTimeout()
    this.setupActivityListeners()
  }
  
  /**
   * Réinitialiser le timeout
   */
  private resetTimeout(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
    }
    
    this.lastActivity = Date.now()
    
    this.timeoutId = setTimeout(() => {
      this.handleSessionExpired()
    }, this.sessionTimeout)
  }
  
  /**
   * Configurer les listeners d'activité
   */
  private setupActivityListeners(): void {
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart']
    
    events.forEach(event => {
      document.addEventListener(event, () => {
        this.resetTimeout()
      }, { passive: true })
    })
  }
  
  /**
   * Gérer l'expiration de session
   */
  private handleSessionExpired(): void {
    console.log('Session expired')
    
    // Verrouiller l'app si PIN activé
    const pinEnabled = useStore.getState().settings.pinEnabled
    if (pinEnabled) {
      // Déclencher le verrouillage
      window.dispatchEvent(new CustomEvent('session:expired'))
    }
  }
  
  /**
   * Obtenir le temps restant
   */
  getTimeRemaining(): number {
    const elapsed = Date.now() - this.lastActivity
    return Math.max(0, this.sessionTimeout - elapsed)
  }
  
  /**
   * Terminer la session
   */
  endSession(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
    }
  }
}

export const sessionManager = new SessionManager()
```

---

## 7. Confidentialité des Données

### 7.1 Politique de Confidentialité

```markdown
# Politique de Confidentialité - Love Quest

## 1. Données Collectées

### Données Locales (Stockées sur votre appareil)
- Contenu personnalisé (lettres, messages, photos)
- Progression dans l'application
- Préférences et paramètres

### Données Cloud (Optionnel - uniquement si activé)
- Email (si compte créé)
- Progression synchronisée
- Photos uploadées

### Données Analytiques (Optionnel - désactivable)
- Pages visitées (anonymisées)
- Fonctionnalités utilisées (anonymisées)
- Aucune donnée personnelle identifiable

## 2. Utilisation des Données

Vos données sont utilisées UNIQUEMENT pour :
- Faire fonctionner l'application
- Sauvegarder votre progression
- Synchroniser entre appareils (si activé)

Nous ne vendons JAMAIS vos données.
Nous ne partageons JAMAIS vos données avec des tiers.

## 3. Stockage des Données

- **Local** : Données stockées sur votre appareil (IndexedDB, LocalStorage)
- **Cloud** : Firebase (Google Cloud Platform) - Serveurs en Europe
- **Chiffrement** : Toutes les données sensibles sont chiffrées

## 4. Vos Droits

Vous avez le droit de :
- Accéder à vos données
- Modifier vos données
- Supprimer vos données
- Exporter vos données
- Désactiver la synchronisation cloud

## 5. Suppression des Données

Vous pouvez supprimer toutes vos données à tout moment depuis les paramètres.
La suppression est immédiate et irréversible.

## 6. Contact

Pour toute question : [votre email]
```

### 7.2 Consentement RGPD

```typescript
// components/privacy/ConsentBanner.tsx
import { useState, useEffect } from 'react'
import { useStore } from '@/store'

export const ConsentBanner = () => {
  const [showBanner, setShowBanner] = useState(false)
  const settings = useStore(state => state.settings)
  
  useEffect(() => {
    const hasConsented = localStorage.getItem('privacy_consent')
    if (!hasConsented) {
      setShowBanner(true)
    }
  }, [])
  
  const handleAccept = (options: {
    analytics: boolean
    cloudSync: boolean
  }) => {
    localStorage.setItem('privacy_consent', JSON.stringify({
      date: new Date().toISOString(),
      ...options
    }))
    
    useStore.getState().updateSettings({
      analyticsEnabled: options.analytics,
      cloudSyncEnabled: options.cloudSync
    })
    
    setShowBanner(false)
  }
  
  if (!showBanner) return null
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
      <div className="bg-white rounded-t-3xl p-6 max-w-lg w-full">
        <h2 className="text-2xl font-bold mb-4">🍪 Confidentialité</h2>
        
        <p className="mb-4">
          Love Quest respecte votre vie privée. Choisissez ce que vous souhaitez activer :
        </p>
        
        <div className="space-y-3 mb-6">
          <label className="flex items-center gap-3">
            <input type="checkbox" id="analytics" />
            <span>Statistiques anonymes (pour améliorer l'app)</span>
          </label>
          
          <label className="flex items-center gap-3">
            <input type="checkbox" id="cloudSync" />
            <span>Synchronisation cloud (sauvegarder en ligne)</span>
          </label>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={() => handleAccept({ analytics: false, cloudSync: false })}
            className="flex-1 px-4 py-2 border rounded-lg"
          >
            Essentiel uniquement
          </button>
          
          <button
            onClick={() => {
              const analytics = (document.getElementById('analytics') as HTMLInputElement).checked
              const cloudSync = (document.getElementById('cloudSync') as HTMLInputElement).checked
              handleAccept({ analytics, cloudSync })
            }}
            className="flex-1 px-4 py-2 bg-pink-500 text-white rounded-lg"
          >
            Accepter
          </button>
        </div>
        
        <a href="/privacy" className="block text-center text-sm text-gray-500 mt-4">
          Lire la politique de confidentialité
        </a>
      </div>
    </div>
  )
}
```

---

## 8. Export et Suppression des Données

### 8.1 Export des Données (RGPD)

```typescript
// services/security/dataExport.ts
import { useStore } from '@/store'
import { saveAs } from 'file-saver'

export class DataExportService {
  /**
   * Exporter toutes les données utilisateur
   */
  async exportAllData(): Promise<void> {
    const state = useStore.getState()
    
    const exportData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      user: state.user,
      progress: state.progress,
      settings: state.settings,
      content: {
        timeline: state.timeline,
        letters: state.letters,
        // ... autres modules
      }
    }
    
    const blob = new Blob(
      [JSON.stringify(exportData, null, 2)],
      { type: 'application/json' }
    )
    
    saveAs(blob, `love-quest-export-${Date.now()}.json`)
  }
  
  /**
   * Exporter uniquement la progression
   */
  async exportProgress(): Promise<void> {
    const progress = useStore.getState().progress
    
    const blob = new Blob(
      [JSON.stringify(progress, null, 2)],
      { type: 'application/json' }
    )
    
    saveAs(blob, `love-quest-progress-${Date.now()}.json`)
  }
}

export const dataExportService = new DataExportService()
```

### 8.2 Suppression des Données

```typescript
// services/security/dataDelete.ts
import { useStore } from '@/store'
import { authService } from '@/services/firebase/auth'
import { firestoreService } from '@/services/firebase/firestore'
import { clearAllData } from '@/services/storage/indexedDB'
import { clearLocalStorage } from '@/services/storage/localStorage'

export class DataDeletionService {
  /**
   * Supprimer toutes les données locales
   */
  async deleteLocalData(): Promise<void> {
    // Effacer IndexedDB
    await clearAllData()
    
    // Effacer LocalStorage
    clearLocalStorage()
    
    // Réinitialiser le store
    useStore.getState().resetSettings()
    
    console.log('Local data deleted')
  }
  
  /**
   * Supprimer toutes les données cloud
   */
  async deleteCloudData(): Promise<void> {
    const user = authService.getCurrentUser()
    
    if (!user) {
      throw new Error('No user authenticated')
    }
    
    // Supprimer les données Firestore
    await firestoreService.deleteUserData(user.uid)
    
    // Supprimer le compte Firebase
    await user.delete()
    
    console.log('Cloud data deleted')
  }
  
  /**
   * Supprimer TOUTES les données (local + cloud)
   */
  async deleteAllData(): Promise<void> {
    await Promise.all([
      this.deleteLocalData(),
      this.deleteCloudData()
    ])
    
    // Rediriger vers la page d'accueil
    window.location.href = '/'
  }
}

export const dataDeletionService = new DataDeletionService()
```

---

## 9. Audit de Sécurité

### 9.1 Checklist de Sécurité

- [ ] HTTPS activé partout
- [ ] Content Security Policy configurée
- [ ] Authentification sécurisée (Firebase Auth)
- [ ] Chiffrement des données sensibles
- [ ] Protection XSS (sanitization)
- [ ] Protection CSRF
- [ ] Rate limiting implémenté
- [ ] Session management actif
- [ ] Firestore rules configurées
- [ ] Storage rules configurées
- [ ] Logs de sécurité activés
- [ ] Backup automatique configuré
- [ ] Plan de récupération en place
- [ ] Politique de confidentialité publiée
- [ ] Consentement RGPD implémenté
- [ ] Export de données fonctionnel
- [ ] Suppression de données fonctionnelle

### 9.2 Tests de Sécurité

```typescript
// tests/security/security.test.ts
import { describe, it, expect } from 'vitest'
import { encrypt, decrypt, hashPin, verifyPin } from '@/utils/crypto'
import { sanitizeHTML } from '@/utils/sanitize'
import { rateLimiter, loginRateLimit } from '@/services/security/rateLimit'

describe('Security Tests', () => {
  describe('Encryption', () => {
    it('should encrypt and decrypt data correctly', async () => {
      const data = 'Secret love message'
      const password = 'strongPassword123!'
      
      const encrypted = await encrypt(data, password)
      const decrypted = await decrypt(encrypted, password)
      
      expect(decrypted).toBe(data)
      expect(encrypted).not.toBe(data)
    })
    
    it('should fail with wrong password', async () => {
      const data = 'Secret'
      const encrypted = await encrypt(data, 'password1')
      
      await expect(decrypt(encrypted, 'password2')).rejects.toThrow()
    })
  })
  
  describe('PIN Hashing', () => {
    it('should hash and verify PIN correctly', async () => {
      const pin = '1234'
      const hash = await hashPin(pin)
      
      const isValid = await verifyPin(pin, hash)
      expect(isValid).toBe(true)
      
      const isInvalid = await verifyPin('5678', hash)
      expect(isInvalid).toBe(false)
    })
  })
  
  describe('XSS Protection', () => {
    it('should sanitize malicious HTML', () => {
      const malicious = '<script>alert("XSS")</script><p>Safe content</p>'
      const sanitized = sanitizeHTML(malicious)
      
      expect(sanitized).not.toContain('<script>')
      expect(sanitized).toContain('<p>Safe content</p>')
    })
  })
  
  describe('Rate Limiting', () => {
    it('should block after max attempts', () => {
      const key = 'test-user'
      
      // 5 tentatives autorisées
      for (let i = 0; i < 5; i++) {
        expect(rateLimiter.isAllowed(key, loginRateLimit)).toBe(true)
      }
      
      // 6ème tentative bloquée
      expect(rateLimiter.isAllowed(key, loginRateLimit)).toBe(false)
    })
  })
})
```

---

## 10. Conformité RGPD

### 10.1 Registre des Traitements

| Traitement | Finalité | Base légale | Durée de conservation |
|------------|----------|-------------|----------------------|
| Authentification | Identification utilisateur | Consentement | Durée du compte |
| Progression | Sauvegarde état | Consentement | Durée du compte |
| Photos | Souvenirs personnels | Consentement | Durée du compte |
| Analytics | Amé