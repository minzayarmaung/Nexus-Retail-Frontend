/** Curated inline SVG avatars (pick-only, no upload). */
export const AVATAR_IDS = [
  'person-smile',
  'person-tie',
  'cat-tabby',
  'cat-sit',
  'dog-happy',
  'dog-ear',
  'bunny',
  'fox',
  'panda',
  'robot'
] as const;

export type AvatarId = (typeof AVATAR_IDS)[number];

const svgs: Record<AvatarId, string> = {
  'person-smile': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><circle cx="32" cy="32" r="30" fill="#E2E8F0"/><circle cx="32" cy="26" r="12" fill="#FBBF24"/><path d="M16 52c4-10 12-14 16-14s12 4 16 14" stroke="#64748B" stroke-width="3" stroke-linecap="round"/><circle cx="26" cy="24" r="2" fill="#334155"/><circle cx="38" cy="24" r="2" fill="#334155"/><path d="M26 30c2 2 10 2 12 0" stroke="#334155" stroke-width="2" stroke-linecap="round"/></svg>`,
  'person-tie': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><circle cx="32" cy="32" r="30" fill="#CBD5E1"/><circle cx="32" cy="24" r="11" fill="#FCA5A5"/><path d="M14 54c5-12 14-16 18-16s13 4 18 16" fill="#94A3B8"/><path d="M28 36l4 14 4-14-4-6-4 6z" fill="#1E293B"/></svg>`,
  'cat-tabby': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><circle cx="32" cy="34" r="22" fill="#FDE68A"/><path d="M12 28l8-12 6 10M44 26l8-10 6 12" fill="#F59E0B"/><circle cx="24" cy="32" r="3" fill="#1E293B"/><circle cx="40" cy="32" r="3" fill="#1E293B"/><path d="M26 40c2 3 10 3 12 0" stroke="#1E293B" stroke-width="2" stroke-linecap="round"/><path d="M18 36h-4v4h4M46 36h4v4h-4" stroke="#D97706" stroke-width="2"/></svg>`,
  'cat-sit': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><ellipse cx="32" cy="38" rx="18" ry="16" fill="#FBCFE8"/><path d="M14 30l10-14 4 12M36 28l10-12 4 14" fill="#EC4899"/><circle cx="26" cy="34" r="2.5" fill="#831843"/><circle cx="38" cy="34" r="2.5" fill="#831843"/><path d="M30 42h4" stroke="#831843" stroke-width="2" stroke-linecap="round"/></svg>`,
  'dog-happy': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><ellipse cx="32" cy="34" rx="20" ry="18" fill="#FED7AA"/><ellipse cx="14" cy="36" rx="6" ry="10" fill="#FB923C"/><ellipse cx="50" cy="36" rx="6" ry="10" fill="#FB923C"/><circle cx="24" cy="32" r="3" fill="#431407"/><circle cx="40" cy="32" r="3" fill="#431407"/><path d="M24 42c3 4 13 4 16 0" stroke="#431407" stroke-width="2" stroke-linecap="round"/></svg>`,
  'dog-ear': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><circle cx="32" cy="36" r="18" fill="#E7E5E4"/><path d="M10 22l14 8-6 14L10 22zM54 22L40 30l6 14 8-22z" fill="#A8A29E"/><circle cx="26" cy="34" r="2.5" fill="#292524"/><circle cx="38" cy="34" r="2.5" fill="#292524"/><path d="M28 44h8" stroke="#292524" stroke-width="2" stroke-linecap="round"/></svg>`,
  bunny: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><ellipse cx="32" cy="40" rx="14" ry="12" fill="#F5F5F4"/><path d="M22 12c0 12-4 22-4 28h8c0-8 2-18 2-28" fill="#D6D3D1"/><path d="M42 10c0 14 4 24 4 30h-8c0-10-2-20-2-30" fill="#D6D3D1"/><circle cx="26" cy="38" r="2" fill="#44403C"/><circle cx="38" cy="38" r="2" fill="#44403C"/><ellipse cx="32" cy="44" rx="3" ry="2" fill="#FDA4AF"/></svg>`,
  fox: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><path d="M32 8L8 40l12-4 12 16 12-16 12 4L32 8z" fill="#EA580C"/><path d="M32 18L18 36l8-2 6 12 6-12 8 2L32 18z" fill="#FFF7ED"/><circle cx="26" cy="32" r="2" fill="#1C1917"/><circle cx="38" cy="32" r="2" fill="#1C1917"/><circle cx="32" cy="38" r="2" fill="#1C1917"/></svg>`,
  panda: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><circle cx="32" cy="34" r="20" fill="#FAFAF9"/><ellipse cx="22" cy="28" rx="8" ry="10" fill="#1E293B"/><ellipse cx="42" cy="28" rx="8" ry="10" fill="#1E293B"/><ellipse cx="32" cy="38" rx="10" ry="8" fill="#FFF"/><circle cx="26" cy="34" r="2" fill="#0F172A"/><circle cx="38" cy="34" r="2" fill="#0F172A"/><ellipse cx="32" cy="42" rx="4" ry="2.5" fill="#FDA4AF"/></svg>`,
  robot: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><rect x="14" y="20" width="36" height="30" rx="6" fill="#94A3B8"/><rect x="22" y="28" width="20" height="12" rx="2" fill="#E2E8F0"/><circle cx="28" cy="34" r="2" fill="#0EA5E9"/><circle cx="36" cy="34" r="2" fill="#0EA5E9"/><path d="M30 40h4" stroke="#475569" stroke-width="2"/><path d="M32 8v8" stroke="#64748B" stroke-width="4" stroke-linecap="round"/><circle cx="32" cy="6" r="3" fill="#38BDF8"/></svg>`
};

export function avatarDataUrl(id: AvatarId): string {
  const svg = svgs[id];
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export const DEFAULT_AVATAR_ID: AvatarId = 'person-smile';

export function resolveAvatarId(id: string | undefined): AvatarId {
  if (id && (AVATAR_IDS as readonly string[]).includes(id)) {
    return id as AvatarId;
  }
  return DEFAULT_AVATAR_ID;
}
