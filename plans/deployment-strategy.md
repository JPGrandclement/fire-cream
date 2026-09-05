# 🚀 Stratégie de Déploiement - Love Quest

## Vue d'Ensemble

Ce document détaille la stratégie complète de déploiement, d'hébergement et de mise en production de Love Quest.

---

## 1. Options d'Hébergement

### 1.1 Comparatif des Plateformes

| Plateforme | Avantages | Inconvénients | Coût | Recommandation |
|------------|-----------|---------------|------|----------------|
| **Vercel** | Déploiement automatique, CDN global, Preview URLs, Analytics | Limites sur plan gratuit | Gratuit (Hobby) | ⭐ **Recommandé** |
| **Netlify** | Similaire à Vercel, Forms intégrés, Split testing | Moins de features serverless | Gratuit (Starter) | ⭐ Excellent |
| **Firebase Hosting** | Intégration Firebase, CDN, SSL auto | Moins flexible que Vercel | Gratuit (Spark) | ✅ Bon choix |
| **GitHub Pages** | Gratuit, simple | Pas de serverless, pas de preview | Gratuit | ⚠️ Basique |
| **Cloudflare Pages** | CDN ultra-rapide, Workers | Moins mature | Gratuit | ✅ Bon choix |

### 1.2 Configuration Recommandée

**Stack de Production:**
- **Frontend:** Vercel (ou Netlify)
- **Backend:** Firebase (Auth + Firestore + Storage)
- **CDN:** Automatique via Vercel
- **DNS:** Cloudflare (optionnel, pour protection DDoS)
- **Monitoring:** Sentry + Vercel Analytics

---

## 2. Configuration Vercel

### 2.1 Installation et Setup

```bash
# Installation de Vercel CLI
npm install -g vercel

# Login
vercel login

# Initialisation du projet
vercel init

# Déploiement
vercel --prod
```

### 2.2 Configuration vercel.json

```json
{
  "version": 2,
  "name": "love-quest",
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/assets/(.*)",
      "headers": {
        "cache-control": "public, max-age=31536000, immutable"
      }
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "camera=(), microphone=(), geolocation=()"
        }
      ]
    },
    {
      "source": "/service-worker.js",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "env": {
    "VITE_APP_VERSION": "1.0.0"
  }
}
```

### 2.3 Variables d'Environnement Vercel

```bash
# Via CLI
vercel env add VITE_FIREBASE_API_KEY production
vercel env add VITE_FIREBASE_AUTH_DOMAIN production
vercel env add VITE_FIREBASE_PROJECT_ID production
vercel env add VITE_FIREBASE_STORAGE_BUCKET production
vercel env add VITE_FIREBASE_MESSAGING_SENDER_ID production
vercel env add VITE_FIREBASE_APP_ID production
vercel env add VITE_FIREBASE_MEASUREMENT_ID production

# Ou via Dashboard Vercel
# Settings > Environment Variables
```

---

## 3. CI/CD avec GitHub Actions

### 3.1 Workflow de Déploiement

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main

env:
  NODE_VERSION: '20'

jobs:
  # Job 1: Tests et Linting
  test:
    name: Test & Lint
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'
      
      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Run linter
        run: pnpm run lint
      
      - name: Run type check
        run: pnpm run type-check
      
      - name: Run tests
        run: pnpm run test:ci
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
          flags: unittests
          name: codecov-umbrella

  # Job 2: Build
  build:
    name: Build Application
    runs-on: ubuntu-latest
    needs: test
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'
      
      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Build application
        run: pnpm run build
        env:
          VITE_FIREBASE_API_KEY: ${{ secrets.VITE_FIREBASE_API_KEY }}
          VITE_FIREBASE_AUTH_DOMAIN: ${{ secrets.VITE_FIREBASE_AUTH_DOMAIN }}
          VITE_FIREBASE_PROJECT_ID: ${{ secrets.VITE_FIREBASE_PROJECT_ID }}
          VITE_FIREBASE_STORAGE_BUCKET: ${{ secrets.VITE_FIREBASE_STORAGE_BUCKET }}
          VITE_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.VITE_FIREBASE_MESSAGING_SENDER_ID }}
          VITE_FIREBASE_APP_ID: ${{ secrets.VITE_FIREBASE_APP_ID }}
          VITE_FIREBASE_MEASUREMENT_ID: ${{ secrets.VITE_FIREBASE_MEASUREMENT_ID }}
      
      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: dist
          path: dist/
          retention-days: 1

  # Job 3: Deploy to Vercel
  deploy:
    name: Deploy to Vercel
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/main'
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Download build artifacts
        uses: actions/download-artifact@v3
        with:
          name: dist
          path: dist/
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
          working-directory: ./

  # Job 4: Deploy Preview (pour les PRs)
  deploy-preview:
    name: Deploy Preview
    runs-on: ubuntu-latest
    needs: build
    if: github.event_name == 'pull_request'
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Download build artifacts
        uses: actions/download-artifact@v3
        with:
          name: dist
          path: dist/
      
      - name: Deploy Preview to Vercel
        uses: amondnet/vercel-action@v25
        id: vercel-deploy
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          github-comment: true
      
      - name: Comment PR with preview URL
        uses: actions/github-script@v6
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: `✅ Preview deployed to: ${{ steps.vercel-deploy.outputs.preview-url }}`
            })
```

### 3.2 Workflow de Release

```yaml
# .github/workflows/release.yml
name: Create Release

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    name: Create Release
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0
      
      - name: Generate changelog
        id: changelog
        uses: metcalfc/changelog-generator@v4.0.1
        with:
          myToken: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Create Release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: ${{ github.ref }}
          release_name: Release ${{ github.ref }}
          body: ${{ steps.changelog.outputs.changelog }}
          draft: false
          prerelease: false
```

---

## 4. Environnements

### 4.1 Stratégie Multi-Environnements

```
┌─────────────────────────────────────────────────────────┐
│                    DÉVELOPPEMENT                         │
│  - Local (localhost:5173)                               │
│  - Hot reload                                           │
│  - Dev tools activés                                    │
│  - Firebase Emulators                                   │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                      STAGING                             │
│  - Vercel Preview (PR)                                  │
│  - Tests E2E automatiques                               │
│  - Firebase Dev Project                                 │
│  - URL: https://love-quest-pr-123.vercel.app           │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                    PRODUCTION                            │
│  - Vercel Production                                    │
│  - Firebase Prod Project                                │
│  - Monitoring actif                                     │
│  - URL: https://love-quest.vercel.app                  │
└─────────────────────────────────────────────────────────┘
```

### 4.2 Configuration par Environnement

```typescript
// config/environments.ts
export const environments = {
  development: {
    apiUrl: 'http://localhost:5173',
    firebase: {
      useEmulators: true,
      emulatorPorts: {
        auth: 9099,
        firestore: 8080,
        storage: 9199
      }
    },
    analytics: false,
    debug: true
  },
  
  staging: {
    apiUrl: 'https://love-quest-staging.vercel.app',
    firebase: {
      useEmulators: false,
      projectId: 'love-quest-dev'
    },
    analytics: true,
    debug: true
  },
  
  production: {
    apiUrl: 'https://love-quest.vercel.app',
    firebase: {
      useEmulators: false,
      projectId: 'love-quest-prod'
    },
    analytics: true,
    debug: false
  }
}

export const getEnvironment = () => {
  const env = import.meta.env.MODE
  return environments[env as keyof typeof environments] || environments.development
}
```

---

## 5. Optimisation du Build

### 5.1 Configuration Vite Optimisée

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { visualizer } from 'rollup-plugin-visualizer'
import compression from 'vite-plugin-compression'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // Configuration PWA
    }),
    compression({
      algorithm: 'brotliCompress',
      ext: '.br'
    }),
    visualizer({
      filename: './dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true
    })
  ],
  
  build: {
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info']
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'firebase-vendor': ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage'],
          'animation-vendor': ['framer-motion', 'canvas-confetti'],
          'ui-vendor': ['zustand', '@tanstack/react-query'],
          'utils-vendor': ['date-fns', 'zod']
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    chunkSizeWarningLimit: 1000,
    sourcemap: false,
    cssCodeSplit: true,
    assetsInlineLimit: 4096
  },
  
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'zustand',
      'framer-motion'
    ]
  }
})
```

### 5.2 Analyse du Bundle

```bash
# Générer le rapport d'analyse
pnpm run build
pnpm run analyze

# Ouvrir dist/stats.html pour visualiser
```

---

## 6. Monitoring et Observabilité

### 6.1 Sentry Configuration

```typescript
// services/monitoring/sentry.ts
import * as Sentry from '@sentry/react'
import { BrowserTracing } from '@sentry/tracing'

export const initSentry = () => {
  if (import.meta.env.PROD) {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      integrations: [
        new BrowserTracing(),
        new Sentry.Replay({
          maskAllText: true,
          blockAllMedia: true
        })
      ],
      
      // Performance Monitoring
      tracesSampleRate: 0.1, // 10% des transactions
      
      // Session Replay
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
      
      // Environment
      environment: import.meta.env.MODE,
      
      // Release tracking
      release: `love-quest@${import.meta.env.VITE_APP_VERSION}`,
      
      // Filtrer les erreurs
      beforeSend(event, hint) {
        // Ne pas envoyer les erreurs de développement
        if (event.environment === 'development') {
          return null
        }
        
        // Filtrer les erreurs connues
        if (event.exception) {
          const error = hint.originalException
          if (error instanceof Error && error.message.includes('ResizeObserver')) {
            return null
          }
        }
        
        return event
      }
    })
  }
}
```

### 6.2 Vercel Analytics

```typescript
// main.tsx
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
    <Analytics />
    <SpeedInsights />
  </React.StrictMode>
)
```

### 6.3 Custom Monitoring

```typescript
// services/monitoring/performance.ts

export class PerformanceMonitor {
  /**
   * Mesurer le temps de chargement initial
   */
  measureInitialLoad(): void {
    if ('performance' in window) {
      window.addEventListener('load', () => {
        const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
        
        const metrics = {
          dns: perfData.domainLookupEnd - perfData.domainLookupStart,
          tcp: perfData.connectEnd - perfData.connectStart,
          ttfb: perfData.responseStart - perfData.requestStart,
          download: perfData.responseEnd - perfData.responseStart,
          domInteractive: perfData.domInteractive - perfData.fetchStart,
          domComplete: perfData.domComplete - perfData.fetchStart,
          loadComplete: perfData.loadEventEnd - perfData.fetchStart
        }
        
        console.log('Performance Metrics:', metrics)
        
        // Envoyer à analytics
        this.sendToAnalytics('page_load', metrics)
      })
    }
  }
  
  /**
   * Mesurer les Core Web Vitals
   */
  measureWebVitals(): void {
    if ('web-vital' in window) {
      import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
        getCLS(metric => this.sendToAnalytics('CLS', metric))
        getFID(metric => this.sendToAnalytics('FID', metric))
        getFCP(metric => this.sendToAnalytics('FCP', metric))
        getLCP(metric => this.sendToAnalytics('LCP', metric))
        getTTFB(metric => this.sendToAnalytics('TTFB', metric))
      })
    }
  }
  
  private sendToAnalytics(name: string, data: any): void {
    // Envoyer à Vercel Analytics ou Firebase Analytics
    if (window.va) {
      window.va('event', name, data)
    }
  }
}

export const performanceMonitor = new PerformanceMonitor()
```

---

## 7. Rollback et Recovery

### 7.1 Stratégie de Rollback

```bash
# Vercel - Rollback vers un déploiement précédent
vercel rollback

# Ou via Dashboard Vercel
# Deployments > Select previous deployment > Promote to Production
```

### 7.2 Health Checks

```typescript
// public/health.json
{
  "status": "ok",
  "version": "1.0.0",
  "timestamp": "2026-09-05T14:00:00Z"
}
```

```typescript
// services/monitoring/healthCheck.ts
export const performHealthCheck = async (): Promise<boolean> => {
  try {
    const response = await fetch('/health.json')
    const data = await response.json()
    return data.status === 'ok'
  } catch (error) {
    console.error('Health check failed:', error)
    return false
  }
}
```

---

## 8. Domaine Personnalisé

### 8.1 Configuration DNS

```
# Cloudflare DNS Records
Type    Name              Content                      Proxy
A       love-quest.com    76.76.21.21                 ✅ Proxied
CNAME   www               love-quest.com              ✅ Proxied
TXT     _vercel           vc-domain-verify=...        ❌ DNS only
```

### 8.2 SSL/TLS

- Vercel fournit automatiquement un certificat SSL via Let's Encrypt
- Renouvellement automatique
- Support HTTP/2 et HTTP/3
- HSTS activé par défaut

---

## 9. Checklist de Déploiement

### 9.1 Pré-Déploiement

- [ ] Tests unitaires passent
- [ ] Tests E2E passent
- [ ] Linting sans erreurs
- [ ] Type checking sans erreurs
- [ ] Build réussit localement
- [ ] Variables d'environnement configurées
- [ ] Firebase configuré (prod)
- [ ] Sentry configuré
- [ ] Analytics configuré
- [ ] PWA manifest valide
- [ ] Service Worker testé
- [ ] Images optimisées
- [ ] Fonts optimisées

### 9.2 Post-Déploiement

- [ ] Site accessible via URL
- [ ] SSL/HTTPS fonctionne
- [ ] PWA installable
- [ ] Offline mode fonctionne
- [ ] Firebase Auth fonctionne
- [ ] Firestore fonctionne
- [ ] Storage fonctionne
- [ ] Analytics enregistre des événements
- [ ] Sentry capture les erreurs
- [ ] Performance acceptable (Lighthouse > 90)
- [ ] Tous les modules fonctionnent
- [ ] Tests manuels complets

### 9.3 Monitoring Post-Déploiement

- [ ] Vérifier les logs Vercel
- [ ] Vérifier les erreurs Sentry
- [ ] Vérifier les métriques Analytics
- [ ] Vérifier les Core Web Vitals
- [ ] Vérifier l'utilisation Firebase
- [ ] Surveiller les coûts

---

## 10. Scripts de Déploiement

### 10.1 package.json Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "lint:fix": "eslint . --ext ts,tsx --fix",
    "type-check": "tsc --noEmit",
    "test": "vitest",
    "test:ci": "vitest run --coverage",
    "test:e2e": "playwright test",
    "analyze": "vite-bundle-visualizer",
    "deploy": "vercel --prod",
    "deploy:preview": "vercel",
    "firebase:deploy": "firebase deploy",
    "firebase:emulators": "firebase emulators:start"
  }
}
```

### 10.2 Script de Déploiement Automatisé

```bash
#!/bin/bash
# deploy.sh

set -e

echo "🚀 Starting deployment process..."

# 1. Vérifications pré-déploiement
echo "📋 Running pre-deployment checks..."
pnpm run lint
pnpm run type-check
pnpm run test:ci

# 2. Build
echo "🔨 Building application..."
pnpm run build

# 3. Tests E2E sur le build
echo "🧪 Running E2E tests..."
pnpm run test:e2e

# 4. Déploiement
echo "🌐 Deploying to Vercel..."
vercel --prod

# 5. Vérification post-déploiement
echo "✅ Deployment complete!"
echo "🔍 Running post-deployment checks..."

# Health check
sleep 10
curl -f https://love-quest.vercel.app/health.json || exit 1

echo "✨ Deployment successful!"
```

---

## 11. Documentation de Déploiement

### 11.1 Guide de Déploiement Rapide

```markdown
# Guide de Déploiement - Love Quest

## Première Installation

1. **Cloner le repository**
   ```bash
   git clone https://github.com/username/love-quest.git
   cd love-quest
   ```

2. **Installer les dépendances**
   ```bash
   pnpm install
   ```

3. **Configurer Firebase**
   - Créer un projet Firebase
   - Activer Authentication, Firestore, Storage
   - Copier les credentials dans `.env.local`

4. **Configurer Vercel**
   ```bash
   vercel login
   vercel link
   ```

5. **Déployer**
   ```bash
   pnpm run deploy
   ```

## Déploiements Suivants

```bash
git add .
git commit -m "feat: nouvelle fonctionnalité"
git push origin main
# Déploiement automatique via GitHub Actions
```

## Rollback

```bash
vercel rollback
```

## Support

En cas de problème: [email de support]
```

