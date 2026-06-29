import "@testing-library/jest-dom";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import translations from "../../public/locales/en-GB/translation.json";
import composersContent from "../../public/locales/en-GB/composers.json";
import compositionsContent from "../../public/locales/en-GB/compositions.json";
import eventsContent from "../../public/locales/en-GB/events.json";
import erasContent from "../../public/locales/en-GB/eras.json";
import frTranslations from "../../public/locales/fr-FR/translation.json";
import afTranslations from "../../public/locales/af-ZA/translation.json";
import esTranslations from "../../public/locales/es-ES/translation.json";
import plTranslations from "../../public/locales/pl-PL/translation.json";
import plComposersContent from "../../public/locales/pl-PL/composers.json";
import plCompositionsContent from "../../public/locales/pl-PL/compositions.json";
import plEventsContent from "../../public/locales/pl-PL/events.json";
import plErasContent from "../../public/locales/pl-PL/eras.json";

i18n.use(initReactI18next).init({
  lng: "en-GB",
  fallbackLng: "en-GB",
  ns: ["translation", "composers", "compositions", "events", "eras"],
  defaultNS: "translation",
  resources: {
    "en-GB": {
      translation: translations,
      composers: composersContent,
      compositions: compositionsContent,
      events: eventsContent,
      eras: erasContent,
    },
    "fr-FR": {
      translation: frTranslations,
    },
    "af-ZA": {
      translation: afTranslations,
    },
    "es-ES": {
      translation: esTranslations,
    },
    "pl-PL": {
      translation: plTranslations,
      composers: plComposersContent,
      compositions: plCompositionsContent,
      events: plEventsContent,
      eras: plErasContent,
    },
  },
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
});
