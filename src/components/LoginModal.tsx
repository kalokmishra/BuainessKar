import React, { useState } from 'react';
import {
  ShieldCheck,
  Mail,
  Phone,
  Lock,
  User as UserIcon,
  ArrowRight,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginModal: React.FC = () => {
  const { login, signup } = useAuth();

  const [mode, setMode] = useState<'LOGIN' | 'SIGNUP'>('LOGIN');
  const [identifier, setIdentifier] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
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
      const res = login(identifier, password);
      if (!res.success) {
        setErrorMessage(res.message || 'Login failed');
      }
    } else {
      if (!fullName.trim()) {
        setErrorMessage('Please enter your full legal name.');
        return;
      }
      const res = signup(fullName, identifier, password);
      if (!res.success) {
        setErrorMessage(res.message || 'Registration failed');
      } else {
        setSuccessMessage('Account created successfully!');
      }
    }
  };

  const handleDemoLogin = (demoId: string, demoPass: string) => {
    setIdentifier(demoId);
    setPassword(demoPass);
    setErrorMessage('');
    const res = login(demoId, demoPass);
    if (!res.success) {
      setErrorMessage(res.message || 'Demo login failed');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl text-white relative">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-100">
            {mode === 'LOGIN' ? 'Tax Pro Portal Login' : 'Create Tax Pro Account'}
          </h2>
          <p className="text-xs text-slate-400">
            Official Indian Presumptive Tax & Compliance Engine (FY 2026-27 / AY 2027-28)
          </p>
        </div>

        {/* Auth Mode Toggle Tabs */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => {
              setMode('LOGIN');
              setErrorMessage('');
            }}
            className={`flex-1 py-2 font-bold rounded-lg transition-all ${
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
            className={`flex-1 py-2 font-bold rounded-lg transition-all ${
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
        <form onSubmit={handleSubmit} className="space-y-4">
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
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-100 placeholder-slate-600 outline-none"
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
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-100 placeholder-slate-600 outline-none"
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              Enter valid Email ID (e.g. rahul@taxpro.in) or 10-digit mobile number.
            </p>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-100 placeholder-slate-600 outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <span>{mode === 'LOGIN' ? 'Sign In to App' : 'Create Account & Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Explicit Mode Toggle Footer Link */}
        <div className="text-center pt-2">
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
        <div className="pt-3 border-t border-slate-800 space-y-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            Quick Demo Credentials:
          </span>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleDemoLogin('rahul@taxpro.in', 'password123')}
              className="bg-slate-950 hover:bg-slate-800 border border-slate-800 p-2.5 rounded-xl text-left transition-all space-y-0.5"
            >
              <span className="text-emerald-400 font-bold block text-[11px]">Email Demo</span>
              <span className="text-[10px] text-slate-300 block font-mono">rahul@taxpro.in</span>
              <span className="text-[10px] text-slate-500 block">Pass: password123</span>
            </button>

            <button
              type="button"
              onClick={() => handleDemoLogin('9876543210', 'password123')}
              className="bg-slate-950 hover:bg-slate-800 border border-slate-800 p-2.5 rounded-xl text-left transition-all space-y-0.5"
            >
              <span className="text-emerald-400 font-bold block text-[11px]">Mobile Demo</span>
              <span className="text-[10px] text-slate-300 block font-mono">9876543210</span>
              <span className="text-[10px] text-slate-500 block">Pass: password123</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
