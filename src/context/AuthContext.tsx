import React, { createContext, useContext, useState, useEffect } from 'react';
import { services, UserProfile } from '../services';

export interface User {
  id: string;
  name: string;
  identifier: string; // Email ID, Mobile Number, or Google Account
  email?: string;
  photoURL?: string;
  provider?: 'firebase' | 'local' | 'demo';
  type?: 'email' | 'mobile' | 'google';
  createdAt: string;
}

interface AuthContextType {
  currentUser: User | null;
  activeProvider: string;
  signInWithGoogle: () => Promise<{ success: boolean; message?: string }>;
  login: (identifier: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  signup: (name: string, identifier: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  changePassword: (currentPass: string, newPass: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Subscribe to auth state changes from active provider (Firebase / Local)
  useEffect(() => {
    const unsubscribe = services.auth.onAuthStateChanged(async (profile: UserProfile | null) => {
      if (profile) {
        const userObj: User = {
          id: profile.id,
          name: profile.name,
          identifier: profile.identifier || profile.email,
          email: profile.email,
          photoURL: profile.photoURL,
          provider: profile.provider,
          type: profile.provider === 'firebase' ? 'google' : profile.email.includes('@') ? 'email' : 'mobile',
          createdAt: profile.createdAt,
        };
        setCurrentUser(userObj);

        // Sync user profile with database provider (Firestore)
        try {
          await services.db.saveUserProfile(profile);
        } catch (e) {
          console.warn('Failed to sync user profile to database:', e);
        }
      } else {
        setCurrentUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async (): Promise<{ success: boolean; message?: string }> => {
    setIsLoading(true);
    try {
      const res = await services.auth.signInWithGoogle();
      if (res.success && res.user) {
        const userObj: User = {
          id: res.user.id,
          name: res.user.name,
          identifier: res.user.email,
          email: res.user.email,
          photoURL: res.user.photoURL,
          provider: 'firebase',
          type: 'google',
          createdAt: res.user.createdAt,
        };
        setCurrentUser(userObj);
        try {
          await services.db.saveUserProfile(res.user);
        } catch (e) {
          console.warn('DB profile sync error:', e);
        }
        return { success: true };
      }
      return { success: false, message: res.error || 'Google Sign-in failed.' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Google Sign-in failed.' };
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (identifier: string, pass: string): Promise<{ success: boolean; message?: string }> => {
    setIsLoading(true);
    try {
      const res = await services.auth.signInWithCredentials(identifier, pass);
      if (res.success && res.user) {
        const userObj: User = {
          id: res.user.id,
          name: res.user.name,
          identifier: res.user.identifier || res.user.email,
          email: res.user.email,
          provider: res.user.provider,
          type: res.user.email.includes('@') ? 'email' : 'mobile',
          createdAt: res.user.createdAt,
        };
        setCurrentUser(userObj);
        try {
          await services.db.saveUserProfile(res.user);
        } catch (e) {
          console.warn('DB profile sync error:', e);
        }
        return { success: true };
      }
      return { success: false, message: res.error || 'Invalid credentials.' };
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, identifier: string, pass: string): Promise<{ success: boolean; message?: string }> => {
    setIsLoading(true);
    try {
      const res = await services.auth.signUpWithCredentials(name, identifier, pass);
      if (res.success && res.user) {
        const userObj: User = {
          id: res.user.id,
          name: res.user.name,
          identifier: res.user.identifier || res.user.email,
          email: res.user.email,
          provider: res.user.provider,
          type: res.user.email.includes('@') ? 'email' : 'mobile',
          createdAt: res.user.createdAt,
        };
        setCurrentUser(userObj);
        try {
          await services.db.saveUserProfile(res.user);
        } catch (e) {
          console.warn('DB profile sync error:', e);
        }
        return { success: true };
      }
      return { success: false, message: res.error || 'Signup failed.' };
    } finally {
      setIsLoading(false);
    }
  };

  const changePassword = async (currentPass: string, newPass: string): Promise<{ success: boolean; message?: string }> => {
    return services.auth.changePassword(currentPass, newPass);
  };

  const logout = async (): Promise<void> => {
    await services.auth.logout();
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        activeProvider: services.auth.providerName,
        signInWithGoogle,
        login,
        signup,
        changePassword,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
