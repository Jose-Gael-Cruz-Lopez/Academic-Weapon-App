import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

// Firebase config with emulators for local dev
// No API keys needed for emulators
const firebaseConfig = {
  apiKey: 'fake-api-key-for-emulators',
  authDomain: 'localhost',
  projectId: 'academic-weapon-dev',
  storageBucket: 'localhost',
  messagingSenderId: '123456789',
  appId: '1:123456789:web:abcdef'
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Connect to emulators in development
if (window.location.hostname === 'localhost') {
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectAuthEmulator(auth, 'http://localhost:9099');
  connectStorageEmulator(storage, 'localhost', 9199);
  console.log('[Firebase] Connected to emulators');
}

export default app;
