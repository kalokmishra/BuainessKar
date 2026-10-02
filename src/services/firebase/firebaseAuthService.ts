import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth } from './firebaseConfig';
import { IAuthService, UserProfile } from '../types';

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

  async signInWithGoogle(): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      const userProfile = mapFirebaseUser(result.user);
      return { success: true, user: userProfile };
    } catch (err: any) {
      console.error('Firebase Google Sign-In Error:', err);
      return {
        success: false,
        error: err.message || 'Google Sign-In was cancelled or failed.',
      };
    }
  }

  async signInWithCredentials(identifier: string, pass: string): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
    // Demo / fallback credentials support
    const cleanId = identifier.trim().toLowerCase();
    if (cleanId === 'rahul@taxpro.in' && pass === 'password123') {
      const user: UserProfile = {
        id: 'usr_demo_1',
        name: 'Rahul Sharma',
        email: 'rahul@taxpro.in',
        identifier: 'rahul@taxpro.in',
        provider: 'demo',
        createdAt: new Date().toISOString(),
      };
      return { success: true, user };
    }
    if (cleanId === '9876543210' && pass === 'password123') {
      const user: UserProfile = {
        id: 'usr_demo_2',
        name: 'Priya Patel',
        email: 'priya@taxpro.in',
        identifier: '9876543210',
        provider: 'demo',
        createdAt: new Date().toISOString(),
      };
      return { success: true, user };
    }

    return {
      success: false,
      error: 'Invalid credentials. Please use Sign in with Google or select a demo account.',
    };
  }

  async signUpWithCredentials(name: string, identifier: string, pass: string): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
    return {
      success: false,
      error: 'Direct email/password registration is disabled. Please use "Sign in with Google" for secure Firebase authentication.',
    };
  }

  async changePassword(): Promise<{ success: boolean; message?: string }> {
    return {
      success: false,
      message: 'Password management is handled by your Google Account security settings.',
    };
  }

  async logout(): Promise<void> {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Logout error:', err);
    }
  }

  onAuthStateChanged(callback: (user: UserProfile | null) => void): () => void {
    return onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        callback(mapFirebaseUser(fbUser));
      } else {
        callback(null);
      }
    });
  }

  getCurrentUser(): UserProfile | null {
    if (auth.currentUser) {
      return mapFirebaseUser(auth.currentUser);
    }
    return null;
  }
}
