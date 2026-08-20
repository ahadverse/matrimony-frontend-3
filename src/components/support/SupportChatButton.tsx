'use client';

import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageProvider';

export function SupportChatButton({
  hasUnread,
  onClick,
}: {
  hasUnread: boolean;
  onClick: () => void;
}) {
  const { t } = useLanguage();

  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label={t('support.title')}
      title={t('support.title')}
      className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full gradient-primary text-[var(--color-on-primary)] shadow-lg glow-primary"
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.94 }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      <MessageCircle size={26} />
      {hasUnread && (
        <span className="absolute right-0 top-0 h-3.5 w-3.5 rounded-full border-2 border-[var(--color-bg)] bg-[var(--color-danger)]" />
      )}
    </motion.button>
  );
}
