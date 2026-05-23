import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';
import { createMMKV } from 'react-native-mmkv';

export const langStorage = createMMKV({ id: 'lang-storage' });
export const LANG_KEY = 'selected_language';

export type LangCode = string;

type Translation = { _name: string; [key: string]: unknown };

const localesContext = (require as unknown as {
  context: (
    dir: string,
    useSubdirs: boolean,
    pattern: RegExp,
  ) => { keys(): string[]; (id: string): Translation };
}).context('./locales', false, /\.json$/);

const locales: Record<string, Translation> = Object.fromEntries(
  localesContext.keys().map((key) => {
    const code = key.replace(/^\.\//, '').replace(/\.json$/, '');
    return [code, localesContext(key)];
  })
);

export const AVAILABLE_LANGUAGES: { code: LangCode; label: string }[] = Object.entries(locales)
  .map(([code, translation]) => ({ code, label: translation._name }));

const deviceLanguage = getLocales()[0]?.languageCode ?? 'en';
const stored = langStorage.getString(LANG_KEY);
const initialLang = stored && stored !== 'default' ? stored : deviceLanguage;

i18n
  .use(initReactI18next)
  .init({
    resources: Object.fromEntries(
      Object.entries(locales).map(([code, translation]) => [code, { translation }]),
    ),
    lng: initialLang,
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });

export default i18n;
