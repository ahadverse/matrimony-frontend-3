'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Bell } from 'lucide-react';
import { useUnreadCount, useLikesYou, useProfileViews } from '@/lib/queries';
import { useLanguage } from '@/lib/i18n/LanguageProvider';
import { playNotificationSound } from '@/lib/notificationSound';

export function NotificationBell() {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [justRang, setJustRang] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const previousTotalRef = useRef<number | null>(null);
  const { data: unread } = useUnreadCount();
  const { data: likesYou } = useLikesYou();
  const { data: profileViews } = useProfileViews();

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  const unreadCount = unread?.count ?? 0;
  const likesCount = likesYou?.length ?? 0;
  const viewsCount = profileViews?.count ?? 0;
  const total = unreadCount + likesCount + viewsCount;

  // Chime + a brief shake whenever the combined count goes up — covers new
  // messages in real time (unread-count is socket-invalidated) and picks up
  // new likes/profile-views whenever those queries next refetch.
  useEffect(() => {
    const previous = previousTotalRef.current;
    previousTotalRef.current = total;
    if (previous !== null && total > previous) {
      playNotificationSound();
      setJustRang(true);
      const timeout = setTimeout(() => setJustRang(false), 600);
      return () => clearTimeout(timeout);
    }
  }, [total]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label={t('nav.notifications')}
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-9 w-9 items-center justify-center rounded-full text-[var(--color-text-muted)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]"
      >
        <Bell size={18} className={justRang ? 'animate-bell-ring' : undefined} />
        {total > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full gradient-primary px-1 text-[9px] font-bold text-[var(--color-on-primary)]">
            {total > 9 ? '9+' : total}
          </span>
        )}
      </button>

      {open && (
        <div className="surface-card absolute right-0 z-30 mt-2 w-72 rounded-xl py-2 shadow-xl">
          <Link
            href="/inbox"
            onClick={() => setOpen(false)}
            className="flex items-center justify-between px-4 py-2.5 text-sm text-[var(--color-text)] hover:bg-[var(--color-surface)]"
          >
            {t('notif.messages')}
            <span className="font-semibold text-[var(--color-primary-accent)]">{unreadCount}</span>
          </Link>
          <Link
            href="/interests"
            onClick={() => setOpen(false)}
            className="flex items-center justify-between px-4 py-2.5 text-sm text-[var(--color-text)] hover:bg-[var(--color-surface)]"
          >
            {t('notif.likes')}
            <span className="font-semibold text-[var(--color-primary-accent)]">{likesCount}</span>
          </Link>
          <Link
            href="/dashboard"
            onClick={() => setOpen(false)}
            className="flex items-center justify-between px-4 py-2.5 text-sm text-[var(--color-text)] hover:bg-[var(--color-surface)]"
          >
            {t('notif.profileViews')}
            <span className="font-semibold text-[var(--color-primary-accent)]">{viewsCount}</span>
          </Link>
        </div>
      )}
    </div>
  );
}
