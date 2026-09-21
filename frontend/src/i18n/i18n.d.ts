import 'i18next';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    // Omit `resources` on purpose: with resources enabled, i18next's TFunction
    // overloads resolve in the IDE to only `translation:…` keys and reject the
    // unprefixed keys used throughout the app. Typed keys live in
    // `useAppTranslation` / `AppTranslationKey` instead.
  }
}
