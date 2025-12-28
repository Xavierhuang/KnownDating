import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Load Firebase config from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyC9KhPz1omdPoxfZgTFtlJhkllgiwa9yyQ",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "known-dating-e5f04.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "known-dating-e5f04",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "known-dating-e5f04.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1063923761424",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1063923761424:web:93addbdfc0e177f8dfa595"
};

// Validate required config
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  throw new Error('Firebase configuration is missing. Please set environment variables.');
}

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;

