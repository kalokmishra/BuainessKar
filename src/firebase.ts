/**
 * Secure Firebase Initialization Module
 * 
 * All sensitive keys and configuration parameters are loaded strictly from environment
 * variables (supporting both VITE_FIREBASE_* and REACT_APP_FIREBASE_* conventions).
 * 
 * Prevents hardcoded secret commits to version control.
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

// Helper to safely read from either Vite (import.meta.env) or Node/CRA (process.env)
function getEnv(key: string): string | undefined {
  const metaEnv = typeof import.meta !== 'undefined' ? (import.meta as any).env : undefined;
  if (metaEnv) {
    if (metaEnv[`VITE_${key}`]) return metaEnv[`VITE_${key}`];
    if (metaEnv[`REACT_APP_${key}`]) return metaEnv[`REACT_APP_${key}`];
    if (metaEnv[key]) return metaEnv[key];
  }
  if (typeof process !== 'undefined' && process.env) {
    if (process.env[`VITE_${key}`]) return process.env[`VITE_${key}`];
    if (process.env[`REACT_APP_${key}`]) return process.env[`REACT_APP_${key}`];
    if (process.env[key]) return process.env[key];
  }
  return undefined;
}

// Load Firebase configuration strictly from Vite environment variables (.env.local / import.meta.env)
const apiKey = import.meta.env.VITE_FIREBASE_API_KEY || (typeof process !== 'undefined' ? process.env?.VITE_FIREBASE_API_KEY : '');
const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID || (typeof process !== 'undefined' ? process.env?.VITE_FIREBASE_PROJECT_ID : '');
const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || (typeof process !== 'undefined' ? process.env?.VITE_FIREBASE_AUTH_DOMAIN : '');
const storageBucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || (typeof process !== 'undefined' ? process.env?.VITE_FIREBASE_STORAGE_BUCKET : '');
const messagingSenderId = import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || (typeof process !== 'undefined' ? process.env?.VITE_FIREBASE_MESSAGING_SENDER_ID : '');
const appId = import.meta.env.VITE_FIREBASE_APP_ID || (typeof process !== 'undefined' ? process.env?.VITE_FIREBASE_APP_ID : '');
const measurementId = import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || (typeof process !== 'undefined' ? process.env?.VITE_FIREBASE_MEASUREMENT_ID : '');
const firestoreDatabaseId = import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || (typeof process !== 'undefined' ? process.env?.VITE_FIREBASE_FIRESTORE_DATABASE_ID : '');

export const firebaseConfig = {
  apiKey,
  projectId,
  authDomain,
  storageBucket,
  messagingSenderId,
  appId,
  measurementId: measurementId || undefined,
};

// Initialize or retrieve active Firebase instance
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Export Firebase services
export const auth = getAuth(app);
export const firestore = firestoreDatabaseId ? getFirestore(app, firestoreDatabaseId) : getFirestore(app);
export const db = firestore; // Common alias

// Optional Storage and Analytics
let storageInstance = null;
try {
  storageInstance = getStorage(app);
} catch {
  // Storage not required in all environments
}
export const storage = storageInstance;

let analyticsInstance = null;
// Only attempt to initialize analytics if a valid Measurement ID starting with 'G-' is configured
if (typeof window !== 'undefined' && measurementId && measurementId.trim().startsWith('G-')) {
  try {
    analyticsInstance = getAnalytics(app);
  } catch {
    // Analytics unavailable or offline
  }
}
export const analytics = analyticsInstance;

export default app;
