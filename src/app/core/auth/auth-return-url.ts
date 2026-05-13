/**
 * Validates a post-login redirect path. Rejects open redirects and auth routes.
 */
export function validateInternalReturnUrl(raw: string | null | undefined): string | null {
  if (raw == null || typeof raw !== 'string') {
    return null;
  }
  let decoded = raw.trim();
  try {
    decoded = decodeURIComponent(decoded);
  } catch {
    return null;
  }
  decoded = decoded.trim();
  if (!decoded.startsWith('/') || decoded.startsWith('//')) {
    return null;
  }
  if (decoded.includes('://')) {
    return null;
  }
  const lower = decoded.toLowerCase();
  if (lower.startsWith('/auth')) {
    return null;
  }
  return decoded;
}
