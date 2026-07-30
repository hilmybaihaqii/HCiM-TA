'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ban, RotateCcw, Trash2, AlertTriangle } from 'lucide-react';

export type ActionType = 'delete' | 'deactivate' | 'activate';

interface UserActionModalProps {
  isOpen: boolean;
  action: ActionType | null;
  userName: string;
  isProcessing: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function UserActionModal({ 
  isOpen, 
  action, 
  userName, 
  isProcessing, 
  onClose, 
  onConfirm 
}: UserActionModalProps) {
  // Fungsi helper untuk menentukan UI berdasarkan aksi
  const getModalConfig = () => {
    switch (action) {
      case 'delete':
        return {
          icon: <Trash2 className="w-5 h-5 text-rose-500" />,
          colorClass: 'bg-rose-500/10 border-rose-500/20',
          btnClass: 'bg-rose-600 hover:bg-rose-700',
          title: 'Confirm Deletion',
          desc: 'delete the account for',
          warning: 'This action will remove the user from the system.'
        };
      case 'deactivate':
        return {
          icon: <Ban className="w-5 h-5 text-amber-500" />,
          colorClass: 'bg-amber-500/10 border-amber-500/20',
          btnClass: 'bg-amber-600 hover:bg-amber-700',
          title: 'Confirm Deactivation',
          desc: 'suspend access for',
          warning: 'User will be restricted from logging in.'
        };
      case 'activate':
        return {
          icon: <RotateCcw className="w-5 h-5 text-emerald-500" />,
          colorClass: 'bg-emerald-500/10 border-emerald-500/20',
          btnClass: 'bg-emerald-600 hover:bg-emerald-700',
          title: 'Confirm Activation',
          desc: 'restore access for',
          warning: 'User will regain full access to the system.'
        };
      default:
        return null;
    }
  };

  const config = getModalConfig();

  return (
    <AnimatePresence>
      {isOpen && action && config && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-200 flex items-center justify-center p-4 bg-background/60 backdrop-blur-sm"
        >
          <div 
            className="absolute inset-0 cursor-pointer" 
            onClick={() => !isProcessing && onClose()} 
          />
          
          <motion.div 
            initial={{ scale: 0.95, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="relative w-full max-w-90 bg-surface-white/90 backdrop-blur-2xl border border-foreground/10 shadow-[0_30px_80px_rgba(0,0,0,0.1)] rounded-3xl p-6 overflow-hidden"
          >
            <div className="mb-6 text-center flex flex-col items-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 border ${config.colorClass}`}>
                {action === 'delete' && <AlertTriangle className="w-5 h-5 text-rose-500 absolute -top-1 -right-1 opacity-50" />}
                {config.icon}
              </div>
              
              <h3 className="text-lg font-medium text-foreground tracking-tight mb-1">
                {config.title}
              </h3>
              
              <p className="text-xs text-muted leading-relaxed px-2 mt-2">
                Are you sure you want to {config.desc} <br/>
                <span className="font-semibold text-foreground">{userName}</span>?
              </p>

              <p className={`text-[10px] font-mono mt-4 px-3 py-1.5 rounded border uppercase tracking-widest ${config.colorClass}`}>
                {config.warning}
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <button 
                onClick={onConfirm}
                disabled={isProcessing}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-full text-white text-xs font-semibold tracking-wide hover:scale-[1.02] transition-all duration-300 shadow-sm disabled:opacity-70 disabled:hover:scale-100 ${config.btnClass}`}
              >
                {isProcessing ? (
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  `Yes, ${action.charAt(0).toUpperCase() + action.slice(1)}`
                )}
              </button>
              <button 
                onClick={onClose}
                disabled={isProcessing}
                className="w-full py-3 rounded-full border border-foreground/10 bg-transparent text-foreground text-xs font-semibold tracking-wide hover:bg-foreground/5 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}