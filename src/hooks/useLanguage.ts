/**
 * useLanguage — binds the current app language to the `t()` translator.
 *
 * Returns:
 *   - `language`   current language code ('en' | 'hi')
 *   - `setLanguage` setter that also persists to AsyncStorage
 *   - `t`          pre-bound translator: (bilingual) => string
 *
 * Usage:
 *   const { t, language } = useLanguage();
 *   <Text>{t(quiz.title)}</Text>
 */

import { useCallback } from 'react';
import { useAppStore } from '../store/appStore';
import { t as translate } from '../utils/format';
import type { Bilingual } from '../types/api.types';
import type { Language } from '../utils/constants';

export function useLanguage() {
  const language = useAppStore((s) => s.language);
  const setLanguage = useAppStore((s) => s.setLanguage);

  const t = useCallback(
    (field: Bilingual | undefined | null) => translate(field, language),
    [language]
  );

  return { language, setLanguage, t };
}
