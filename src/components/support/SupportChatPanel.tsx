'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Send, X } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageProvider';
import type { SupportMessage } from '@/lib/types';

export function SupportChatPanel({
  messages,
  isLoading,
  isSending,
  onSend,
  onClose,
}: {
  messages: SupportMessage[];
  isLoading: boolean;
  isSending: boolean;
  onSend: (body: string) => void;
  onClose: () => void;
}) {
  const { t } = useLanguage();
  const [text, setText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  function handleSend() {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText('');
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 16, scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="fixed bottom-24 right-5 z-40 flex h-[70vh] max-h-[520px] w-[92vw] max-w-sm flex-col overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] shadow-2xl"
    >
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-[var(--color-border)] gradient-primary px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-[var(--color-on-primary)]">{t('support.title')}</p>
          <p className="text-xs text-[var(--color-on-primary)]/80">{t('support.subtitle')}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={t('support.close')}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[var(--color-on-primary)]/90 hover:bg-white/15"
        >
          <X size={18} />
        </button>
      </div>

      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
        {isLoading ? (
          <p className="px-1 text-sm text-[var(--color-text-faint)]">{t('common.loading')}</p>
        ) : messages.length === 0 ? (
          <p className="px-1 text-sm text-[var(--color-text-muted)]">{t('support.empty')}</p>
        ) : (
          <div className="flex flex-col gap-2">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.senderRole === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm ${
                    m.senderRole === 'user'
                      ? 'gradient-primary text-[var(--color-on-primary)]'
                      : 'bg-[var(--color-surface)] text-[var(--color-text)]'
                  }`}
                >
                  {m.body}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex shrink-0 items-end gap-2 border-t border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2.5">
        <textarea
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder={t('support.placeholder')}
          className="max-h-24 flex-1 resize-none rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={!text.trim() || isSending}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full gradient-primary text-[var(--color-on-primary)] disabled:opacity-40"
          aria-label={t('common.send')}
        >
          <Send size={16} />
        </button>
      </div>
    </motion.div>
  );
}
