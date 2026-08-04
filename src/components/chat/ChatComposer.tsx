'use client';

import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { ImagePlus, Send } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageProvider';
import { MAX_IMAGE_SIZE_MB, validateImageFile } from '@/lib/fileValidation';

const TYPING_STOP_DELAY = 2000;
const MAX_TEXTAREA_HEIGHT = 120;

interface ChatComposerProps {
  onSendText: (body: string) => void;
  onSendImage: (file: File) => void;
  onTypingStart: () => void;
  onTypingStop: () => void;
  isSendingImage: boolean;
}

export function ChatComposer({ onSendText, onSendImage, onTypingStart, onTypingStop, isSendingImage }: ChatComposerProps) {
  const { t } = useLanguage();
  const [text, setText] = useState('');
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, MAX_TEXTAREA_HEIGHT)}px`;
  }, [text]);

  function handleChange(value: string) {
    setText(value);
    onTypingStart();
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(onTypingStop, TYPING_STOP_DELAY);
  }

  function handleSend() {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSendText(trimmed);
    setText('');
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    onTypingStop();
  }

  return (
    <div className="flex shrink-0 items-end gap-2 border-t border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3">
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={isSendingImage}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface)] hover:text-[var(--color-primary-accent)] disabled:opacity-50"
        aria-label={t('chat.sendImage')}
      >
        {isSendingImage ? (
          <span className="h-4 w-4 rounded-full border-2 border-current/40 border-t-current animate-spin" />
        ) : (
          <ImagePlus size={20} />
        )}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = '';
          if (!file) return;
          const result = validateImageFile(file);
          if (!result.ok) {
            toast.error(
              result.reason === 'size' ? t('common.imageTooLarge', { size: MAX_IMAGE_SIZE_MB }) : t('common.imageInvalidType'),
            );
            return;
          }
          onSendImage(file);
        }}
      />
      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => handleChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
        }}
        placeholder={t('chat.sendPlaceholder')}
        rows={1}
        className="max-h-[120px] flex-1 resize-none overflow-y-auto rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-sm leading-normal text-[var(--color-text)] outline-none transition-colors focus:border-[var(--color-primary)]"
      />
      <button
        onClick={handleSend}
        disabled={!text.trim()}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full gradient-primary text-[var(--color-on-primary)] transition-transform disabled:opacity-40 disabled:grayscale enabled:hover:scale-105 enabled:active:scale-95"
        aria-label={t('common.send')}
      >
        <Send size={18} />
      </button>
    </div>
  );
}
