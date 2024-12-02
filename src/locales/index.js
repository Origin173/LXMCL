import i18n from "i18next";
import { i18nConfig } from "../../next-i18next.config.mjs";
import en from "./en.json";
import zh_Hans from "./zh-Hans.json";

export const localeResources = {
  en: {
    translation: en,
    display_name: "English",
  },
  "zh-Hans": {
    translation: zh_Hans,
    display_name: "简体中文",
  },
};

// Function to save i18n language changes to localStorage
export function changeLanguage(lang) {
  if (!lang) lang = i18nConfig.defaultLocale;
  i18n.changeLanguage(lang);
  localStorage.setItem("locale", lang);
}

export const DEFAULT_LOCALE = i18nConfig.defaultLocale;
