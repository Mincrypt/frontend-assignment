'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;

    const isAuthRoute = pathname.startsWith('/login');
    const isProtectedRoute = pathname.startsWith('/products') || pathname === '/';

    if (!isAuthenticated && isProtectedRoute) {
      const returnUrl = encodeURIComponent(pathname);
      router.replace(`/login?redirect=${returnUrl}`);
    } else if (isAuthenticated && isAuthRoute) {
      router.replace('/products');
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  // While checking initial local storage authentication state, render clean loader
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-slate-300">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
          </div>
          <span className="text-sm font-medium text-slate-400">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  // If not authenticated and on protected route, return blank while redirecting
  if (!isAuthenticated && (pathname.startsWith('/products') || pathname === '/')) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthGuard;
