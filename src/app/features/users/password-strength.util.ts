export interface PasswordStrengthResult {
  valid: boolean;
  score: number;
  label: string;
  checks: { label: string; met: boolean }[];
}

export function assessPasswordStrength(password: string): PasswordStrengthResult {
  const checks = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'Uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'Lowercase letter', met: /[a-z]/.test(password) },
    { label: 'Number', met: /\d/.test(password) },
    { label: 'Special character', met: /[^A-Za-z0-9]/.test(password) },
  ];
  const met = checks.filter((c) => c.met).length;
  const valid = met === checks.length;
  const labels = ['Weak', 'Fair', 'Good', 'Strong', 'Very strong'];
  const score = Math.min(4, Math.max(0, met - 1));
  return {
    valid,
    score,
    label: password.length === 0 ? '' : labels[score] ?? 'Weak',
    checks,
  };
}
