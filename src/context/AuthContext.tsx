import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: string;
  name: string;
  identifier: string; // Email ID or Mobile Number
  type: 'email' | 'mobile';
  createdAt: string;
}

interface AuthContextType {
  currentUser: User | null;
  login: (identifier: string, pass: string) => { success: boolean; message?: string };
  signup: (name: string, identifier: string, pass: string) => { success: boolean; message?: string };
  logout: () => void;
}

const STORAGE_USERS_KEY = 'tax_app_registered_users_v1';
const STORAGE_SESSION_KEY = 'tax_app_active_session_v1';

// Default demo accounts for instant testing
const INITIAL_DEMO_USERS = [
  {
    id: 'usr_demo_1',
    name: 'Rahul Sharma',
    identifier: 'rahul@taxpro.in',
    type: 'email' as const,
    passwordHash: 'password123',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'usr_demo_2',
    name: 'Priya Patel',
    identifier: '9876543210',
    type: 'mobile' as const,
    passwordHash: 'password123',
    createdAt: new Date().toISOString(),
  },
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Initialize stored users and active session on load
  useEffect(() => {
    try {
      const storedUsersRaw = localStorage.getItem(STORAGE_USERS_KEY);
      if (!storedUsersRaw) {
        localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(INITIAL_DEMO_USERS));
      }

      const activeSessionRaw = localStorage.getItem(STORAGE_SESSION_KEY);
      if (activeSessionRaw) {
        setCurrentUser(JSON.parse(activeSessionRaw));
      }
    } catch (err) {
      console.error('Error initializing AuthState:', err);
    }
  }, []);

  const login = (identifier: string, pass: string) => {
    const cleanId = identifier.trim().toLowerCase();
    try {
      const storedUsersRaw = localStorage.getItem(STORAGE_USERS_KEY);
      const usersList = storedUsersRaw ? JSON.parse(storedUsersRaw) : INITIAL_DEMO_USERS;

      const user = usersList.find(
        (u: any) => u.identifier.trim().toLowerCase() === cleanId && u.passwordHash === pass
      );

      if (user) {
        const userObj: User = {
          id: user.id,
          name: user.name,
          identifier: user.identifier,
          type: user.type,
          createdAt: user.createdAt,
        };
        setCurrentUser(userObj);
        localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(userObj));
        return { success: true };
      } else {
        return {
          success: false,
          message: 'Invalid email/mobile number or password. Please try again.',
        };
      }
    } catch (e: any) {
      return { success: false, message: e.message || 'Login failed.' };
    }
  };

  const signup = (name: string, identifier: string, pass: string) => {
    const cleanId = identifier.trim().toLowerCase();
    const isEmail = cleanId.includes('@');
    const isMobile = /^[0-9]{10}$/.test(cleanId);

    if (!isEmail && !isMobile) {
      return {
        success: false,
        message: 'Please enter a valid email address (e.g. user@domain.com) or 10-digit Indian mobile number.',
      };
    }

    if (!pass || pass.length < 4) {
      return { success: false, message: 'Password must be at least 4 characters long.' };
    }

    try {
      const storedUsersRaw = localStorage.getItem(STORAGE_USERS_KEY);
      const usersList = storedUsersRaw ? JSON.parse(storedUsersRaw) : INITIAL_DEMO_USERS;

      const existing = usersList.find(
        (u: any) => u.identifier.trim().toLowerCase() === cleanId
      );

      if (existing) {
        return {
          success: false,
          message: 'An account with this Email ID or Mobile Number already exists. Please Log In.',
        };
      }

      const newUser = {
        id: `usr_${Date.now()}`,
        name: name.trim() || 'Assessee Taxpayer',
        identifier: cleanId,
        type: isEmail ? ('email' as const) : ('mobile' as const),
        passwordHash: pass,
        createdAt: new Date().toISOString(),
      };

      const updatedUsers = [...usersList, newUser];
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(updatedUsers));

      const sessionObj: User = {
        id: newUser.id,
        name: newUser.name,
        identifier: newUser.identifier,
        type: newUser.type,
        createdAt: newUser.createdAt,
      };

      setCurrentUser(sessionObj);
      localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(sessionObj));

      return { success: true };
    } catch (e: any) {
      return { success: false, message: e.message || 'Registration failed.' };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_SESSION_KEY);
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, signup, logout }}>
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
