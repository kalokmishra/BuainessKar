import { IAuthService, UserProfile } from '../types';

const STORAGE_USERS_KEY = 'tax_app_registered_users_v1';
const STORAGE_SESSION_KEY = 'tax_app_active_session_v1';

const INITIAL_DEMO_USERS = [
  {
    id: 'usr_demo_1',
    name: 'Rahul Sharma',
    identifier: 'rahul@taxpro.in',
    email: 'rahul@taxpro.in',
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

export class LocalAuthService implements IAuthService {
  readonly providerName = 'local';
  private currentUser: UserProfile | null = null;
  private listeners: Array<(user: UserProfile | null) => void> = [];

  constructor() {
    if (typeof localStorage !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_SESSION_KEY);
        if (stored) {
          this.currentUser = JSON.parse(stored);
        }
      } catch (e) {
        console.error('LocalAuthService init error:', e);
      }
    }
  }

  async signInWithGoogle(): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
    const demoUser: UserProfile = {
      id: `usr_google_${Date.now()}`,
      name: 'Google Assessee',
      email: 'user@gmail.com',
      identifier: 'user@gmail.com',
      provider: 'local',
      createdAt: new Date().toISOString(),
    };
    this.setCurrentUser(demoUser);
    return { success: true, user: demoUser };
  }

  async signInWithCredentials(identifier: string, pass: string): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
    const cleanId = identifier.trim().toLowerCase();
    try {
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
          provider: 'local',
          createdAt: match.createdAt,
        };
        this.setCurrentUser(user);
        return { success: true, user };
      }
      return { success: false, error: 'Invalid credentials. Please try again.' };
    } catch (e: any) {
      return { success: false, error: e.message || 'Login failed.' };
    }
  }

  async signUpWithCredentials(name: string, identifier: string, pass: string): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
    const cleanId = identifier.trim().toLowerCase();
    try {
      const stored = localStorage.getItem(STORAGE_USERS_KEY);
      const users = stored ? JSON.parse(stored) : INITIAL_DEMO_USERS;
      if (users.some((u: any) => u.identifier.trim().toLowerCase() === cleanId)) {
        return { success: false, error: 'Account already exists with this ID.' };
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
        provider: 'local',
        createdAt: newUser.createdAt,
      };
      this.setCurrentUser(profile);
      return { success: true, user: profile };
    } catch (e: any) {
      return { success: false, error: e.message || 'Registration failed.' };
    }
  }

  async changePassword(currentPass: string, newPass: string): Promise<{ success: boolean; message?: string }> {
    if (!this.currentUser) return { success: false, message: 'Not logged in.' };
    try {
      const stored = localStorage.getItem(STORAGE_USERS_KEY);
      const users = stored ? JSON.parse(stored) : INITIAL_DEMO_USERS;
      const idx = users.findIndex((u: any) => u.id === this.currentUser?.id);
      if (idx !== -1 && users[idx].passwordHash === currentPass) {
        users[idx].passwordHash = newPass;
        localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
        return { success: true, message: 'Password updated successfully!' };
      }
      return { success: false, message: 'Current password incorrect.' };
    } catch (e: any) {
      return { success: false, message: e.message || 'Password update failed.' };
    }
  }

  async logout(): Promise<void> {
    this.setCurrentUser(null);
  }

  onAuthStateChanged(callback: (user: UserProfile | null) => void): () => void {
    this.listeners.push(callback);
    callback(this.currentUser);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }

  getCurrentUser(): UserProfile | null {
    return this.currentUser;
  }

  private setCurrentUser(user: UserProfile | null) {
    this.currentUser = user;
    if (typeof localStorage !== 'undefined') {
      if (user) {
        localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_SESSION_KEY);
      }
    }
    this.listeners.forEach((l) => l(user));
  }
}
