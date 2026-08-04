'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useId, type ReactNode } from 'react';
import { X } from 'lucide-react';
import clsx from 'clsx';

type Size = 'sm' | 'md' | 'lg';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  size?: Size;
  children: ReactNode;
}

const sizeClasses: Record<Size, string> = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-md',
  lg: 'sm:max-w-2xl',
};

export function Modal({ open, onClose, title, size = 'md', children }: ModalProps) {
  const titleId = useId();

  // Escape to close, and lock body scroll so the page behind a bottom sheet
  // doesn't scroll under it on touch devices.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex cursor-pointer items-end justify-center bg-[var(--color-scrim)] p-0 backdrop-blur-sm sm:items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            className={clsx(
              'surface-card max-h-[90dvh] w-full cursor-auto overflow-y-auto rounded-t-3xl p-6 shadow-xl sm:rounded-2xl',
              sizeClasses[size],
            )}
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              {title && (
                <h3 id={titleId} className="font-display text-lg text-[var(--color-text)]">
                  {title}
                </h3>
              )}
              <button
                onClick={onClose}
                className="ml-auto flex h-8 w-8 items-center justify-center rounded-full text-[var(--color-text-muted)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
