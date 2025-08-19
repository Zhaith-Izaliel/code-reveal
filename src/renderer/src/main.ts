import { createApp } from "vue";
import router from "@renderer/router";
import i18n from "@renderer/i18n";
import App from "@renderer/App.vue";
import PrimeVue from "primevue/config";
import Aura from "@primeuix/themes/aura";
import Tooltip from "primevue/tooltip";

import "@renderer/styles/all.css";
import { setTheme } from "./utils";

await setTheme("system");

createApp(App)
  .use(router)
  .use(i18n)
  .use(PrimeVue, {
    theme: {
      preset: Aura,
      options: {
        darkModeSelector: ".app-dark",
      },
    },
  })
  .directive("tooltip", Tooltip)
  .mount("#app");
