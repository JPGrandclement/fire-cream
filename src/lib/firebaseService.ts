import { ref, set, onValue, onDisconnect, remove, off } from "firebase/database";
import { db } from "./firebase";

// Envoie ta position à Firebase et configure la suppression à la déconnexion
export const updateMyPosition = (lat: number, lng: number) => {
  const myRef = ref(db, 'positions/me');
  set(myRef, {
    lat,
    lng,
    timestamp: Date.now()
  });
  // Supprime la position quand l'utilisateur se déconnecte
  onDisconnect(myRef).remove();
};

// Écoute ta propre position (pour la page Admin)
export const listenToMyPosition = (callback: (pos: { lat: number, lng: number }) => void) => {
  const myRef = ref(db, 'positions/me');
  const listener = onValue(myRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      callback(data);
    }
  });
  return () => off(myRef, 'value', listener);
};

// Écoute la position de l'autre
export const listenToOtherPosition = (callback: (pos: { lat: number, lng: number }) => void) => {
  const otherRef = ref(db, 'positions/other');
  onValue(otherRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      callback(data);
    }
  });
};

