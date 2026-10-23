// The backend signs tokens with only a subject (username) and an expiry.
// We never verify them here, we only read them so the UI knows who is signed in
// and when the session ends.

function decodePayload(token) {
  try {
    const part = token.split('.')[1];
    if (!part) return null;
    const b64 = part.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(part.length / 4) * 4, '=');
    const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    return null;
  }
}

export function tokenInfo(token) {
  if (typeof token !== 'string') return null;
  const payload = decodePayload(token);
  if (!payload?.sub || !payload?.exp) return null;
  return { username: payload.sub, expiresAt: payload.exp * 1000 };
}

// A small margin so we ask for a fresh sign-in just before the server would refuse the token.
export function isExpired(token, skewMs = 3000) {
  const info = tokenInfo(token);
  return !info || info.expiresAt - Date.now() < skewMs;
}
