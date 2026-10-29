'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { primaryBtn, secondaryBtn } from '../../components/report/ui';

export type ActionType = 'deactivate' | 'activate';

const COPY: Record<ActionType, { title: string; body: (name: string) => string; confirm: string; busy: string }> = {
  deactivate: {
    title: 'Deactivate this account?',
    body: name => `${name} won't be able to sign in. The account is kept, so you can restore it at any time.`,
    confirm: 'Deactivate',
    busy: 'Deactivating…',
  },
  activate: {
    title: 'Restore this account?',
    body: name => `${name} will be able to sign in again and see their history.`,
    confirm: 'Restore',
    busy: 'Restoring…',
  },
};

/** Konfirmasi sebelum mengubah status akun. Esc atau klik di luar untuk batal. */
export default function UserActionModal({ isOpen, action, userName, isProcessing, onClose, onConfirm }: {
  isOpen: boolean;
  action: ActionType | null;
  userName: string;
  isProcessing: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && !isProcessing) onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, isProcessing, onClose]);

  const copy = action ? COPY[action] : null;

  return (
    <AnimatePresence>
      {isOpen && copy && (
        <motion.div
          key="backdrop"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={() => !isProcessing && onClose()}
          className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-foreground/30 backdrop-blur-[2px] px-4
            pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))]"
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="user-action-title"
            initial={{ opacity: 0, y: 16, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            onClick={e => e.stopPropagation()}
            className="w-full max-w-md rounded-sheet bg-surface-white p-6 sm:p-8 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.25)]"
          >
            <h2 id="user-action-title" className="text-xl font-medium tracking-tight text-foreground">{copy.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-foreground/70">{copy.body(userName)}</p>
            <div className="mt-8 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
              <button type="button" onClick={onClose} disabled={isProcessing} className={`${secondaryBtn} disabled:opacity-40`}>Cancel</button>
              <button type="button" onClick={onConfirm} disabled={isProcessing} className={primaryBtn}>
                {isProcessing ? copy.busy : copy.confirm}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
