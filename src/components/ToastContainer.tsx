import React from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export function ToastContainer() {
  const { toasts, dismissToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto rounded-2xl bg-white dark:bg-[#1F1815] border border-orange-200 dark:border-orange-900/50 p-4 soft-card flex items-start gap-3 animate-fade-in-up"
        >
          {toast.type === 'success' && (
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
          )}
          {toast.type === 'error' && (
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          )}
          {toast.type === 'info' && (
            <Info className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
          )}
          <div className="flex-1 min-w-0">
            <p className="font-display font-semibold text-sm text-[#1E1B18] dark:text-orange-50">
              {toast.title}
            </p>
            {toast.description && (
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 line-clamp-2">
                {toast.description}
              </p>
            )}
          </div>
          <button
            onClick={() => dismissToast(toast.id)}
            aria-label="ปิดการแจ้งเตือน"
            className="text-stone-400 hover:text-stone-600 dark:hover:text-orange-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
