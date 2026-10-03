import { TaxDataState } from '../context/TaxDataContext';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  identifier?: string;
  photoURL?: string;
  provider: 'firebase' | 'local' | 'demo';
  createdAt: string;
  updatedAt?: string;
}

export interface IAuthService {
  readonly providerName: string;
  signInWithGoogle(): Promise<{ success: boolean; user?: UserProfile; error?: string }>;
  signInWithCredentials(identifier: string, pass: string): Promise<{ success: boolean; user?: UserProfile; error?: string }>;
  signUpWithCredentials(name: string, identifier: string, pass: string): Promise<{ success: boolean; user?: UserProfile; error?: string }>;
  changePassword(currentPass: string, newPass: string): Promise<{ success: boolean; message?: string }>;
  logout(): Promise<void>;
  onAuthStateChanged(callback: (user: UserProfile | null) => void): () => void;
  getCurrentUser(): UserProfile | null;
}

export interface IDatabaseService {
  readonly providerName: string;
  getUserProfile(userId: string): Promise<UserProfile | null>;
  saveUserProfile(user: UserProfile): Promise<void>;
  getTaxData(userId: string): Promise<TaxDataState | null>;
  saveTaxData(userId: string, data: TaxDataState): Promise<void>;
  subscribeTaxData(userId: string, callback: (data: TaxDataState | null) => void): () => void;
  // Generic document create, update, set, get and delete methods
  createDocument<T extends Record<string, any>>(collectionPath: string, docId: string, data: T): Promise<void>;
  updateDocument<T extends Record<string, any>>(collectionPath: string, docId: string, data: Partial<T>): Promise<void>;
  setDocument<T extends Record<string, any>>(collectionPath: string, docId: string, data: T, merge?: boolean): Promise<void>;
  getDocument<T extends Record<string, any>>(collectionPath: string, docId: string): Promise<T | null>;
  deleteDocument(collectionPath: string, docId: string): Promise<void>;
}
