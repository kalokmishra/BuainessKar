import { IDatabaseService, UserProfile } from '../types';
import { TaxDataState } from '../../context/TaxDataContext';

const STORAGE_TAX_DATA_PREFIX = 'businesskar_tax_data_';
const STORAGE_PROFILE_PREFIX = 'businesskar_profile_';

export class LocalDatabaseService implements IDatabaseService {
  readonly providerName = 'local';
  private listeners: Map<string, Array<(data: TaxDataState | null) => void>> = new Map();

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    if (typeof localStorage === 'undefined') return null;
    try {
      const raw = localStorage.getItem(`${STORAGE_PROFILE_PREFIX}${userId}`);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  async saveUserProfile(user: UserProfile): Promise<void> {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(`${STORAGE_PROFILE_PREFIX}${user.id}`, JSON.stringify(user));
    } catch (e) {
      console.error('saveUserProfile error:', e);
    }
  }

  getTaxDataSync(userId: string): TaxDataState | null {
    if (typeof localStorage === 'undefined') return null;
    try {
      const raw = localStorage.getItem(`${STORAGE_TAX_DATA_PREFIX}${userId}`);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  async getTaxData(userId: string): Promise<TaxDataState | null> {
    return this.getTaxDataSync(userId);
  }

  async saveTaxData(userId: string, data: TaxDataState): Promise<void> {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(`${STORAGE_TAX_DATA_PREFIX}${userId}`, JSON.stringify(data));
      const subs = this.listeners.get(userId);
      if (subs) {
        subs.forEach((cb) => cb(data));
      }
    } catch (e) {
      console.error('saveTaxData error:', e);
    }
  }

  subscribeTaxData(userId: string, callback: (data: TaxDataState | null) => void): () => void {
    if (!this.listeners.has(userId)) {
      this.listeners.set(userId, []);
    }
    this.listeners.get(userId)!.push(callback);

    // Provide initial state immediately
    callback(this.getTaxDataSync(userId));

    return () => {
      const subs = this.listeners.get(userId);
      if (subs) {
        this.listeners.set(
          userId,
          subs.filter((cb) => cb !== callback)
        );
      }
    };
  }

  private getDocStorageKey(collectionPath: string, docId: string): string {
    return `bk_doc_${collectionPath.replace(/\//g, '_')}_${docId}`;
  }

  async createDocument<T extends Record<string, any>>(collectionPath: string, docId: string, data: T): Promise<void> {
    if (typeof localStorage === 'undefined') return;
    const key = this.getDocStorageKey(collectionPath, docId);
    const payload = {
      ...data,
      id: docId,
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(key, JSON.stringify(payload));
  }

  async updateDocument<T extends Record<string, any>>(collectionPath: string, docId: string, data: Partial<T>): Promise<void> {
    if (typeof localStorage === 'undefined') return;
    const key = this.getDocStorageKey(collectionPath, docId);
    const existingRaw = localStorage.getItem(key);
    const existing = existingRaw ? JSON.parse(existingRaw) : {};
    const payload = {
      ...existing,
      ...data,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(key, JSON.stringify(payload));
  }

  async setDocument<T extends Record<string, any>>(collectionPath: string, docId: string, data: T, merge = true): Promise<void> {
    if (typeof localStorage === 'undefined') return;
    const key = this.getDocStorageKey(collectionPath, docId);
    let payload: Record<string, any> = { ...data };
    if (merge) {
      const existingRaw = localStorage.getItem(key);
      const existing = existingRaw ? JSON.parse(existingRaw) : {};
      payload = { ...existing, ...data };
    }
    payload.updatedAt = new Date().toISOString();
    localStorage.setItem(key, JSON.stringify(payload));
  }

  async getDocument<T extends Record<string, any>>(collectionPath: string, docId: string): Promise<T | null> {
    if (typeof localStorage === 'undefined') return null;
    const key = this.getDocStorageKey(collectionPath, docId);
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  }

  async deleteDocument(collectionPath: string, docId: string): Promise<void> {
    if (typeof localStorage === 'undefined') return;
    const key = this.getDocStorageKey(collectionPath, docId);
    localStorage.removeItem(key);
  }
}
