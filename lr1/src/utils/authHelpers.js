export const PASSWORD_RULES = [
  { id: 'length', label: 'Минимум 8 символов', test: (pwd) => pwd.length >= 8 },
  { id: 'lower', label: 'Хотя бы одна строчная буква (a-z)', test: (pwd) => /[a-z]/.test(pwd) },
  { id: 'upper', label: 'Хотя бы одна заглавная буква (A-Z)', test: (pwd) => /[A-Z]/.test(pwd) },
  { id: 'digit', label: 'Хотя бы одна цифра (0-9)', test: (pwd) => /\d/.test(pwd) },
];

export function validatePassword(password) {
  const pwd = password || '';
  const failed = PASSWORD_RULES.filter((rule) => !rule.test(pwd));
  return { valid: failed.length === 0, failed };
}

export function validateUsername(username) {
  const trimmed = (username || '').trim();
  if (!trimmed) return 'Логин обязателен';
  if (trimmed.length < 3) return 'Логин должен содержать минимум 3 символа';
  if (trimmed.length > 20) return 'Логин не должен превышать 20 символов';
  if (!/^[A-Za-z0-9_]+$/.test(trimmed)) {
    return 'Логин может содержать только латинские буквы, цифры и знак подчёркивания';
  }
  return null;
}
