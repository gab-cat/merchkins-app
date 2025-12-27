/**
 * Simple translation utility
 * This can be replaced with a full i18n solution (e.g., next-intl) later
 */

type TranslationKey = 'business.dti_label';

const translations: Record<TranslationKey, string> = {
  'business.dti_label': 'DTI No.',
};

/**
 * Translation function
 * @param key - Translation key
 * @returns Translated string
 */
export function t(key: TranslationKey): string {
  return translations[key] || key;
}

/**
 * Hook for using translations in React components
 * @param key - Translation key
 * @returns Translated string
 */
export function useTranslation() {
  return {
    t: (key: TranslationKey) => translations[key] || key,
  };
}
