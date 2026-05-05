import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';

import en from './locales/en.json';
import de from './locales/de.json';
import fr from './locales/fr.json';
import pl from './locales/pl.json';

const deviceLanguage = getLocales()[0]?.languageCode ?? 'en';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      de: { translation: de },
      fr: { translation: fr },
      pl: { translation: pl },
    },
    lng: deviceLanguage,
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });

export default i18n;
