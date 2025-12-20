import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import en from './translations/en.json';
import es from './translations/es.json';
import fr from './translations/fr.json';
import de from './translations/de.json';
import it from './translations/it.json';
import pt from './translations/pt.json';
import ja from './translations/ja.json';
import zh from './translations/zh.json';
import hi from './translations/hi.json';
import ar from './translations/ar.json';

const resources = {
  en: { translation: en },
  es: { translation: es },
  fr: { translation: fr },
  de: { translation: de },
  it: { translation: it },
  pt: { translation: pt },
  ja: { translation: ja },
  zh: { translation: zh },
  hi: { translation: hi },
  ar: { translation: ar },
};

const getDeviceLanguage = () => {
  const locales = Localization.getLocales();
  if (locales && locales.length > 0) {
    return locales[0].languageCode || 'en';
  }
  return 'en';
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getDeviceLanguage(),
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    compatibilityJSON: 'v4',
    react: {
      useSuspense: false,
    }
  });

i18n.on('languageChanged', (lng) => {
  console.log(`Language changed to: ${lng}`);
});

export default i18n;
