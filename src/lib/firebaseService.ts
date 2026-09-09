import { ref, set, onValue } from "firebase/database";
import { db } from "./firebase";

// Envoie ta position à Firebase
export const updateMyPosition = (lat: number, lng: number) => {
  set(ref(db, 'positions/me'), {
    lat,
    lng,
    timestamp: Date.now()
  });
};

// Écoute ta propre position (pour la page Admin)
export const listenToMyPosition = (callback: (pos: { lat: number, lng: number }) => void) => {
  const myRef = ref(db, 'positions/me');
  onValue(myRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      console.log('Laaaa Position reçue depuis Firebase :', data);
      callback(data);
    }
  });
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

