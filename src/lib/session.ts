// Name of the cookie that mirrors the access token. The token itself lives in
// localStorage (see lib/auth-token.ts) and is sent as a Bearer header; this
// cookie exists purely so proxy.ts can gate protected routes at the edge,
// where localStorage isn't readable.
export const SESSION_COOKIE = 'session';
