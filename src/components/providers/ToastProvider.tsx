'use client';

import { createContext, useContext, useState, useCallback, useRef } from 'react';
import type { Toast } from '@/types';
import { generateId } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

interface ToastContextType {
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const TOAST_ICONS = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

const TOAST_COLORS = {
  success: { bg: '#F0FDF4', border: '#BBF7D0', icon: '#16A34A', bar: '#16A34A' },
  error: { bg: '#FEF2F2', border: '#FECACA', icon: '#DC2626', bar: '#DC2626' },
  info: { bg: '#EFF6FF', border: '#BFDBFE', icon: '#2563EB', bar: '#2563EB' },
  warning: { bg: '#FFFBEB', border: '#FDE68A', icon: '#F59E0B', bar: '#F59E0B' },
};

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const Icon = TOAST_ICONS[toast.type];
  const colors = TOAST_COLORS[toast.type];
  const duration = toast.duration || 3000;

  return (
    <motion.div
      layout
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 100, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
      style={{
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        borderRadius: '12px',
        padding: '16px',
        minWidth: '320px',
        maxWidth: '420px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
        <Icon size={20} color={colors.icon} style={{ flexShrink: 0, marginTop: '1px' }} />
        <div style={{ flex: 1 }}>
          <p style={{ fontWeight: 600, fontSize: '14px', color: '#1A1A1A', margin: 0 }}>
            {toast.title}
          </p>
          {toast.message && (
            <p style={{ fontSize: '13px', color: '#6B6B6B', margin: '4px 0 0', lineHeight: 1.4 }}>
              {toast.message}
            </p>
          )}
        </div>
        <button
          onClick={() => onRemove(toast.id)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '2px',
            color: '#9CA3AF',
            flexShrink: 0,
          }}
        >
          <X size={16} />
        </button>
      </div>
      {/* Progress bar */}
      <motion.div
        initial={{ width: '100%' }}
        animate={{ width: '0%' }}
        transition={{ duration: duration / 1000, ease: 'linear' }}
        onAnimationComplete={() => onRemove(toast.id)}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          height: '3px',
          background: colors.bar,
          borderRadius: '0 0 12px 12px',
        }}
      />
    </motion.div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastsRef = useRef<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    toastsRef.current = toastsRef.current.filter((t) => t.id !== id);
    setToasts([...toastsRef.current]);
  }, []);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const newToast: Toast = { ...toast, id: generateId() };
    toastsRef.current = [...toastsRef.current, newToast];
    setToasts([...toastsRef.current]);
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      {/* Toast Container */}
      <div
        style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
