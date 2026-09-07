# 🧪 Stratégie de Tests - Fire Cream

## Vue d'Ensemble

Ce document détaille la stratégie complète de tests pour garantir la qualité, la fiabilité et la maintenabilité de Fire Cream.

---

## 1. Pyramide de Tests

```
                    ╱╲
                   ╱  ╲
                  ╱ E2E ╲          10% - Tests End-to-End
                 ╱────────╲         (Playwright)
                ╱          ╲
               ╱ Integration╲      20% - Tests d'Intégration
              ╱──────────────╲     (React Testing Library)
             ╱                ╲
            ╱   Unit Tests     ╲   70% - Tests Unitaires
           ╱────────────────────╲  (Vitest)
```

---

## 2. Tests Unitaires (Vitest)

### 2.1 Configuration Vitest

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData',
        'dist/'
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80
      }
    },
    include: ['**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', 'dist', '.idea', '.git', '.cache']
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
```

### 2.2 Setup Tests

```typescript
// tests/setup.ts
import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

// Cleanup après chaque test
afterEach(() => {
  cleanup()
})

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  }))
})

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return []
  }
  unobserve() {}
}

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}
global.localStorage = localStorageMock as any

// Mock IndexedDB
import 'fake-indexeddb/auto'
```

### 2.3 Exemples de Tests Unitaires

```typescript
// utils/date.test.ts
import { describe, it, expect } from 'vitest'
import { getDaysSince, formatDate, isDateInFuture } from '@/utils/date'

describe('Date Utils', () => {
  describe('getDaysSince', () => {
    it('should calculate days correctly', () => {
      const startDate = '2024-01-01'
      const endDate = '2024-01-11'
      expect(getDaysSince(startDate, endDate)).toBe(10)
    })
    
    it('should return 0 for same date', () => {
      const date = '2024-01-01'
      expect(getDaysSince(date, date)).toBe(0)
    })
    
    it('should handle negative days', () => {
      const startDate = '2024-01-11'
      const endDate = '2024-01-01'
      expect(getDaysSince(startDate, endDate)).toBe(-10)
    })
  })
  
  describe('isDateInFuture', () => {
    it('should return true for future date', () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 1)
      expect(isDateInFuture(futureDate.toISOString())).toBe(true)
    })
    
    it('should return false for past date', () => {
      const pastDate = '2020-01-01'
      expect(isDateInFuture(pastDate)).toBe(false)
    })
  })
})
```

```typescript
// store/slices/progressSlice.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { useStore } from '@/store'

describe('Progress Slice', () => {
  beforeEach(() => {
    // Reset store avant chaque test
    useStore.setState({
      progress: {
        badges: [],
        challengesCompleted: [],
        lettersRead: [],
        // ... autres valeurs par défaut
      }
    })
  })
  
  describe('unlockBadge', () => {
    it('should add badge to list', () => {
      const { unlockBadge, progress } = useStore.getState()
      
      unlockBadge('first_visit')
      
      expect(useStore.getState().progress.badges).toContain('first_visit')
    })
    
    it('should not add duplicate badge', () => {
      const { unlockBadge } = useStore.getState()
      
      unlockBadge('first_visit')
      unlockBadge('first_visit')
      
      const badges = useStore.getState().progress.badges
      expect(badges.filter(b => b === 'first_visit')).toHaveLength(1)
    })
  })
  
  describe('completeChallenge', () => {
    it('should mark challenge as completed', () => {
      const { completeChallenge, isChallengeCompleted } = useStore.getState()
      
      completeChallenge('challenge_001')
      
      expect(isChallengeCompleted('challenge_001')).toBe(true)
    })
  })
})
```

```typescript
// services/badges/badgeEngine.test.ts
import { describe, it, expect, vi } from 'vitest'
import { BadgeEngine } from '@/services/badges/badgeEngine'
import { useStore } from '@/store'

describe('Badge Engine', () => {
  const badgeEngine = new BadgeEngine()
  
  describe('checkStreakBadge', () => {
    it('should unlock badge for 7-day streak', () => {
      useStore.setState({
        progress: {
          visitStreak: 7,
          badges: []
        }
      })
      
      const unlocked = badgeEngine.checkStreakBadge()
      
      expect(unlocked).toBe(true)
      expect(useStore.getState().progress.badges).toContain('streak_7')
    })
    
    it('should not unlock if already unlocked', () => {
      useStore.setState({
        progress: {
          visitStreak: 7,
          badges: ['streak_7']
        }
      })
      
      const unlocked = badgeEngine.checkStreakBadge()
      
      expect(unlocked).toBe(false)
    })
  })
})
```

---

## 3. Tests d'Intégration (React Testing Library)

### 3.1 Configuration

```typescript
// tests/utils/test-utils.tsx
import { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false
    }
  }
})

interface AllTheProvidersProps {
  children: React.ReactNode
}

const AllTheProviders = ({ children }: AllTheProvidersProps) => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }
```

### 3.2 Exemples de Tests d'Intégration

```typescript
// features/home/Home.test.tsx
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@/tests/utils/test-utils'
import { Home } from './Home'
import { useStore } from '@/store'

describe('Home Component', () => {
  beforeEach(() => {
    useStore.setState({
      progress: {
        visitStreak: 5,
        totalVisits: 10,
        badges: ['first_visit']
      }
    })
  })
  
  it('should render mascot', () => {
    render(<Home />)
    expect(screen.getByTestId('mascot')).toBeInTheDocument()
  })
  
  it('should display streak counter', () => {
    render(<Home />)
    expect(screen.getByText(/5 jours/i)).toBeInTheDocument()
  })
  
  it('should display all module cards', () => {
    render(<Home />)
    const cards = screen.getAllByTestId('module-card')
    expect(cards).toHaveLength(12)
  })
  
  it('should navigate to module on click', async () => {
    const { user } = render(<Home />)
    
    const timelineCard = screen.getByText(/Timeline/i)
    await user.click(timelineCard)
    
    await waitFor(() => {
      expect(window.location.pathname).toBe('/timeline')
    })
  })
})
```

```typescript
// features/letters/Letters.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@/tests/utils/test-utils'
import { Letters } from './Letters'
import { useStore } from '@/store'

describe('Letters Component', () => {
  const mockLetters = [
    {
      id: 'letter_001',
      title: 'Lettre 1',
      content: 'Contenu de la lettre',
      unlockDate: null,
      emoji: '💌'
    },
    {
      id: 'letter_002',
      title: 'Lettre 2',
      content: 'Contenu secret',
      unlockDate: '2030-01-01',
      emoji: '🔒'
    }
  ]
  
  beforeEach(() => {
    useStore.setState({
      letters: mockLetters,
      progress: {
        lettersRead: []
      }
    })
  })
  
  it('should render all letters', () => {
    render(<Letters />)
    expect(screen.getByText('Lettre 1')).toBeInTheDocument()
    expect(screen.getByText('Lettre 2')).toBeInTheDocument()
  })
  
  it('should show locked state for future letters', () => {
    render(<Letters />)
    const lockedLetter = screen.getByText('Lettre 2').closest('[data-testid="envelope"]')
    expect(lockedLetter).toHaveClass('locked')
  })
  
  it('should open letter modal on click', async () => {
    const { user } = render(<Letters />)
    
    const letter = screen.getByText('Lettre 1')
    await user.click(letter)
    
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText('Contenu de la lettre')).toBeInTheDocument()
    })
  })
  
  it('should mark letter as read', async () => {
    const { user } = render(<Letters />)
    
    const letter = screen.getByText('Lettre 1')
    await user.click(letter)
    
    await waitFor(() => {
      const state = useStore.getState()
      expect(state.progress.lettersRead).toContain('letter_001')
    })
  })
})
```

```typescript
// features/quiz/Quiz.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@/tests/utils/test-utils'
import { Quiz } from './Quiz'
import { useStore } from '@/store'

describe('Quiz Component', () => {
  const mockQuestions = [
    {
      id: 'q1',
      question: 'Quelle est ma couleur préférée ?',
      options: ['Bleu', 'Rose', 'Vert', 'Violet'],
      answer: 1,
      category: 'preferences'
    }
  ]
  
  beforeEach(() => {
    useStore.setState({
      quiz: mockQuestions,
      progress: {
        quizScores: []
      }
    })
  })
  
  it('should display first question', () => {
    render(<Quiz />)
    expect(screen.getByText('Quelle est ma couleur préférée ?')).toBeInTheDocument()
  })
  
  it('should show all options', () => {
    render(<Quiz />)
    expect(screen.getByText('Bleu')).toBeInTheDocument()
    expect(screen.getByText('Rose')).toBeInTheDocument()
    expect(screen.getByText('Vert')).toBeInTheDocument()
    expect(screen.getByText('Violet')).toBeInTheDocument()
  })
  
  it('should highlight correct answer on click', async () => {
    const { user } = render(<Quiz />)
    
    const correctOption = screen.getByText('Rose')
    await user.click(correctOption)
    
    await waitFor(() => {
      expect(correctOption.closest('button')).toHaveClass('correct')
    })
  })
  
  it('should show result screen after all questions', async () => {
    const { user } = render(<Quiz />)
    
    const correctOption = screen.getByText('Rose')
    await user.click(correctOption)
    
    await waitFor(() => {
      expect(screen.getByText(/Score/i)).toBeInTheDocument()
      expect(screen.getByText(/100%/i)).toBeInTheDocument()
    })
  })
})
```

---

## 4. Tests End-to-End (Playwright)

### 4.1 Configuration Playwright

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] }
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] }
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] }
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] }
    }
  ],
  
  webServer: {
    command: 'pnpm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI
  }
})
```

### 4.2 Exemples de Tests E2E

```typescript
// tests/e2e/user-journey.spec.ts
import { test, expect } from '@playwright/test'

test.describe('User Journey', () => {
  test('should complete full user journey', async ({ page }) => {
    // 1. Visite initiale
    await page.goto('/')
    
    // Vérifier la page d'accueil
    await expect(page.locator('[data-testid="mascot"]')).toBeVisible()
    await expect(page.locator('text=Fire Cream')).toBeVisible()
    
    // 2. Naviguer vers Timeline
    await page.click('text=Timeline')
    await expect(page).toHaveURL('/timeline')
    await expect(page.locator('[data-testid="timeline-item"]').first()).toBeVisible()
    
    // 3. Naviguer vers Lettres
    await page.click('[data-testid="bottom-nav-letters"]')
    await expect(page).toHaveURL('/letters')
    
    // 4. Ouvrir une lettre
    await page.click('[data-testid="envelope"]:not(.locked)').first()
    await expect(page.locator('[role="dialog"]')).toBeVisible()
    await expect(page.locator('text=Contenu de la lettre')).toBeVisible()
    
    // 5. Fermer la lettre
    await page.click('[data-testid="close-modal"]')
    await expect(page.locator('[role="dialog"]')).not.toBeVisible()
    
    // 6. Naviguer vers Quiz
    await page.goto('/quiz')
    
    // 7. Répondre aux questions
    await page.click('text=Rose') // Première réponse
    await expect(page.locator('.correct')).toBeVisible()
    
    // 8. Voir le résultat
    await expect(page.locator('text=Score')).toBeVisible()
    
    // 9. Vérifier les badges
    await page.goto('/badges')
    await expect(page.locator('[data-testid="badge"]')).toHaveCount.greaterThan(0)
  })
})
```

```typescript
// tests/e2e/pwa.spec.ts
import { test, expect } from '@playwright/test'

test.describe('PWA Features', () => {
  test('should work offline', async ({ page, context }) => {
    // Visiter la page en ligne
    await page.goto('/')
    await expect(page.locator('text=Fire Cream')).toBeVisible()
    
    // Passer en mode offline
    await context.setOffline(true)
    
    // Recharger la page
    await page.reload()
    
    // Vérifier que l'app fonctionne toujours
    await expect(page.locator('text=Fire Cream')).toBeVisible()
    
    // Naviguer vers une autre page
    await page.click('text=Timeline')
    await expect(page).toHaveURL('/timeline')
  })
  
  test('should be installable', async ({ page }) => {
    await page.goto('/')
    
    // Vérifier la présence du manifest
    const manifestLink = page.locator('link[rel="manifest"]')
    await expect(manifestLink).toHaveAttribute('href', '/manifest.json')
    
    // Vérifier le service worker
    const swRegistered = await page.evaluate(() => {
      return 'serviceWorker' in navigator
    })
    expect(swRegistered).toBe(true)
  })
})
```

```typescript
// tests/e2e/accessibility.spec.ts
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Accessibility', () => {
  test('should not have accessibility violations on home page', async ({ page }) => {
    await page.goto('/')
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze()
    
    expect(accessibilityScanResults.violations).toEqual([])
  })
  
  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/')
    
    // Tab navigation
    await page.keyboard.press('Tab')
    await expect(page.locator(':focus')).toBeVisible()
    
    // Enter pour activer
    await page.keyboard.press('Enter')
    
    // Vérifier la navigation
    await expect(page).not.toHaveURL('/')
  })
  
  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto('/')
    
    // Vérifier les labels
    await expect(page.locator('[aria-label]')).toHaveCount.greaterThan(0)
    
    // Vérifier les rôles
    await expect(page.locator('[role="navigation"]')).toBeVisible()
    await expect(page.locator('[role="main"]')).toBeVisible()
  })
})
```

---

## 5. Tests de Performance

### 5.1 Lighthouse CI

```javascript
// lighthouserc.js
module.exports = {
  ci: {
    collect: {
      startServerCommand: 'pnpm run preview',
      url: ['http://localhost:4173/'],
      numberOfRuns: 3
    },
    assert: {
      preset: 'lighthouse:recommended',
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
        'categories:pwa': ['error', { minScore: 0.9 }]
      }
    },
    upload: {
      target: 'temporary-public-storage'
    }
  }
}
```

### 5.2 Tests de Charge

```typescript
// tests/performance/load.test.ts
import { test, expect } from '@playwright/test'

test.describe('Performance Tests', () => {
  test('should load home page quickly', async ({ page }) => {
    const startTime = Date.now()
    
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    const loadTime = Date.now() - startTime
    
    expect(loadTime).toBeLessThan(3000) // Moins de 3 secondes
  })
  
  test('should have good Core Web Vitals', async ({ page }) => {
    await page.goto('/')
    
    const metrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries()
          resolve(entries)
        }).observe({ entryTypes: ['paint', 'largest-contentful-paint'] })
      })
    })
    
    // Vérifier les métriques
    expect(metrics).toBeDefined()
  })
})
```

---

## 6. Tests de Sécurité

```typescript
// tests/security/xss.test.ts
import { describe, it, expect } from 'vitest'
import { sanitizeHTML } from '@/utils/sanitize'

describe('XSS Protection', () => {
  it('should remove script tags', () => {
    const malicious = '<script>alert("XSS")</script><p>Safe</p>'
    const sanitized = sanitizeHTML(malicious)
    
    expect(sanitized).not.toContain('<script>')
    expect(sanitized).toContain('<p>Safe</p>')
  })
  
  it('should remove event handlers', () => {
    const malicious = '<div onclick="alert(\'XSS\')">Click me</div>'
    const sanitized = sanitizeHTML(malicious)
    
    expect(sanitized).not.toContain('onclick')
  })
  
  it('should allow safe HTML', () => {
    const safe = '<p>Hello <strong>world</strong></p>'
    const sanitized = sanitizeHTML(safe)
    
    expect(sanitized).toBe(safe)
  })
})
```

---

## 7. Couverture de Code

### 7.1 Objectifs de Couverture

| Type | Objectif | Critique |
|------|----------|----------|
| **Lignes** | 80% | 90% |
| **Fonctions** | 80% | 85% |
| **Branches** | 75% | 80% |
| **Statements** | 80% | 90% |

### 7.2 Génération du Rapport

```bash
# Générer le rapport de couverture
pnpm run test:coverage

# Ouvrir le rapport HTML
open coverage/index.html
```

---

## 8. Tests Visuels (Chromatic/Percy)

```typescript
// .storybook/main.ts
import type { StorybookConfig } from '@storybook/react-vite'

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@chromatic-com/storybook'
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {}
  }
}

export default config
```

---

## 9. Stratégie de Tests par Module

| Module | Tests Unitaires | Tests Intégration | Tests E2E |
|--------|----------------|-------------------|-----------|
| **Home** | ✅ Utils, Hooks | ✅ Composant complet | ✅ Navigation |
| **Timeline** | ✅ Tri, Filtres | ✅ Affichage items | ✅ Scroll |
| **Letters** | ✅ Unlock logic | ✅ Modal, Read state | ✅ Ouverture |
| **Calendar** | ✅ Date logic | ✅ Cases, Unlock | ✅ Interaction |
| **Challenges** | ✅ Completion | ✅ Liste, Filtres | ✅ Complétion |
| **Quiz** | ✅ Score calc | ✅ Questions, Réponses | ✅ Flow complet |
| **Garden** | ✅ Water logic | ✅ Plantes, Stages | ✅ Arrosage |
| **Wheel** | ✅ Random, Spin | ✅ Animation | ✅ Spin complet |
| **Badges** | ✅ Engine | ✅ Affichage | ✅ Déblocage |

---

## 10. CI/CD Integration

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Run unit tests
        run: pnpm run test:ci
      
      - name: Run E2E tests
        run: pnpm run test:e2e
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
```

