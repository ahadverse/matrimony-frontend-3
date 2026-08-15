'use client';

import { useSyncExternalStore } from 'react';
import { SESSION_COOKIE } from './session';

const TOKEN_KEY = 'bk_token';
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // matches backend JWT_EXPIRES_IN

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

/**
 * Persists the access token in two places on purpose:
 * localStorage is what api-client reads to build the `Authorization` header,
 * and the cookie is what proxy.ts checks to redirect signed-out visitors away
 * from protected pages. Both are written together so they can't drift apart.
 */
export function setToken(token: string): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(TOKEN_KEY, token);
  const secure = window.location.protocol === 'https:' ? '; secure' : '';
  document.cookie = `${SESSION_COOKIE}=${token}; path=/; max-age=${MAX_AGE_SECONDS}; samesite=lax${secure}`;
}

export function clearToken(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(TOKEN_KEY);
  document.cookie = `${SESSION_COOKIE}=; path=/; max-age=0; samesite=lax`;
}

/**
 * Whether there is a session, safe to read during render.
 *
 * `getToken` touches localStorage, which doesn't exist while Next prerenders,
 * so reading it directly in a component would make the server and the first
 * client render disagree. `useSyncExternalStore` is the primitive for exactly
 * this: the server snapshot is always `false`, the client snapshot reads the
 * real token, and React reconciles the difference itself. Signing out in
 * another tab fires a `storage` event, which re-reads it.
 *
 * Pages open to both signed-in and anonymous visitors — the public profiles
 * directory — use this to decide whether a logged-in-only query is worth firing.
 */
export function useIsSignedIn(): boolean {
  return useSyncExternalStore(subscribeToToken, hasToken, () => false);
}

function subscribeToToken(onChange: () => void): () => void {
  window.addEventListener('storage', onChange);
  return () => window.removeEventListener('storage', onChange);
}

function hasToken(): boolean {
  return !!getToken();
}
