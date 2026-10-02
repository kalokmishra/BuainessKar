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
}
