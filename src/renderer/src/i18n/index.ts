import { createI18n } from "vue-i18n";

export default createI18n({
  legacy: false,
  locale: "en", // set locale
  fallbackLocale: "en", // set fallback locale
  messages: {
    // set locale messages
    en: {
      message: {
        hello: "Hello World",
      },
    },
  },
});
