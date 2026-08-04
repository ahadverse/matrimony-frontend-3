'use client';

import { motion } from 'framer-motion';
import { Heart, Star, X } from 'lucide-react';
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
    <div className="mt-6 flex items-center justify-center gap-5">
      <motion.button
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: disabled ? 1 : 1.06 }}
        onClick={onReject}
        disabled={disabled}
        aria-label={t('browse.reject')}
        className="flex h-14 w-14 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface-raised)] text-[var(--color-pass)] shadow-sm transition-shadow disabled:opacity-40 disabled:shadow-none"
      >
        <X size={26} />
      </motion.button>
      <motion.button
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: disabled ? 1 : 1.06 }}
        onClick={onSuperlike}
        disabled={disabled}
        aria-label={t('browse.superlike')}
        className="glow-gold flex h-11 w-11 items-center justify-center rounded-full border border-[var(--color-gold)]/50 bg-[var(--color-surface-raised)] text-[var(--color-gold-accent)] transition-shadow disabled:opacity-40 disabled:shadow-none"
      >
        <Star size={20} />
      </motion.button>
      <motion.button
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: disabled ? 1 : 1.06 }}
        onClick={onLike}
        disabled={disabled}
        aria-label={t('browse.like')}
        className="gradient-primary glow-primary flex h-14 w-14 items-center justify-center rounded-full text-[var(--color-on-primary)] disabled:opacity-40"
      >
        <Heart size={26} fill="currentColor" />
      </motion.button>
    </div>
  );
}
