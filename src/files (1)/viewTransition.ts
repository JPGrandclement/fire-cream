// Enveloppe un changement de route (navigate(), setState, etc.) dans une
// transition native fluide. Fallback silencieux si le navigateur ne supporte
// pas l'API : le changement se fait normalement, sans effet, jamais d'erreur.
export function navigateWithTransition(callback: () => void) {
  if (!document.startViewTransition) {
    callback();
    return;
  }
  document.startViewTransition(() => {
    callback();
  });
}
