'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, CheckCheck } from 'lucide-react';
import { resolveUploadUrl } from '@/lib/api-client';
import type { ChatMessage } from '@/lib/types';

interface MessageBubbleProps {
  message: ChatMessage;
  isMine: boolean;
  isFirstInGroup?: boolean;
  isLastInGroup?: boolean;
  avatarUrl?: string | null;
  avatarFallback?: string;
  onImageLoad?: () => void;
}

export function MessageBubble({
  message,
  isMine,
  isFirstInGroup = true,
  isLastInGroup = true,
  avatarUrl,
  avatarFallback,
  onImageLoad,
}: MessageBubbleProps) {
  const [avatarError, setAvatarError] = useState(false);
  const [imageError, setImageError] = useState(false);
  const time = new Date(message.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  const resolvedAvatar = resolveUploadUrl(avatarUrl ?? null);

  const isImage = message.type === 'image' && !!message.imageUrl;
  const resolvedImage = isImage ? resolveUploadUrl(message.imageUrl) : null;
  const showImage = isImage && !!resolvedImage && !imageError;

  const cornerClass = isMine
    ? `${!isFirstInGroup ? 'rounded-tr-md' : ''} ${!isLastInGroup ? 'rounded-br-md' : ''}`
    : `${!isFirstInGroup ? 'rounded-tl-md' : ''} ${!isLastInGroup ? 'rounded-bl-md' : ''}`;

  const meta = isLastInGroup && (
    <div className={`flex items-center justify-end gap-1 text-[10px] ${isMine ? 'text-[var(--color-on-primary)]/70' : 'text-[var(--color-text-faint)]'}`}>
      <span>{time}</span>
      {isMine && (message.readAt ? <CheckCheck size={12} /> : <Check size={12} />)}
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={`flex items-end gap-2 ${isMine ? 'justify-end' : 'justify-start'} ${isFirstInGroup ? 'mt-3' : 'mt-0.5'}`}
    >
      {!isMine && (
        <div className="h-6 w-6 shrink-0 overflow-hidden rounded-full bg-[var(--color-surface)]">
          {isLastInGroup &&
            (resolvedAvatar && !avatarError ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={resolvedAvatar} alt="" className="h-full w-full object-cover" onError={() => setAvatarError(true)} />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-[10px] font-semibold text-[var(--color-text-faint)]">
                {avatarFallback}
              </div>
            ))}
        </div>
      )}

      {showImage ? (
        <div className={`max-w-[65%] overflow-hidden shadow-sm ${cornerClass || 'rounded-2xl'}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={resolvedImage!}
            alt=""
            className="block max-h-80 w-full object-cover"
            onLoad={onImageLoad}
            onError={() => {
              setImageError(true);
              onImageLoad?.();
            }}
          />
          {isLastInGroup && (
            <div className="flex items-center justify-end gap-1 bg-[var(--color-scrim)] px-2 py-1 text-[10px] text-[var(--color-on-primary)]">
              <span>{time}</span>
              {isMine && (message.readAt ? <CheckCheck size={12} /> : <Check size={12} />)}
            </div>
          )}
        </div>
      ) : (
        <div
          className={`max-w-[70%] rounded-2xl px-3.5 py-2.5 text-sm shadow-sm ${cornerClass} ${
            isMine ? 'gradient-primary text-[var(--color-on-primary)]' : 'bg-[var(--color-surface)] text-[var(--color-text)]'
          }`}
        >
          {isImage ? (
            <span className="italic opacity-70">[Photo]</span>
          ) : (
            <p className="whitespace-pre-wrap break-words">{message.body}</p>
          )}
          {meta && <div className="mt-1">{meta}</div>}
        </div>
      )}
    </motion.div>
  );
}
