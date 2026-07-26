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
});

// Helper logic mirroring AuthContext
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
