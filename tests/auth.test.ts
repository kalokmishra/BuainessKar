import { describe, it, expect, beforeEach } from 'vitest';

// Simple mock for localStorage in Vitest environment
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    },
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
});

describe('User Authentication & Session Engine', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('validates email ID and mobile number formats on signup', () => {
    const invalidEmailResult = validateSignupInput('Anand', 'invalid-email', 'pass123');
    expect(invalidEmailResult.success).toBe(false);
    expect(invalidEmailResult.message).toContain('valid email address');

    const validEmailResult = validateSignupInput('Anand', 'anand@tax.in', 'pass123');
    expect(validEmailResult.success).toBe(true);

    const validMobileResult = validateSignupInput('Anand', '9876543210', 'pass123');
    expect(validMobileResult.success).toBe(true);
  });

  it('authenticates user with static password and email/mobile ID', () => {
    const userDb = [
      {
        id: '1',
        name: 'Rahul',
        identifier: 'rahul@taxpro.in',
        passwordHash: 'password123',
      },
    ];

    const successLogin = authenticateUser(userDb, 'rahul@taxpro.in', 'password123');
    expect(successLogin.success).toBe(true);
    expect(successLogin.user?.name).toBe('Rahul');

    const failedLogin = authenticateUser(userDb, 'rahul@taxpro.in', 'wrongpass');
    expect(failedLogin.success).toBe(false);
  });

  it('ensures new visitors and logged out users remain unauthenticated (currentUser is null)', () => {
    // 1. Initial state when localStorage has no session
    const initialSession = getInitialSession();
    expect(initialSession).toBeNull();

    // 2. Simulate login session set
    const sessionUser = { id: 'usr_1', name: 'Rahul Sharma', identifier: 'rahul@taxpro.in' };
    localStorage.setItem('tax_app_active_session_v1', JSON.stringify(sessionUser));
    expect(getInitialSession()).toEqual(sessionUser);

    // 3. Simulate logout
    localStorage.removeItem('tax_app_active_session_v1');
    expect(getInitialSession()).toBeNull();
  });

  it('allows logged in user to reset password with valid current password', () => {
    const userDb = [
      {
        id: 'usr_1',
        name: 'Rahul',
        identifier: 'rahul@taxpro.in',
        passwordHash: 'password123',
      },
    ];

    // Wrong current password
    const failResult = changeUserPassword(userDb, 'usr_1', 'wrongpass', 'newpass456');
    expect(failResult.success).toBe(false);

    // Correct current password
    const successResult = changeUserPassword(userDb, 'usr_1', 'password123', 'newpass456');
    expect(successResult.success).toBe(true);

    // Login with new password
    const loginWithNewPass = authenticateUser(userDb, 'rahul@taxpro.in', 'newpass456');
    expect(loginWithNewPass.success).toBe(true);
  });

  describe('Modular Services & Provider Abstraction', () => {
    it('supports Google Sign-In and session management via Auth service', async () => {
      const { LocalAuthService } = await import('../src/services/local/localAuthService');
      const auth = new LocalAuthService();

      const res = await auth.signInWithGoogle();
      expect(res.success).toBe(true);
      expect(res.user).toBeDefined();
      expect(res.user?.email).toBe('user@gmail.com');

      expect(auth.getCurrentUser()?.email).toBe('user@gmail.com');

      await auth.logout();
      expect(auth.getCurrentUser()).toBeNull();
    });

    it('persists and subscribes to tax data via Database service', async () => {
      const { LocalDatabaseService } = await import('../src/services/local/localDatabaseService');
      const db = new LocalDatabaseService();

      const sampleTaxData: any = {
        grossReceipts: 5000000,
        cashReceipts: 150000,
        activityType: 'PROFESSION',
      };

      await db.saveTaxData('test_user_1', sampleTaxData);
      const retrieved = await db.getTaxData('test_user_1');
      expect(retrieved).toBeDefined();
      expect(retrieved?.grossReceipts).toBe(5000000);

      // Subscription check
      let subscribedValue: any = null;
      const unsub = db.subscribeTaxData('test_user_1', (data) => {
        subscribedValue = data;
      });

      expect(subscribedValue?.grossReceipts).toBe(5000000);
      unsub();
    });

    it('allows runtime switching of underlying auth & database providers', async () => {
      const { services } = await import('../src/services/index');
      expect(services.auth.providerName).toBe('firebase');
      expect(services.db.providerName).toBe('firestore');

      // Switch to local provider
      services.setProvider('local');
      expect(services.auth.providerName).toBe('local');
      expect(services.db.providerName).toBe('local');

      // Switch back to firebase
      services.setProvider('firebase');
      expect(services.auth.providerName).toBe('firebase');
      expect(services.db.providerName).toBe('firestore');
    });

    it('conforms to Firestore error reporting contract', async () => {
      const { handleFirestoreError, OperationType } = await import('../src/services/firebase/firebaseConfig');
      expect(typeof handleFirestoreError).toBe('function');
      expect(OperationType.WRITE).toBe('write');
      expect(OperationType.GET).toBe('get');

      expect(() => {
        handleFirestoreError(new Error('Missing or insufficient permissions'), OperationType.GET, 'users/123');
      }).toThrow();
    });

    it('exports firebaseConfig loaded from import.meta.env.VITE_FIREBASE_* variables in AuthContext', async () => {
      const { firebaseConfig, firebaseClientConfig, firebaseApp, firebaseAuth, firebaseDb } = await import('../src/context/AuthContext');
      expect(firebaseConfig).toBeDefined();
      expect(typeof firebaseConfig.apiKey).toBe('string');
      expect(typeof firebaseConfig.projectId).toBe('string');
      expect(typeof firebaseConfig.authDomain).toBe('string');
      expect(firebaseClientConfig).toBe(firebaseConfig);
      expect(firebaseApp).toBeDefined();
      expect(firebaseAuth).toBeDefined();
      expect(firebaseDb).toBeDefined();
    });

    it('initializes centralized Firebase instance in src/config/firebase using import.meta.env', async () => {
      const configFirebase = await import('../src/config/firebase');
      expect(configFirebase.app).toBeDefined();
      expect(configFirebase.auth).toBeDefined();
      expect(configFirebase.db).toBeDefined();
      expect(configFirebase.firebaseConfig).toBeDefined();
      expect(typeof configFirebase.firebaseConfig.apiKey).toBe('string');
    });

    it('resolves invalid action error gracefully during Google sign-in', async () => {
      const { services } = await import('../src/services/index');
      // When signInWithGoogle is invoked in preview/iframe environment, it resolves cleanly without invalid action error
      const res = await services.auth.signInWithGoogle();
      expect(res.success).toBe(true);
      expect(res.user).toBeDefined();
      expect(res.user?.provider).toBe('firebase');
      expect(res.error).toBeUndefined();
    });

    it('creates, updates, retrieves and deletes documents via DatabaseService', async () => {
      const { services } = await import('../src/services/index');

      const testDoc = {
        userId: 'usr_demo_1',
        title: 'Tax Invoice 2026-001',
        type: 'INVOICE',
        amount: 150000,
      };

      // 1. Create document
      await services.db.createDocument('users/usr_demo_1/documents', 'inv_001', testDoc);
      const created = await services.db.getDocument<any>('users/usr_demo_1/documents', 'inv_001');
      expect(created).toBeDefined();
      expect(created?.title).toBe('Tax Invoice 2026-001');
      expect(created?.amount).toBe(150000);
      expect(created?.createdAt).toBeDefined();

      // 2. Update document
      await services.db.updateDocument('users/usr_demo_1/documents', 'inv_001', {
        amount: 175000,
        status: 'PAID',
      });
      const updated = await services.db.getDocument<any>('users/usr_demo_1/documents', 'inv_001');
      expect(updated?.amount).toBe(175000);
      expect(updated?.status).toBe('PAID');
      expect(updated?.title).toBe('Tax Invoice 2026-001');

      // 3. Set document with merge
      await services.db.setDocument('users/usr_demo_1/documents', 'inv_001', {
        notes: 'Verified by CA',
      }, true);
      const merged = await services.db.getDocument<any>('users/usr_demo_1/documents', 'inv_001');
      expect(merged?.notes).toBe('Verified by CA');
      expect(merged?.amount).toBe(175000);

      // List documents in collection
      const list = await services.db.listDocuments<any>('users/usr_demo_1/documents');
      expect(list.length).toBeGreaterThanOrEqual(1);
      expect(list.some((d) => d.id === 'inv_001' || d.title === 'Tax Invoice 2026-001')).toBe(true);

      // 4. Delete document
      await services.db.deleteDocument('users/usr_demo_1/documents', 'inv_001');
      const deleted = await services.db.getDocument('users/usr_demo_1/documents', 'inv_001');
      expect(deleted).toBeNull();
    });
  });
});

// Helper logic mirroring AuthContext
function getInitialSession() {
  const activeSessionRaw = localStorage.getItem('tax_app_active_session_v1');
  if (activeSessionRaw) {
    try {
      return JSON.parse(activeSessionRaw);
    } catch {
      return null;
    }
  }
  return null;
}
function validateSignupInput(name: string, identifier: string, pass: string) {
  const cleanId = identifier.trim().toLowerCase();
  const isEmail = cleanId.includes('@');
  const isMobile = /^[0-9]{10}$/.test(cleanId);

  if (!isEmail && !isMobile) {
    return {
      success: false,
      message: 'Please enter a valid email address or 10-digit Indian mobile number.',
    };
  }

  if (!pass || pass.length < 4) {
    return { success: false, message: 'Password must be at least 4 characters long.' };
  }

  return { success: true };
}

function authenticateUser(userDb: any[], identifier: string, pass: string) {
  const cleanId = identifier.trim().toLowerCase();
  const user = userDb.find(
    (u) => u.identifier.trim().toLowerCase() === cleanId && u.passwordHash === pass
  );

  if (user) {
    return { success: true, user };
  }
  return { success: false, message: 'Invalid credentials' };
}

function changeUserPassword(userDb: any[], userId: string, currentPass: string, newPass: string) {
  const user = userDb.find((u) => u.id === userId);
  if (!user) return { success: false, message: 'User not found' };
  if (user.passwordHash !== currentPass) return { success: false, message: 'Incorrect current password' };
  if (!newPass || newPass.length < 4) return { success: false, message: 'Password too short' };
  user.passwordHash = newPass;
  return { success: true };
}
