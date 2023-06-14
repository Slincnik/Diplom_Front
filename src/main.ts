import { createApp } from "vue";
import { createPinia } from "pinia";
import { VueQueryPlugin } from "@tanstack/vue-query";
import Toast from "vue-toastification";
import type { VueQueryPluginOptions } from "@tanstack/vue-query";
import "vue-toastification/dist/index.css";

// Vuetify
import "vuetify/styles";
import { createVuetify } from "vuetify";
import {
  VCard,
  VContainer,
  VProgressCircular,
  VApp,
  VMenu,
  VBtn,
  VAvatar,
  VCardText,
  VSheet,
  VMain,
  VForm,
  VTextField,
  VTabs,
  VDivider,
  VListItem,
  VToolbar,
  VAppBarTitle,
  VAppBar,
  VCol,
  VRow,
  VTab,
  VListItemTitle,
  VListItemSubtitle,
  VIcon,
  VBadge,
  VToolbarTitle,
  VResponsive,
  VVirtualScroll,
  VFadeTransition,
  VList,
  VDialog,
  VCardTitle,
  VCardActions,
  VSelect,
} from "vuetify/components";
import * as directives from "vuetify/directives";

const vuetify = createVuetify({
  components: {
    VCard,
    VContainer,
    VProgressCircular,
    VApp,
    VMenu,
    VBtn,
    VAvatar,
    VCardText,
    VSheet,
    VMain,
    VForm,
    VTextField,
    VTabs,
    VDivider,
    VListItem,
    VToolbar,
    VAppBarTitle,
    VAppBar,
    VCol,
    VRow,
    VTab,
    VListItemTitle,
    VListItemSubtitle,
    VIcon,
    VBadge,
    VToolbarTitle,
    VResponsive,
    VVirtualScroll,
    VFadeTransition,
    VList,
    VDialog,
    VCardTitle,
    VCardActions,
    VSelect,
  },
  directives,
  theme: {
    defaultTheme: "dark",
  },
});

import App from "./App.vue";
import router from "./router";

const app = createApp(App);

const vueQuerySettings: VueQueryPluginOptions = {
  queryClientConfig: {
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
      },
    },
  },
};

const toastOpt = {
  timeout: 1500,
  pauseOnFocusLoss: false,
  pauseOnHover: false,
  maxToasts: 3,
};

app.use(createPinia());
app.use(router);
app.use(VueQueryPlugin, vueQuerySettings);
app.use(vuetify);
app.use(Toast, toastOpt);

app.mount("#app");
