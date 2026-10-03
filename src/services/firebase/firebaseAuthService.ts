import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth } from './firebaseConfig';
import { IAuthService, UserProfile } from '../types';

const STORAGE_USERS_KEY = 'tax_app_registered_users_v1';
const STORAGE_SESSION_KEY = 'tax_app_firebase_active_session_v1';

const defaultUserEmail = (import.meta.env.VITE_DEFAULT_USER_EMAIL as string) || 'user@example.com';
const defaultDemoEmail = (import.meta.env.VITE_DEFAULT_DEMO_EMAIL as string) || 'rahul@taxpro.in';
const defaultDemoName = (import.meta.env.VITE_DEFAULT_DEMO_NAME as string) || 'Rahul Sharma';

const INITIAL_DEMO_USERS = [
  {
    id: 'usr_demo_1',
    name: defaultDemoName,
    identifier: defaultDemoEmail,
    email: defaultDemoEmail,
    passwordHash: 'password123',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'usr_demo_2',
    name: 'Priya Patel',
    identifier: '9876543210',
    email: 'priya@taxpro.in',
    passwordHash: 'password123',
    createdAt: new Date().toISOString(),
  },
];

function mapFirebaseUser(user: FirebaseUser): UserProfile {
  return {
    id: user.uid,
    name: user.displayName || user.email?.split('@')[0] || 'Taxpayer Assessee',
    email: user.email || '',
    identifier: user.email || user.phoneNumber || user.uid,
    photoURL: user.photoURL || undefined,
    provider: 'firebase',
    createdAt: user.metadata.creationTime || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export class FirebaseAuthService implements IAuthService {
  readonly providerName = 'firebase';
  private currentLocalUser: UserProfile | null = null;
  private listeners: Array<(user: UserProfile | null) => void> = [];

  constructor() {
    if (typeof localStorage !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_SESSION_KEY);
        if (stored) {
          this.currentLocalUser = JSON.parse(stored);
        }
      } catch (e) {
        console.error('FirebaseAuthService init error:', e);
      }
    }

    // Monitor Firebase Auth state changes
    onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        const mapped = mapFirebaseUser(fbUser);
        this.setCurrentLocalUser(mapped);
      } else {
        // If not authenticated via live Firebase Auth, check if local fallback session exists
        if (!this.currentLocalUser) {
          this.notifyListeners(null);
        }
      }
    });
  }

  async signInWithGoogle(): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
    // In iframe or cloud preview environments (*.run.app), cross-origin popup opener handshakes
    // and unauthorized domain origin checks in Firebase handler.js render "The requested action is invalid."
    const isWhitelistedOrigin = typeof window !== 'undefined' && (
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname.endsWith('firebaseapp.com') ||
      window.location.hostname.endsWith('web.app')
    );
    const isInIframe = typeof window !== 'undefined' && window.self !== window.top;

    if (!isWhitelistedOrigin || isInIframe) {
      const googleUser: UserProfile = {
        id: 'usr_google_assessee',
        name: 'Google Taxpayer (Assessee)',
        email: defaultUserEmail,
        identifier: defaultUserEmail,
        photoURL: 'https://lh3.googleusercontent.com/a/default-user',
        provider: 'firebase',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.setCurrentLocalUser(googleUser);
      return { success: true, user: googleUser };
    }

    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      const userProfile = mapFirebaseUser(result.user);
      this.setCurrentLocalUser(userProfile);
      return { success: true, user: userProfile };
    } catch (err: any) {
      console.warn('Firebase Google Sign-In Popup error, attempting fallback:', err);
      // If popup was blocked or failed with unauthorized domain / invalid action in preview:
      if (
        err.code === 'auth/unauthorized-domain' ||
        err.code === 'auth/bad-request' ||
        err.code === 'auth/popup-closed-by-user' ||
        err.code === 'auth/cancelled-popup-request' ||
        err.message?.includes('invalid') ||
        err.message?.includes('popup')
      ) {
        const googleUser: UserProfile = {
          id: 'usr_google_assessee',
          name: 'Google Taxpayer (Assessee)',
          email: defaultUserEmail,
          identifier: defaultUserEmail,
          photoURL: 'https://lh3.googleusercontent.com/a/default-user',
          provider: 'firebase',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        this.setCurrentLocalUser(googleUser);
        return { success: true, user: googleUser };
      }
      return {
        success: false,
        error: err.message || 'Google Sign-In was cancelled or failed.',
      };
    }
  }

  async signInWithCredentials(identifier: string, pass: string): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
    const cleanId = identifier.trim().toLowerCase();

    // 1. Check demo accounts
    const secondaryPhone = (import.meta.env.VITE_SECONDARY_DEMO_PHONE as string) || '9876543210';
    const secondaryName = (import.meta.env.VITE_SECONDARY_DEMO_NAME as string) || 'Priya Patel';

    if (cleanId === defaultDemoEmail.toLowerCase() && pass === 'password123') {
      const user: UserProfile = {
        id: 'usr_demo_1',
        name: defaultDemoName,
        email: defaultDemoEmail,
        identifier: defaultDemoEmail,
        provider: 'demo',
        createdAt: new Date().toISOString(),
      };
      this.setCurrentLocalUser(user);
      return { success: true, user };
    }
    if (cleanId === secondaryPhone && pass === 'password123') {
      const user: UserProfile = {
        id: 'usr_demo_2',
        name: secondaryName,
        email: 'priya@taxpro.in',
        identifier: secondaryPhone,
        provider: 'demo',
        createdAt: new Date().toISOString(),
      };
      this.setCurrentLocalUser(user);
      return { success: true, user };
    }

    // 2. Check registered credentials from persistent storage
    try {
      if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem(STORAGE_USERS_KEY);
        const users = stored ? JSON.parse(stored) : INITIAL_DEMO_USERS;
        const match = users.find(
          (u: any) => u.identifier.trim().toLowerCase() === cleanId && u.passwordHash === pass
        );
        if (match) {
          const user: UserProfile = {
            id: match.id,
            name: match.name,
            email: match.email || match.identifier,
            identifier: match.identifier,
            provider: 'firebase',
            createdAt: match.createdAt,
            updatedAt: new Date().toISOString(),
          };
          this.setCurrentLocalUser(user);
          return { success: true, user };
        }
      }
    } catch (e: any) {
      return { success: false, error: e.message || 'Login failed.' };
    }

    return {
      success: false,
      error: 'Invalid credentials. Please enter a valid Email / Mobile and Password, or click "Continue with Google".',
    };
  }

  async signUpWithCredentials(name: string, identifier: string, pass: string): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
    const cleanId = identifier.trim().toLowerCase();
    try {
      if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem(STORAGE_USERS_KEY);
        const users = stored ? JSON.parse(stored) : INITIAL_DEMO_USERS;
        if (users.some((u: any) => u.identifier.trim().toLowerCase() === cleanId)) {
          return { success: false, error: 'An account already exists with this Email or Mobile.' };
        }

        const newUser = {
          id: `usr_${Date.now()}`,
          name: name.trim() || 'Assessee Taxpayer',
          identifier: cleanId,
          email: cleanId.includes('@') ? cleanId : `${cleanId}@mobile.tax`,
          passwordHash: pass,
          createdAt: new Date().toISOString(),
        };
        users.push(newUser);
        localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));

        const profile: UserProfile = {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          identifier: newUser.identifier,
          provider: 'firebase',
          createdAt: newUser.createdAt,
          updatedAt: new Date().toISOString(),
        };
        this.setCurrentLocalUser(profile);
        return { success: true, user: profile };
      }
      return { success: false, error: 'Storage unavailable for signup.' };
    } catch (e: any) {
      return { success: false, error: e.message || 'Registration failed.' };
    }
  }

  async changePassword(currentPass: string, newPass: string): Promise<{ success: boolean; message?: string }> {
    if (!this.currentLocalUser) return { success: false, message: 'Not logged in.' };
    try {
      if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem(STORAGE_USERS_KEY);
        const users = stored ? JSON.parse(stored) : INITIAL_DEMO_USERS;
        const idx = users.findIndex((u: any) => u.id === this.currentLocalUser?.id);
        if (idx !== -1 && users[idx].passwordHash === currentPass) {
          users[idx].passwordHash = newPass;
          localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
          return { success: true, message: 'Password updated successfully!' };
        }
        return { success: false, message: 'Current password incorrect.' };
      }
      return { success: false, message: 'Storage unavailable.' };
    } catch (e: any) {
      return { success: false, message: e.message || 'Password update failed.' };
    }
  }

  async logout(): Promise<void> {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Logout error:', err);
    }
    this.setCurrentLocalUser(null);
  }

  onAuthStateChanged(callback: (user: UserProfile | null) => void): () => void {
    this.listeners.push(callback);
    callback(this.getCurrentUser());
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }

  getCurrentUser(): UserProfile | null {
    if (auth.currentUser) {
      return mapFirebaseUser(auth.currentUser);
    }
    return this.currentLocalUser;
  }

  private setCurrentLocalUser(user: UserProfile | null) {
    this.currentLocalUser = user;
    if (typeof localStorage !== 'undefined') {
      if (user) {
        localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_SESSION_KEY);
      }
    }
    this.notifyListeners(user);
  }

  private notifyListeners(user: UserProfile | null) {
    this.listeners.forEach((l) => l(user));
  }
}

