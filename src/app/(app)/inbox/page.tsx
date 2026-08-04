'use client';

import { MessageCircle } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageProvider';

export default function InboxIndexPage() {
  const { t } = useLanguage();
  return (
    <div className="flex h-full flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-surface)] text-[var(--color-text-faint)]">
        <MessageCircle size={28} />
      </div>
      <p className="max-w-[240px] text-sm text-[var(--color-text-muted)]">{t('inbox.selectConversation')}</p>
    </div>
  );
}
