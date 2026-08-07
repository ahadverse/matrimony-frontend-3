'use client';

import { motion } from 'framer-motion';
import { useLanguage } from '@/lib/i18n/LanguageProvider';

interface SwipeActionsProps {
  onReject: () => void;
  onLike: () => void;
  onSuperlike: () => void;
  disabled?: boolean;
}

export function SwipeActions({ onReject, onLike, onSuperlike, disabled }: SwipeActionsProps) {
  const { t } = useLanguage();

  return (
    <div className="mt-6 flex items-center justify-center gap-3">
      <motion.button
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: disabled ? 1 : 1.03 }}
        onClick={onReject}
        disabled={disabled}
        className="flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-4 py-2.5 text-sm font-medium text-[var(--color-pass)] shadow-sm transition-shadow disabled:opacity-40 disabled:shadow-none"
      >
        <span aria-hidden>❌</span>
        {t('browse.skipAction')}
      </motion.button>
      <motion.button
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: disabled ? 1 : 1.03 }}
        onClick={onSuperlike}
        disabled={disabled}
        className="glow-gold flex items-center gap-1.5 rounded-full border border-[var(--color-gold)]/50 bg-[var(--color-surface-raised)] px-4 py-2.5 text-sm font-medium text-[var(--color-gold-accent)] transition-shadow disabled:opacity-40 disabled:shadow-none"
      >
        <span aria-hidden>⭐</span>
        {t('browse.saveAction')}
      </motion.button>
      <motion.button
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: disabled ? 1 : 1.03 }}
        onClick={onLike}
        disabled={disabled}
        className="gradient-primary glow-primary flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-medium text-[var(--color-on-primary)] disabled:opacity-40"
      >
        <span aria-hidden>❤️</span>
        {t('browse.expressInterestAction')}
      </motion.button>
    </div>
  );
}
