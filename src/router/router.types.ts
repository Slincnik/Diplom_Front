import type { AppLayoutsEnum } from "@/layouts/layouts.types";
import type { VueElement } from "vue";

declare module "vue-router" {
  interface RouteMeta {
    layout?: AppLayoutsEnum;
    layoutComponent?: VueElement;
    guest: boolean | null;
  }
}

export enum PAGES {
  HOME = "home",
  NOTFOUND = "NotFound",
  LOGIN = "auth.login",
  REGISTRATION = "auth.register",
  LOGOUT = "auth.logout",
  DASHBOARD = "dashboard",
}
