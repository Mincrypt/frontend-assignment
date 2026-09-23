'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Menu, LogOut, ShieldCheck, User } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface HeaderProps {
  onMenuToggle?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuToggle }) => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
      <div className="flex items-center gap-3">
        {onMenuToggle && (
          <button
            onClick={onMenuToggle}
            className="p-2 -ml-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden focus:outline-none cursor-pointer"
            aria-label="Open sidebar menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <Link href="/products" className="flex items-center gap-2.5 font-bold text-lg text-slate-100 lg:hidden">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <span>Admin Hub</span>
        </Link>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {/* User Profile Capsule */}
        {user && (
          <div className="flex items-center gap-3 py-1.5 px-3 rounded-full bg-slate-800/80 border border-slate-700/60">
            <div className="w-7 h-7 rounded-full overflow-hidden bg-indigo-900/60 border border-indigo-500/40 relative shrink-0 flex items-center justify-center">
              {user.image ? (
                <Image
                  src={user.image}
                  alt={user.firstName || user.username}
                  width={28}
                  height={28}
                  className="object-cover"
                />
              ) : (
                <User className="w-4 h-4 text-indigo-300" />
              )}
            </div>
            <div className="hidden sm:block text-left text-xs">
              <div className="font-semibold text-slate-200 capitalize">
                {user.firstName ? `${user.firstName} ${user.lastName}` : user.username}
              </div>
              <div className="text-slate-400 text-[10px] truncate max-w-[120px]">{user.email || user.username}</div>
            </div>
          </div>
        )}

        {/* Logout Button */}
        <button
          onClick={logout}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-rose-300 bg-slate-800 hover:bg-rose-950/40 border border-slate-700 hover:border-rose-800/60 rounded-lg transition-all cursor-pointer"
          title="Sign out of dashboard"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
