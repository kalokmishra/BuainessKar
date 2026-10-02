import { IAuthService, IDatabaseService } from './types';
import { FirebaseAuthService } from './firebase/firebaseAuthService';
import { FirestoreDatabaseService } from './firebase/firestoreDatabaseService';
import { LocalAuthService } from './local/localAuthService';
import { LocalDatabaseService } from './local/localDatabaseService';

export * from './types';
export { testConnection } from './firebase/firebaseConfig';

// Configurable Active Providers
export type ProviderType = 'firebase' | 'local';

// Default active provider is Firebase (Firestore + Google Auth)
const defaultProvider: ProviderType = 'firebase';

class ServiceRegistry {
  private activeAuthService: IAuthService;
  private activeDatabaseService: IDatabaseService;

  constructor(provider: ProviderType = defaultProvider) {
    if (provider === 'firebase') {
      this.activeAuthService = new FirebaseAuthService();
      this.activeDatabaseService = new FirestoreDatabaseService();
    } else {
      this.activeAuthService = new LocalAuthService();
      this.activeDatabaseService = new LocalDatabaseService();
    }
  }

  get auth(): IAuthService {
    return this.activeAuthService;
  }

  get db(): IDatabaseService {
    return this.activeDatabaseService;
  }

  /**
   * Switch the underlying auth/database provider at runtime or for testing
   * Enables seamless migration to Supabase, Cloud SQL, or other future providers!
   */
  setProvider(provider: ProviderType) {
    if (provider === 'firebase') {
      this.activeAuthService = new FirebaseAuthService();
      this.activeDatabaseService = new FirestoreDatabaseService();
    } else {
      this.activeAuthService = new LocalAuthService();
      this.activeDatabaseService = new LocalDatabaseService();
    }
  }

  setCustomServices(auth: IAuthService, db: IDatabaseService) {
    this.activeAuthService = auth;
    this.activeDatabaseService = db;
  }
}

export const services = new ServiceRegistry();
export const authService = services.auth;
export const databaseService = services.db;
