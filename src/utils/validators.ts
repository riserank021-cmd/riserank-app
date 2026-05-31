/**
 * Shared form validators used across auth screens, profile screens, etc.
 * Each function returns an error string, or undefined if valid.
 */

export function validateName(value: string): string | undefined {
  const v = value.trim();
  if (!v) return 'Name is required';
  if (v.length < 2) return 'Name must be at least 2 characters';
  if (v.length > 50) return 'Name cannot exceed 50 characters';
  return undefined;
}

export function validateEmail(value: string): string | undefined {
  const v = value.trim();
  if (!v) return 'Email is required';
  if (!/^\S+@\S+\.\S+$/.test(v)) return 'Invalid email address';
  return undefined;
}

export function validatePassword(value: string): string | undefined {
  if (!value) return 'Password is required';
  if (value.length < 8) return 'Password must be at least 8 characters';
  return undefined;
}

export function validateConfirmPassword(password: string, confirm: string): string | undefined {
  if (!confirm) return 'Please confirm your password';
  if (password !== confirm) return 'Passwords do not match';
  return undefined;
}

export function validatePhone(value: string): string | undefined {
  if (!value) return undefined; // phone is optional
  if (!/^[6-9]\d{9}$/.test(value)) return 'Invalid Indian phone number (10 digits, starts 6–9)';
  return undefined;
}

export function validateOTP(value: string, length = 6): string | undefined {
  if (!value || value.length !== length) return `Enter the ${length}-digit OTP`;
  if (!/^\d+$/.test(value)) return 'OTP must contain digits only';
  return undefined;
}

// ── Batch helper ──────────────────────────────────────────────────────────────
// Returns a map of field → error. Empty map means no errors.

type ValidatorMap<T extends string> = Partial<Record<T, string>>;

export function collectErrors<T extends string>(
  rules: Array<[T, string | undefined]>
): ValidatorMap<T> {
  return rules.reduce<ValidatorMap<T>>((acc, [field, error]) => {
    if (error) acc[field] = error;
    return acc;
  }, {});
}
