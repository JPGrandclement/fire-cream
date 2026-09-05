# ⚡ Performance & Optimisation - Love Quest

## Vue d'Ensemble

Ce document détaille toutes les stratégies d'optimisation pour garantir une expérience utilisateur fluide et rapide.

---

## 1. Objectifs de Performance

### 1.1 Core Web Vitals

| Métrique | Objectif | Critique |
|----------|----------|----------|
| **LCP** (Largest Contentful Paint) | < 2.5s | < 4.0s |
| **FID** (First Input Delay) | < 100ms | < 300ms |
| **CLS** (Cumulative Layout Shift) | < 0.1 | < 0.25 |
| **FCP** (First Contentful Paint) | < 1.8s | < 3.0s |
| **TTI** (Time to Interactive) | < 3.8s | < 7.3s |
| **TBT** (Total Blocking Time) | < 200ms | < 600ms |

### 1.2 Lighthouse Scores

| Catégorie | Score Minimum |
|-----------|---------------|
| Performance | 90+ |
| Accessibility | 95+ |
| Best Practices | 95+ |
| SEO | 95+ |
| PWA | 90+ |

---

## 2. Optimisation du Bundle

### 2.1 Code Splitting

```typescript
// Lazy loading des routes
const Home = lazy(() => import('@/features/home/Home'))
const Timeline = lazy(() => import('@/features/timeline/Timeline'))
const Letters = lazy(() => import('@/features/letters/Letters'))

// Lazy loading des composants lourds
const HeavyChart = lazy(() => import('@/components/charts/HeavyChart'))

// Utilisation avec Suspense
<Suspense fallback={<LoadingSpinner />}>
  <HeavyChart data={data} />
</Suspense>
```

### 2.2 Tree Shaking

```typescript
// ❌ Mauvais - importe tout
import _ from 'lodash'

// ✅ Bon - importe uniquement ce qui est nécessaire
import debounce from 'lodash/debounce'
import throttle from 'lodash/throttle'

// ❌ Mauvais
import * as dateFns from 'date-fns'

// ✅ Bon
import { format, differenceInDays } from 'date-fns'
```

### 2.3 Analyse du Bundle

```bash
# Générer le rapport d'analyse
pnpm run build
pnpm run analyze

# Objectifs de taille
# - Initial bundle: < 200 KB (gzipped)
# - Total bundle: < 500 KB (gzipped)
# - Chaque chunk: < 100 KB (gzipped)
```

---

## 3. Optimisation des Images

### 3.1 Formats Modernes

```typescript
// components/ui/OptimizedImage.tsx
interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  loading?: 'lazy' | 'eager'
}

export const OptimizedImage = ({
  src,
  alt,
  width,
  height,
  loading = 'lazy'
}: OptimizedImageProps) => {
  const webpSrc = src.replace(/\.(jpg|jpeg|png)$/, '.webp')
  const avifSrc = src.replace(/\.(jpg|jpeg|png)$/, '.avif')
  
  return (
    <picture>
      <source srcSet={avifSrc} type="image/avif" />
      <source srcSet={webpSrc} type="image/webp" />
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        decoding="async"
      />
    </picture>
  )
}
```

### 3.2 Responsive Images

```typescript
// Générer des tailles multiples
const imageSizes = [320, 640, 960, 1280, 1920]

export const ResponsiveImage = ({ src, alt }: { src: string; alt: string }) => {
  const srcSet = imageSizes
    .map(size => `${src}?w=${size} ${size}w`)
    .join(', ')
  
  return (
    <img
      src={`${src}?w=640`}
      srcSet={srcSet}
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      alt={alt}
      loading="lazy"
    />
  )
}
```

### 3.3 Compression d'Images

```bash
# Installation des outils
pnpm add -D imagemin imagemin-webp imagemin-avif

# Script de compression
node scripts/optimize-images.js
```

```javascript
// scripts/optimize-images.js
import imagemin from 'imagemin'
import imageminWebp from 'imagemin-webp'
import imageminAvif from 'imagemin-avif'
import imageminMozjpeg from 'imagemin-mozjpeg'
import imageminPngquant from 'imagemin-pngquant'

await imagemin(['public/images/*.{jpg,png}'], {
  destination: 'public/images/optimized',
  plugins: [
    imageminMozjpeg({ quality: 80 }),
    imageminPngquant({ quality: [0.6, 0.8] }),
    imageminWebp({ quality: 80 }),
    imageminAvif({ quality: 65 })
  ]
})
```

---

## 4. Optimisation des Fonts

### 4.1 Font Loading Strategy

```html
<!-- index.html -->
<head>
  <!-- Preconnect aux domaines de fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  
  <!-- Charger les fonts avec display=swap -->
  <link 
    href="https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&display=swap" 
    rel="stylesheet"
  >
</head>
```

### 4.2 Self-Hosted Fonts

```css
/* styles/fonts.css */
@font-face {
  font-family: 'Quicksand';
  src: url('/fonts/quicksand-regular.woff2') format('woff2'),
       url('/fonts/quicksand-regular.woff') format('woff');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'Quicksand';
  src: url('/fonts/quicksand-bold.woff2') format('woff2'),
       url('/fonts/quicksand-bold.woff') format('woff');
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}
```

### 4.3 Subset de Fonts

```bash
# Créer un subset avec uniquement les caractères nécessaires
pyftsubset font.ttf \
  --output-file=font-subset.woff2 \
  --flavor=woff2 \
  --layout-features='*' \
  --unicodes="U+0020-007E,U+00A0-00FF,U+0100-017F"
```

---

## 5. Optimisation du Rendu

### 5.1 React.memo et useMemo

```typescript
// Mémoïser les composants coûteux
export const ExpensiveComponent = React.memo(({ data }: Props) => {
  return <div>{/* Rendu complexe */}</div>
}, (prevProps, nextProps) => {
  // Comparaison personnalisée
  return prevProps.data.id === nextProps.data.id
})

// Mémoïser les calculs coûteux
const sortedData = useMemo(() => {
  return data.sort((a, b) => a.date.localeCompare(b.date))
}, [data])

// Mémoïser les callbacks
const handleClick = useCallback(() => {
  console.log('Clicked')
}, [])
```

### 5.2 Virtualisation des Listes

```typescript
// components/ui/VirtualList.tsx
import { useVirtualizer } from '@tanstack/react-virtual'

export const VirtualList = ({ items }: { items: any[] }) => {
  const parentRef = useRef<HTMLDivElement>(null)
  
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100,
    overscan: 5
  })
  
  return (
    <div ref={parentRef} style={{ height: '600px', overflow: 'auto' }}>
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          position: 'relative'
        }}
      >
        {virtualizer.getVirtualItems().map(virtualItem => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`
            }}
          >
            {items[virtualItem.index]}
          </div>
        ))}
      </div>
    </div>
  )
}
```

### 5.3 Debounce et Throttle

```typescript
// hooks/useDebounce.ts
import { useEffect, useState } from 'react'

export const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)
    
    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])
  
  return debouncedValue
}

// Utilisation
const SearchInput = () => {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)
  
  useEffect(() => {
    // Effectuer la recherche avec debouncedSearch
  }, [debouncedSearch])
  
  return <input value={search} onChange={e => setSearch(e.target.value)} />
}
```

---

## 6. Optimisation des Animations

### 6.1 CSS vs JavaScript

```css
/* ✅ Bon - Utiliser transform et opacity (GPU accelerated) */
.animated {
  transform: translateX(100px);
  opacity: 0.5;
  transition: transform 0.3s ease, opacity 0.3s ease;
  will-change: transform, opacity;
}

/* ❌ Mauvais - Éviter left, top, width, height */
.slow-animated {
  left: 100px;
  transition: left 0.3s ease;
}
```

### 6.2 Framer Motion Optimisé

```typescript
// Utiliser layoutId pour des animations fluides
<motion.div layoutId="card" />

// Utiliser whileInView pour les animations au scroll
<motion.div
  initial={{ opacity: 0, y: 50 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: "-100px" }}
/>

// Désactiver les animations sur mobile si nécessaire
const shouldReduceMotion = useReducedMotion()

<motion.div
  animate={shouldReduceMotion ? {} : { scale: 1.2 }}
/>
```

### 6.3 Intersection Observer

```typescript
// hooks/useInView.ts
import { useEffect, useRef, useState } from 'react'

export const useInView = (options?: IntersectionObserverInit) => {
  const ref = useRef<HTMLDivElement>(null)
  const [isInView, setIsInView] = useState(false)
  
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsInView(entry.isIntersecting)
    }, options)
    
    if (ref.current) {
      observer.observe(ref.current)
    }
    
    return () => {
      observer.disconnect()
    }
  }, [options])
  
  return { ref, isInView }
}

// Utilisation
const LazyComponent = () => {
  const { ref, isInView } = useInView({ threshold: 0.1 })
  
  return (
    <div ref={ref}>
      {isInView && <ExpensiveComponent />}
    </div>
  )
}
```

---

## 7. Optimisation du State Management

### 7.1 Sélecteurs Optimisés

```typescript
// ❌ Mauvais - Re-render à chaque changement du store
const state = useStore()

// ✅ Bon - Re-render uniquement si badges change
const badges = useStore(state => state.progress.badges)

// ✅ Encore mieux - Sélecteur mémoïsé
const selectBadgeCount = (state: AppStore) => state.progress.badges.length
const badgeCount = useStore(selectBadgeCount)
```

### 7.2 Shallow Comparison

```typescript
import { shallow } from 'zustand/shallow'

// Comparaison shallow pour les objets
const { user, settings } = useStore(
  state => ({ user: state.user, settings: state.settings }),
  shallow
)
```

### 7.3 Subscription Partielle

```typescript
// S'abonner uniquement aux changements nécessaires
useEffect(() => {
  const unsubscribe = useStore.subscribe(
    state => state.progress.badges,
    (badges) => {
      console.log('Badges changed:', badges)
    }
  )
  
  return unsubscribe
}, [])
```

---

## 8. Optimisation du Réseau

### 8.1 Prefetching

```typescript
// Prefetch des routes
import { prefetchQuery } from '@tanstack/react-query'

const prefetchTimeline = () => {
  prefetchQuery({
    queryKey: ['timeline'],
    queryFn: fetchTimeline
  })
}

// Prefetch au hover
<Link 
  to="/timeline" 
  onMouseEnter={prefetchTimeline}
>
  Timeline
</Link>
```

### 8.2 Caching Strategy

```typescript
// React Query configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retry: 1
    }
  }
})
```

### 8.3 Request Batching

```typescript
// Grouper les requêtes Firebase
import { writeBatch } from 'firebase/firestore'

const batch = writeBatch(db)

batch.set(doc1Ref, data1)
batch.update(doc2Ref, data2)
batch.delete(doc3Ref)

await batch.commit() // Une seule requête réseau
```

---

## 9. Optimisation du Storage

### 9.1 IndexedDB Optimisé

```typescript
// Utiliser des index pour les requêtes rapides
const db = await openDB('love-quest', 1, {
  upgrade(db) {
    const store = db.createObjectStore('progress', { keyPath: 'id' })
    store.createIndex('date', 'date')
    store.createIndex('type', 'type')
  }
})

// Requête optimisée avec index
const recentProgress = await db.getAllFromIndex(
  'progress',
  'date',
  IDBKeyRange.lowerBound(lastWeek)
)
```

### 9.2 Compression des Données

```typescript
// Compresser avant de stocker
import pako from 'pako'

const compressData = (data: any): string => {
  const json = JSON.stringify(data)
  const compressed = pako.deflate(json)
  return btoa(String.fromCharCode(...compressed))
}

const decompressData = (compressed: string): any => {
  const binary = atob(compressed)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  const decompressed = pako.inflate(bytes, { to: 'string' })
  return JSON.parse(decompressed)
}
```

---

## 10. Monitoring des Performances

### 10.1 Performance Observer

```typescript
// services/monitoring/performanceObserver.ts
export class PerformanceObserver {
  observe(): void {
    // Observer les Long Tasks
    if ('PerformanceObserver' in window) {
      const observer = new window.PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) {
            console.warn('Long task detected:', entry)
            // Envoyer à analytics
          }
        }
      })
      
      observer.observe({ entryTypes: ['longtask'] })
    }
    
    // Observer les Layout Shifts
    const clsObserver = new window.PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          console.warn('Layout shift:', entry)
        }
      }
    })
    
    clsObserver.observe({ entryTypes: ['layout-shift'] })
  }
}
```

### 10.2 Custom Metrics

```typescript
// Mesurer le temps de rendu d'un composant
export const useRenderTime = (componentName: string) => {
  useEffect(() => {
    const startTime = performance.now()
    
    return () => {
      const endTime = performance.now()
      const renderTime = endTime - startTime
      
      if (renderTime > 16) { // Plus de 16ms = < 60fps
        console.warn(`${componentName} render time: ${renderTime}ms`)
      }
    }
  })
}
```

---

## 11. Checklist d'Optimisation

### 11.1 Build & Bundle

- [ ] Code splitting activé
- [ ] Tree shaking configuré
- [ ] Bundle < 200 KB (gzipped)
- [ ] Chunks < 100 KB chacun
- [ ] Source maps désactivées en prod
- [ ] Minification activée
- [ ] Compression Brotli activée

### 11.2 Assets

- [ ] Images optimisées (WebP/AVIF)
- [ ] Images responsive
- [ ] Lazy loading des images
- [ ] Fonts optimisées (WOFF2)
- [ ] Font display: swap
- [ ] SVG optimisés

### 11.3 Rendu

- [ ] React.memo utilisé
- [ ] useMemo pour calculs coûteux
- [ ] useCallback pour callbacks
- [ ] Virtualisation des longues listes
- [ ] Intersection Observer pour lazy load
- [ ] Animations GPU-accelerated

### 11.4 Réseau

- [ ] Service Worker configuré
- [ ] Cache strategy optimale
- [ ] Prefetching des routes
- [ ] Request batching
- [ ] Compression gzip/brotli

### 11.5 Storage

- [ ] IndexedDB avec index
- [ ] Compression des données
- [ ] Nettoyage périodique
- [ ] Quota management

### 11.6 Monitoring

- [ ] Lighthouse CI configuré
- [ ] Core Web Vitals trackés
- [ ] Performance Observer actif
- [ ] Error tracking (Sentry)
- [ ] Analytics configuré

---

## 12. Budget de Performance

### 12.1 Budgets par Page

| Page | Initial Load | Total Load | Requests |
|------|-------------|------------|----------|
| Home | < 150 KB | < 300 KB | < 20 |
| Timeline | < 100 KB | < 250 KB | < 15 |
| Letters | < 100 KB | < 200 KB | < 10 |
| Quiz | < 120 KB | < 220 KB | < 12 |

### 12.2 Configuration Budget

```javascript
// lighthouserc.js
module.exports = {
  ci: {
    assert: {
      assertions: {
        'resource-summary:script:size': ['error', { maxNumericValue: 200000 }],
        'resource-summary:image:size': ['error', { maxNumericValue: 300000 }],
        'resource-summary:font:size': ['error', { maxNumericValue: 100000 }],
        'resource-summary:total:size': ['error', { maxNumericValue: 500000 }]
      }
    }
  }
}
```

---

## 13. Optimisations Avancées

### 13.1 Web Workers

```typescript
// workers/dataProcessor.worker.ts
self.addEventListener('message', (e) => {
  const { data, operation } = e.data
  
  let result
  switch (operation) {
    case 'sort':
      result = data.sort((a, b) => a.date.localeCompare(b.date))
      break
    case 'filter':
      result = data.filter(item => item.active)
      break
  }
  
  self.postMessage(result)
})

// Utilisation
const worker = new Worker(new URL('./dataProcessor.worker.ts', import.meta.url))

worker.postMessage({ data: largeDataset, operation: 'sort' })

worker.addEventListener('message', (e) => {
  const sortedData = e.data
  // Utiliser les données triées
})
```

### 13.2 Request Idle Callback

```typescript
// Exécuter des tâches non-critiques pendant l'idle time
const performNonCriticalTask = () => {
  if ('requestIdleCallback' in window) {
    requestIdleCallback((deadline) => {
      while (deadline.timeRemaining() > 0) {
        // Effectuer des tâches non-critiques
        processQueueItem()
      }
    })
  } else {
    setTimeout(performNonCriticalTask, 1)
  }
}
```

### 13.3 Resource Hints

```html
<!-- Preconnect aux domaines critiques -->
<link rel="preconnect" href="https://firebasestorage.googleapis.com">

<!-- Prefetch des ressources futures -->
<link rel="prefetch" href="/timeline">

<!-- Preload des ressources critiques -->
<link rel="preload" href="/fonts/quicksand.woff2" as="font" type="font/woff2" crossorigin>

<!-- DNS Prefetch -->
<link rel="dns-prefetch" href="https://fonts.googleapis.com">
```

