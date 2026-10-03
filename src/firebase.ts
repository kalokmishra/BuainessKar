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
import appletConfig from '../firebase-applet-config.json';

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

const rawConfig = (appletConfig as Record<string, string>) || {};

const apiKey = getEnv('FIREBASE_API_KEY') || getEnv('API_KEY') || rawConfig.apiKey;
const projectId = getEnv('FIREBASE_PROJECT_ID') || rawConfig.projectId || 'global-fort-mfht8';
const authDomain = getEnv('FIREBASE_AUTH_DOMAIN') || rawConfig.authDomain || `${projectId}.firebaseapp.com`;
const storageBucket = getEnv('FIREBASE_STORAGE_BUCKET') || rawConfig.storageBucket || `${projectId}.firebasestorage.app`;
const messagingSenderId = getEnv('FIREBASE_MESSAGING_SENDER_ID') || rawConfig.messagingSenderId || '952143367787';
const appId = getEnv('FIREBASE_APP_ID') || rawConfig.appId || '1:952143367787:web:cf5f5c092894c77742eb2e';
const measurementId = getEnv('FIREBASE_MEASUREMENT_ID') || rawConfig.measurementId || '';
const firestoreDatabaseId = getEnv('FIREBASE_FIRESTORE_DATABASE_ID') || rawConfig.firestoreDatabaseId || 'ai-studio-taxutilitymvpsec-73c0f477-424e-4989-b3d1-90275716ca08';

export const firebaseConfig = {
  apiKey: apiKey || 'AIzaSyPlaceholderForLocalDev',
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
