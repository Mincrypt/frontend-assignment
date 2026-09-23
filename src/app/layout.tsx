import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import { ProductProvider } from '@/context/ProductContext';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Product Admin Dashboard | DummyJSON Inventory Management',
  description:
    'A production-grade, responsive product admin dashboard with manual pagination, search, category filtering, sorting, and full CRUD operations powered by DummyJSON.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} dark h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
        <ToastProvider>
          <AuthProvider>
            <ProductProvider>{children}</ProductProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
