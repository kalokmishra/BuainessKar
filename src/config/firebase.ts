/**
 * Centralized Firebase Configuration & Instance Initialization Module
 * 
 * All sensitive configuration parameters are strictly loaded from environment variables
 * via import.meta.env (supporting Vite VITE_FIREBASE_* conventions).
 * 
 * Provides clean, secure, and centralized Firebase application and service instances.
 */

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getAnalytics, Analytics } from 'firebase/analytics';

// Load Firebase configuration strictly from Vite environment variables (import.meta.env)
const apiKey = (import.meta.env.VITE_FIREBASE_API_KEY as string) || (typeof process !== 'undefined' ? process.env?.VITE_FIREBASE_API_KEY : '') || '';
const projectId = (import.meta.env.VITE_FIREBASE_PROJECT_ID as string) || (typeof process !== 'undefined' ? process.env?.VITE_FIREBASE_PROJECT_ID : '') || '';
const authDomain = (import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string) || (typeof process !== 'undefined' ? process.env?.VITE_FIREBASE_AUTH_DOMAIN : '') || '';
const storageBucket = (import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string) || (typeof process !== 'undefined' ? process.env?.VITE_FIREBASE_STORAGE_BUCKET : '') || '';
const messagingSenderId = (import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string) || (typeof process !== 'undefined' ? process.env?.VITE_FIREBASE_MESSAGING_SENDER_ID : '') || '';
const appId = (import.meta.env.VITE_FIREBASE_APP_ID as string) || (typeof process !== 'undefined' ? process.env?.VITE_FIREBASE_APP_ID : '') || '';
const measurementId = (import.meta.env.VITE_FIREBASE_MEASUREMENT_ID as string) || (typeof process !== 'undefined' ? process.env?.VITE_FIREBASE_MEASUREMENT_ID : '') || undefined;
const firestoreDatabaseId = (import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID as string) || (typeof process !== 'undefined' ? process.env?.VITE_FIREBASE_FIRESTORE_DATABASE_ID : '') || undefined;

export const firebaseConfig = {
  apiKey,
  projectId,
  authDomain,
  storageBucket,
  messagingSenderId,
  appId,
  measurementId: measurementId || undefined,
  firestoreDatabaseId: firestoreDatabaseId || undefined,
};

// Client configuration alias
export const firebaseClientConfig = firebaseConfig;

// Initialize or retrieve centralized active Firebase instance
export const app: FirebaseApp = !getApps().length
  ? initializeApp(firebaseConfig)
  : getApp();

export const firebaseApp = app;

// Centralized Firebase Auth instance
export const auth: Auth = getAuth(app);
export const firebaseAuth = auth;

// Centralized Firestore instance
export const firestore: Firestore = firestoreDatabaseId
  ? getFirestore(app, firestoreDatabaseId)
  : getFirestore(app);
export const db: Firestore = firestore;
export const firebaseDb = db;

// Optional Firebase Storage instance
let storageInstance: FirebaseStorage | null = null;
try {
  storageInstance = getStorage(app);
} catch {
  // Storage unavailable or disabled
}
export const storage = storageInstance;
export const firebaseStorage = storage;

// Optional Firebase Analytics instance
let analyticsInstance: Analytics | null = null;
if (typeof window !== 'undefined' && measurementId && measurementId.trim().startsWith('G-')) {
  try {
    analyticsInstance = getAnalytics(app);
  } catch {
    // Analytics unavailable or offline
  }
}
export const analytics = analyticsInstance;
export const firebaseAnalytics = analytics;

export default app;
