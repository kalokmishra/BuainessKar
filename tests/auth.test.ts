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
