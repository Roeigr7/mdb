export function localeForLanguage(language: string) {
  return language.startsWith('en') ? 'en-US' : 'he-IL';
}

export function formatNumber(value: number, language: string) {
  return new Intl.NumberFormat(localeForLanguage(language), {
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatMoney(value: number, language: string) {
  return new Intl.NumberFormat(localeForLanguage(language), {
    style: 'currency',
    currency: 'ILS',
    maximumFractionDigits: 2,
  }).format(value);
}

/** Compact currency for axes / dense UI: ₪12.5K, ₪1.25M */
export function formatCompactMoney(value: number, language: string) {
  const abs = Math.abs(value);
  const signed = value < 0 ? -abs : abs;
  return new Intl.NumberFormat(localeForLanguage(language), {
    style: 'currency',
    currency: 'ILS',
    notation: abs >= 10_000 ? 'compact' : 'standard',
    maximumFractionDigits: abs >= 10_000 ? 1 : 2,
  }).format(signed);
}

export function formatPercentage(value: number, language: string, digits = 1) {
  return new Intl.NumberFormat(localeForLanguage(language), {
    style: 'percent',
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(value / 100);
}

export function formatDate(value: string, language: string) {
  try {
    return new Intl.DateTimeFormat(localeForLanguage(language), {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export function formatDateTime(value: string, language: string) {
  try {
    return new Intl.DateTimeFormat(localeForLanguage(language), {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export function formatMonthKey(month: string, language: string) {
  const [year, monthPart] = month.split('-').map(Number);
  if (!year || !monthPart) return month;
  const date = new Date(year, monthPart - 1, 1);
  return new Intl.DateTimeFormat(localeForLanguage(language), {
    month: 'short',
    year: '2-digit',
  }).format(date);
}

export function formatMonthKeyLong(month: string, language: string) {
  const [year, monthPart] = month.split('-').map(Number);
  if (!year || !monthPart) return month;
  const date = new Date(year, monthPart - 1, 1);
  return new Intl.DateTimeFormat(localeForLanguage(language), {
    month: 'long',
    year: 'numeric',
  }).format(date);
}
