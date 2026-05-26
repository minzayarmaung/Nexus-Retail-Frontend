/** Client-side username suggestions when the requested name is taken. */
export function suggestUsernames(base: string): string[] {
  const normalized = base
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9._-]/g, '');
  if (!normalized) return [];
  const candidates = [`${normalized}1`, `${normalized}_2`, `${normalized}.user`];
  return [...new Set(candidates.filter((c) => c !== normalized))].slice(0, 2);
}
