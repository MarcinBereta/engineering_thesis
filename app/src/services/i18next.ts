import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from '../locales/en.json';
import pl from '../locales/pl.json';
import de from '../locales/de.json';
import fr from '../locales/fr.json';
import es from '../locales/es.json';

export const languageResources = {
    en: { translation: en },
    pl: { translation: pl },
    de: { translation: de },
    fr: { translation: fr },
    es: { translation: es },
};

i18next.use(initReactI18next).init({
    debug: false,
    compatibilityJSON: 'v3',
    lng: 'en',
    fallbackLng: 'en',
    resources: languageResources,
});

export default i18next;
