'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: ToastItem[];
  showToast: (toast: Omit<ToastItem, 'id'>) => void;
  removeToast: (id: string) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (toast: Omit<ToastItem, 'id'>) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: ToastItem = { ...toast, id };
      setToasts((prev) => [...prev, newToast]);

      const duration = toast.duration ?? 4000;
      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const success = useCallback(
    (title: string, message?: string) => showToast({ type: 'success', title, message }),
    [showToast]
  );

  const error = useCallback(
    (title: string, message?: string) => showToast({ type: 'error', title, message }),
    [showToast]
  );

  const info = useCallback(
    (title: string, message?: string) => showToast({ type: 'info', title, message }),
    [showToast]
  );

  const warning = useCallback(
    (title: string, message?: string) => showToast({ type: 'warning', title, message }),
    [showToast]
  );

  return (
    <ToastContext.Provider
      value={{ toasts, showToast, removeToast, success, error, info, warning }}
    >
      {children}
      {/* Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-md transition-all duration-300 transform translate-y-0 opacity-100 ${
              t.type === 'success'
                ? 'bg-emerald-950/90 text-emerald-100 border-emerald-700/60 shadow-emerald-950/40'
                : t.type === 'error'
                ? 'bg-rose-950/90 text-rose-100 border-rose-700/60 shadow-rose-950/40'
                : t.type === 'warning'
                ? 'bg-amber-950/90 text-amber-100 border-amber-700/60 shadow-amber-950/40'
                : 'bg-slate-900/95 text-slate-100 border-slate-700/60 shadow-slate-950/40'
            }`}
          >
            <div className="mt-0.5 shrink-0">
              {t.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              {t.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400" />}
              {t.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-400" />}
              {t.type === 'info' && <Info className="w-5 h-5 text-sky-400" />}
            </div>
            <div className="flex-1 text-sm">
              <div className="font-semibold">{t.title}</div>
              {t.message && <div className="text-xs opacity-90 mt-0.5 leading-relaxed">{t.message}</div>}
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="p-1 rounded-md text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
