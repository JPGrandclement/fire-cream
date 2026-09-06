// Enveloppe un changement de route (navigate(), setState, etc.) dans une
// transition native fluide. Fallback silencieux si le navigateur ne supporte
// pas l'API : le changement se fait normalement, sans effet, jamais d'erreur.
export function navigateWithTransition(callback: () => void) {
  // @ts-ignore - API récente, pas encore dans tous les types TS par défaut
  if (!document.startViewTransition) {
    callback();
    return;
  }
  // @ts-ignore
  document.startViewTransition(() => {
    callback();
  });
}
