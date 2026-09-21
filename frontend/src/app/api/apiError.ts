import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { t } from '../../i18n/useAppTranslation';

type ApiErrorBody = {
  message?: string | string[];
  error?: string;
  statusCode?: number;
};

function messageFromBody(data: unknown): string | undefined {
  if (!data || typeof data !== 'object') {
    return undefined;
  }

  const body = data as ApiErrorBody;
  if (Array.isArray(body.message)) {
    return body.message.join(', ');
  }
  if (typeof body.message === 'string' && body.message.trim()) {
    return body.message;
  }
  return undefined;
}

type GetErrorMessageOptions = {
  /** Use the translated fallback instead of a raw backend message. */
  preferFallback?: boolean;
};

/** User-facing message for RTK Query / fetch failures. Never dumps raw stacks. */
export function getErrorMessage(
  error: unknown,
  fallback = t('errors.fallback'),
  options?: GetErrorMessageOptions,
): string {
  if (!error || typeof error !== 'object') {
    return fallback;
  }

  if ('status' in error) {
    const fetchError = error as FetchBaseQueryError;

    if (fetchError.status === 'FETCH_ERROR') {
      return t('errors.network');
    }
    if (fetchError.status === 'TIMEOUT_ERROR') {
      return t('errors.timeout');
    }
    if (fetchError.status === 'PARSING_ERROR') {
      return t('errors.parse');
    }

    if (typeof fetchError.status === 'number') {
      if (options?.preferFallback) {
        return fallback;
      }

      const fromBody = messageFromBody(fetchError.data);
      switch (fetchError.status) {
        case 400:
          return fromBody ?? t('errors.badRequest');
        case 401:
          return fromBody ?? t('errors.unauthorized');
        case 403:
          return fromBody ?? t('errors.forbidden');
        case 404:
          return fromBody ?? t('errors.notFound');
        case 409:
          return fromBody ?? t('errors.conflict');
        case 429:
          return fromBody ?? t('errors.rateLimit');
        case 500:
        case 502:
        case 503:
          return fromBody ?? t('errors.server');
        default:
          return fromBody ?? fallback;
      }
    }
  }

  if ('message' in error && typeof (error as { message: unknown }).message === 'string') {
    return options?.preferFallback
      ? fallback
      : (error as { message: string }).message;
  }

  return fallback;
}
