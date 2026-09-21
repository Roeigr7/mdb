import { useTranslation } from 'react-i18next';
import type { i18n as I18n } from 'i18next';
import i18n from './index';
import type { he } from './locales/he';

type NestedKeyOf<T> = {
  [K in keyof T & string]: T[K] extends Record<string, unknown>
    ? `${K}.${NestedKeyOf<T[K]>}`
    : K;
}[keyof T & string];

/** Dot-path keys from the Hebrew locale (source of truth for typed `t()`). */
export type AppTranslationKey = NestedKeyOf<typeof he>;

export type AppTFunction = {
  (key: AppTranslationKey): string;
  (key: AppTranslationKey, options: Record<string, unknown>): string;
};

function translate(
  key: AppTranslationKey,
  options?: Record<string, unknown>,
): string {
  return String(i18n.t(key as never, options as never));
}

/** Typed `t` for modules outside React (same keys as `useAppTranslation`). */
export const t: AppTFunction = translate;

/**
 * Same as `useTranslation()`, but `t` accepts unprefixed keys (`auth.subtitle`)
 * without depending on i18next's fragile `TFunction` overload resolution.
 */
export function useAppTranslation(): {
  t: AppTFunction;
  i18n: I18n;
  ready: boolean;
} {
  const { i18n: i18nInstance, ready } = useTranslation('translation');
  return {
    t: translate,
    i18n: i18nInstance,
    ready,
  };
}
