'use client';

import { clearToken, getToken } from './auth-token';

export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

const LOGIN_PATH = '/login';
// A 401 from these means "wrong phone/password", not "session expired" — the
// visitor is already signed out and is *trying* to sign in. Bouncing them to
// /login would reload the page out from under the error toast.
const SIGNED_OUT_PREFIX = 'auth/';

// One dead token fans out into a 401 per in-flight query — the dashboard alone
// fires a dozen. Latch so the first handler owns the redirect and the rest just
// throw as usual.
let redirectingToLogin = false;

function redirectToLogin(): void {
  if (typeof window === 'undefined' || redirectingToLogin) return;
  const { pathname, search } = window.location;
  if (pathname === LOGIN_PATH) return;

  redirectingToLogin = true;
  const loginUrl = new URL(LOGIN_PATH, window.location.origin);
  loginUrl.searchParams.set('redirect', `${pathname}${search}`);
  // A full document load rather than router.replace: the session is gone, so
  // tearing the page down takes the React Query cache and the chat socket with
  // it and nothing signed-in leaks into the login screen. `replace` keeps the
  // dead page out of the back history.
  window.location.replace(loginUrl.toString());
}

export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(status: number, body: { message?: string | string[] } | null) {
    const message = Array.isArray(body?.message) ? body.message.join('; ') : body?.message;
    super(message || `Request failed (${status})`);
    this.status = status;
    this.body = body;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const isFormData = options.body instanceof FormData;
  const headers = new Headers(options.headers);
  // Let the browser set multipart boundaries itself for FormData.
  if (!isFormData) headers.set('Content-Type', 'application/json');

  const token = getToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const res = await fetch(`${BACKEND_URL}/${path}`, { ...options, headers });

  const isJson = res.headers.get('content-type')?.includes('application/json');
  const body = isJson ? await res.json().catch(() => null) : null;

  if (!res.ok) {
    // A rejected token is dead weight — drop it so proxy.ts stops treating the
    // visitor as signed in, then send them to /login right away. Waiting for
    // the next navigation would strand them on a page whose every query 401s.
    if (res.status === 401) {
      clearToken();
      // Only a token that was actually sent and refused proves the session
      // died; a 401 on an unauthenticated call just means the endpoint needs
      // a login the visitor never had, which the route guards already cover.
      if (token && !path.replace(/^\//, '').startsWith(SIGNED_OUT_PREFIX)) redirectToLogin();
    }
    throw new ApiError(res.status, body);
  }
  return body as T;
}

export const api = {
  get: <T,>(path: string) => request<T>(path, { method: 'GET' }),
  post: <T,>(path: string, data?: unknown) =>
    request<T>(path, { method: 'POST', body: data instanceof FormData ? data : data !== undefined ? JSON.stringify(data) : undefined }),
  put: <T,>(path: string, data?: unknown) => request<T>(path, { method: 'PUT', body: JSON.stringify(data) }),
  patch: <T,>(path: string, data?: unknown) => request<T>(path, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: <T,>(path: string) => request<T>(path, { method: 'DELETE' }),
};

// Photos/selfies/chat images all come back from the API as full S3/CloudFront
// URLs already, so this prefixing branch shouldn't normally run — kept only
// as a defensive fallback in case a relative path ever reaches here.
export function resolveUploadUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith('http') || path.startsWith('data:')) return path;
  return `${BACKEND_URL}${path.startsWith('/') ? path : `/${path}`}`;
}
