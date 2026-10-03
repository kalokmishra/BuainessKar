import React, { useState } from 'react';
import {
  Mail,
  Lock,
  User as UserIcon,
  ArrowRight,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  X,
  ShieldCheck,
} from 'lucide-react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { useAuth } from '../context/AuthContext';
import { Logo } from './Logo';

// Read configuration from environment variables defined in .env.local via import.meta.env
const adminSupportEmail = (import.meta.env.VITE_ADMIN_SUPPORT_EMAIL as string) || 'contactadmin@businesskar.com';
const defaultDemoEmail = (import.meta.env.VITE_DEFAULT_DEMO_EMAIL as string) || 'rahul@taxpro.in';
const defaultDemoName = (import.meta.env.VITE_DEFAULT_DEMO_NAME as string) || 'Rahul (IT Consultant)';
const secondaryDemoPhone = (import.meta.env.VITE_SECONDARY_DEMO_PHONE as string) || '9876543210';
const secondaryDemoName = (import.meta.env.VITE_SECONDARY_DEMO_NAME as string) || 'Priya (Retail Trader)';

/**
 * Firebase configuration pulled directly from environment variables via import.meta.env
 * to ensure consistent initialization across the application and prevent credential exposure.
 */
export const firebaseConfig = {
  apiKey: (import.meta.env.VITE_FIREBASE_API_KEY as string) || '',
  authDomain: (import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string) || '',
  projectId: (import.meta.env.VITE_FIREBASE_PROJECT_ID as string) || '',
  storageBucket: (import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string) || '',
  messagingSenderId: (import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string) || '',
  appId: (import.meta.env.VITE_FIREBASE_APP_ID as string) || '',
  measurementId: (import.meta.env.VITE_FIREBASE_MEASUREMENT_ID as string) || undefined,
  firestoreDatabaseId: (import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID as string) || undefined,
};

// Ensure consistent Firebase app instance using environment variables
export const firebaseApp = !getApps().length && firebaseConfig.apiKey
  ? initializeApp(firebaseConfig)
  : (getApps().length ? getApp() : null);

export const LoginModal: React.FC = () => {
  const { login, signup, signInWithGoogle, firebaseConfig: authFirebaseConfig } = useAuth();
  const activeFirebaseConfig = authFirebaseConfig || firebaseConfig;

  const [mode, setMode] = useState<'LOGIN' | 'SIGNUP'>('LOGIN');
  const [identifier, setIdentifier] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [showForgotPassword, setShowForgotPassword] = useState<boolean>(false);
  const [isGoogleSigningIn, setIsGoogleSigningIn] = useState<boolean>(false);

  const handleGoogleSignIn = async () => {
    setErrorMessage('');
    setSuccessMessage('');
    setIsGoogleSigningIn(true);
    try {
      const res = await signInWithGoogle();
      if (!res.success) {
        setErrorMessage(res.message || 'Google Sign-in failed. Please try again.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Google Sign-in failed.');
    } finally {
      setIsGoogleSigningIn(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!identifier.trim()) {
      setErrorMessage('Please enter an Email ID or 10-digit Mobile Number.');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    if (mode === 'LOGIN') {
      const res = await login(identifier, password);
      if (!res.success) {
        setErrorMessage(res.message || 'Login failed');
      }
    } else {
      if (!fullName.trim()) {
        setErrorMessage('Please enter your full legal name.');
        return;
      }
      const res = await signup(fullName, identifier, password);
      if (!res.success) {
        setErrorMessage(res.message || 'Registration failed');
      } else {
        setSuccessMessage('Account created successfully!');
      }
    }
  };

  const handleDemoLogin = async (demoId: string, demoPass: string) => {
    setIdentifier(demoId);
    setPassword(demoPass);
    setErrorMessage('');
    const res = await login(demoId, demoPass);
    if (!res.success) {
      setErrorMessage(res.message || 'Demo login failed');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl text-white relative">
        {/* Header Branding */}
        <div className="text-center space-y-1.5">
          <div className="mx-auto flex justify-center">
            <Logo className="w-14 h-14" showText={false} />
          </div>
          <h2 className="text-2xl font-black text-slate-100 flex items-center justify-center gap-1">
            <span>Business</span>
            <span className="text-emerald-400">kar</span>
          </h2>
          <p className="text-xs text-slate-400">
            {mode === 'LOGIN' ? 'Sign in to access Indian Presumptive Tax Engine' : 'Create your Businesskar Tax Pro Account'}
          </p>
        </div>

        {/* Primary Action: Google Sign-in with Firebase Auth */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isGoogleSigningIn}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-100 text-slate-900 font-bold py-2.5 px-4 rounded-xl text-xs transition-all shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.14z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>{isGoogleSigningIn ? 'Connecting with Google...' : 'Continue with Google (Firebase)'}</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-800" />
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
              or use password / demo
            </span>
            <div className="flex-1 h-px bg-slate-800" />
          </div>
        </div>

        {/* Auth Mode Toggle Tabs */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => {
              setMode('LOGIN');
              setErrorMessage('');
            }}
            className={`flex-1 py-1.5 font-bold rounded-lg transition-all ${
              mode === 'LOGIN'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('SIGNUP');
              setErrorMessage('');
            }}
            className={`flex-1 py-1.5 font-bold rounded-lg transition-all ${
              mode === 'SIGNUP'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            New Sign Up
          </button>
        </div>

        {/* Error / Success Alerts */}
        {errorMessage && (
          <div className="bg-rose-950/80 border border-rose-500/40 p-3 rounded-xl flex items-start gap-2 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="bg-emerald-950/80 border border-emerald-500/40 p-3 rounded-xl flex items-start gap-2 text-xs text-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'SIGNUP' && (
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Full Legal Name
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Rahul Sharma"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-600 outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Email ID or Mobile Number
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="user@domain.com OR 9876543210"
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-600 outline-none"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-300">
                Password
              </label>
              {mode === 'LOGIN' && (
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(!showForgotPassword)}
                  className="text-[11px] text-emerald-400 hover:text-emerald-300 font-medium hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-600 outline-none"
              />
            </div>
          </div>

          {showForgotPassword && (
            <div className="bg-amber-950/80 border border-amber-500/40 p-3 rounded-xl text-xs text-amber-200 space-y-1.5 animate-fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-amber-300">
                  <HelpCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Forgot Password?</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(false)}
                  className="text-amber-400 hover:text-amber-300"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-[11px] text-amber-300/90 leading-relaxed">
                For security, contact your tax administrator at <span className="font-mono text-amber-200 font-bold">{adminSupportEmail}</span> or sign in directly with Google.
              </p>
            </div>
          )}

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all shadow-md cursor-pointer"
          >
            <span>{mode === 'LOGIN' ? 'Sign In with Password' : 'Create Account'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Explicit Mode Toggle Footer Link */}
        <div className="text-center pt-1">
          {mode === 'SIGNUP' ? (
            <button
              type="button"
              onClick={() => {
                setMode('LOGIN');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className="text-xs text-slate-400 hover:text-emerald-400 transition-all cursor-pointer inline-flex items-center gap-1 font-medium"
            >
              Already have an account? <span className="text-emerald-400 font-bold underline">Sign In</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setMode('SIGNUP');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className="text-xs text-slate-400 hover:text-emerald-400 transition-all cursor-pointer inline-flex items-center gap-1 font-medium"
            >
              Don't have an account? <span className="text-emerald-400 font-bold underline">Create New Sign Up</span>
            </button>
          )}
        </div>

        {/* Quick Demo Credentials */}
        <div className="pt-2.5 border-t border-slate-800 space-y-1.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-emerald-400" />
            Instant Demo Profiles:
          </span>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleDemoLogin(defaultDemoEmail, 'password123')}
              className="bg-slate-950 hover:bg-slate-800 border border-slate-800 p-2 rounded-xl text-left transition-all space-y-0.5 cursor-pointer"
            >
              <span className="text-emerald-400 font-bold block text-[11px]">{defaultDemoName}</span>
              <span className="text-[10px] text-slate-400 block font-mono">{defaultDemoEmail}</span>
            </button>

            <button
              type="button"
              onClick={() => handleDemoLogin(secondaryDemoPhone, 'password123')}
              className="bg-slate-950 hover:bg-slate-800 border border-slate-800 p-2 rounded-xl text-left transition-all space-y-0.5 cursor-pointer"
            >
              <span className="text-emerald-400 font-bold block text-[11px]">{secondaryDemoName}</span>
              <span className="text-[10px] text-slate-400 block font-mono">{secondaryDemoPhone}</span>
            </button>
          </div>
        </div>

        {/* Security Badge */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Secure, encrypted tax evaluation session</span>
        </div>
      </div>
    </div>
  );
};
