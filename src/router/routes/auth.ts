import type { RouteRecordRaw } from "vue-router";

export const authRoutes: readonly RouteRecordRaw[] = [
  {
    path: "/login",
    name: "auth.login",
    component: () => import("@/modules/auth/pages/LoginPage.vue"),
    meta: {
      guest: true,
    },
  },
  {
    path: "/logout",
    name: "auth.logout",
    redirect: () => {
      // TODO: доделать
      return { name: "auth.login" };
    },
  },
];
