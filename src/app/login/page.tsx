'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, User, Eye, EyeOff, ShieldCheck, Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

function LoginContent() {
  const { login, isAuthenticated } = useAuth();
  const { success, error: toastError } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [username, setUsername] = useState('emilys');
  const [password, setPassword] = useState('emilyspass');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<{ username?: string; password?: string }>({});

  useEffect(() => {
    if (isAuthenticated) {
      const redirect = searchParams.get('redirect') || '/products';
      router.replace(redirect);
    }
    if (searchParams.get('sessionExpired')) {
      setErrorMessage('Your session has expired. Please log in again.');
    }
  }, [isAuthenticated, router, searchParams]);

  const validateForm = () => {
    const errors: { username?: string; password?: string } = {};
    if (!username.trim()) {
      errors.username = 'Username is required';
    }
    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 4) {
      errors.password = 'Password must be at least 4 characters';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Prevent duplicate submissions
    if (isLoading) return;

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await login({ username: username.trim(), password });
      success(`Welcome back, ${response.firstName || response.username}!`, 'You have successfully logged in.');
      
      const redirect = searchParams.get('redirect') || '/products';
      router.push(redirect);
    } catch (err: any) {
      const errorMsg =
        err.message || 'Invalid username or password. Please verify your credentials.';
      setErrorMessage(errorMsg);
      toastError('Login Failed', errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillDemo = () => {
    setUsername('emilys');
    setPassword('emilyspass');
    setErrorMessage(null);
    setFormErrors({});
  };

  return (
    <div className="w-full max-w-md relative z-10">
      {/* Brand Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 mb-4 shadow-lg shadow-indigo-500/10">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
          Admin Dashboard
        </h1>
        <p className="text-sm text-slate-400 mt-2">
          Sign in to manage inventory, catalog products, and analytics
        </p>
      </div>

      {/* Login Card */}
      <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800/90 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/60">
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-rose-950/60 border border-rose-800/60 text-rose-200 text-sm flex items-start gap-3">
            <span className="shrink-0 text-rose-400 font-bold">!</span>
            <div className="flex-1">{errorMessage}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <Input
            label="Username"
            id="username"
            type="text"
            placeholder="e.g. emilys"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              if (formErrors.username) setFormErrors({ ...formErrors, username: undefined });
            }}
            error={formErrors.username}
            leftIcon={<User className="w-4 h-4" />}
            autoComplete="username"
            required
            disabled={isLoading}
          />

          <div className="relative">
            <Input
              label="Password"
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (formErrors.password) setFormErrors({ ...formErrors, password: undefined });
              }}
              error={formErrors.password}
              leftIcon={<Lock className="w-4 h-4" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="hover:text-slate-200 p-1 focus:outline-none cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-slate-400" />
                  ) : (
                    <Eye className="w-4 h-4 text-slate-400" />
                  )}
                </button>
              }
              autoComplete="current-password"
              required
              disabled={isLoading}
            />
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full font-semibold group shadow-lg shadow-indigo-600/25"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />}
            >
              {isLoading ? 'Authenticating...' : 'Sign In'}
            </Button>
          </div>
        </form>

        {/* Demo Credentials Helper Pill */}
        <div className="mt-6 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between gap-3 text-xs">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 font-semibold text-slate-300">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Test Credentials</span>
              </div>
              <div className="text-slate-400 font-mono">
                User: <span className="text-indigo-300">emilys</span> / Pass:{' '}
                <span className="text-indigo-300">emilyspass</span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleFillDemo}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium transition-colors border border-slate-700 shrink-0 cursor-pointer"
            >
              Auto-fill
            </button>
          </div>
        </div>
      </div>

      {/* Footer info */}
      <p className="text-center text-xs text-slate-500 mt-6">
        Powered by Next.js & DummyJSON Auth API
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-sky-600/15 rounded-full blur-3xl pointer-events-none" />

      <Suspense
        fallback={
          <div className="flex flex-col items-center gap-3 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
            <span>Loading login...</span>
          </div>
        }
      >
        <LoginContent />
      </Suspense>
    </div>
  );
}
