'use client';

import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import AuthGuard from '../auth/AuthGuard';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex">
        {/* Navigation Sidebar */}
        <Sidebar
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
        />

        {/* Main Application Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <Header onMenuToggle={() => setMobileMenuOpen(true)} />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
};

export default AppShell;
