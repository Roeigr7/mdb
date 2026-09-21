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
