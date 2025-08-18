import { createApp } from "vue";
import router from "@renderer/router";
import i18n from "@renderer/i18n";
import App from "@renderer/App.vue";
import PrimeVue from "primevue/config";

import "@renderer/styles/all.css";

createApp(App)
  .use(router)
  .use(i18n)
  .use(PrimeVue, {
    unstyled: true,
  })
  .mount("#app");
