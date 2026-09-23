'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Package, PlusCircle, ShieldCheck, X } from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
  const pathname = usePathname();

  const navItems = [
    {
      label: 'Products Catalog',
      href: '/products',
      icon: <Package className="w-5 h-5" />,
      active: pathname === '/products' || (pathname.startsWith('/products/') && pathname !== '/products/new' && !pathname.endsWith('/edit')),
    },
    {
      label: 'Add Product',
      href: '/products/new',
      icon: <PlusCircle className="w-5 h-5" />,
      active: pathname === '/products/new',
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800 text-slate-200">
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-6 border-b border-slate-800">
        <Link href="/products" className="flex items-center gap-3 font-extrabold text-lg text-white">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <span className="tracking-tight">Admin Hub</span>
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <div className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Management
        </div>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              item.active
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30 font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>DummyJSON API Connected</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 h-screen sticky top-0">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden animate-fade-in"
          onClick={onClose}
        >
          <div
            className="w-72 h-full bg-slate-900 shadow-2xl animate-slide-right"
            onClick={(e) => e.stopPropagation()}
          >
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
