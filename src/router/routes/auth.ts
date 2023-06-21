import type { RouteRecordRaw } from "vue-router";
import useUserStore from "@/stores/user";
import { PAGES } from "../router.types";

export const authRoutes: readonly RouteRecordRaw[] = [
  {
    path: "/login",
    name: PAGES.LOGIN,
    component: () => import("@/modules/auth/pages/LoginPage.vue"),
    meta: {
      title: "Авторизация",
      guest: true,
    },
  },
  {
    path: "/register",
    name: PAGES.REGISTRATION,
    component: () => import("@/modules/auth/pages/RegisterPage.vue"),
    meta: {
      title: "Регистрация",
      guest: true,
    },
  },
  {
    path: "/logout",
    name: PAGES.LOGOUT,
    redirect: () => {
      const userStore = useUserStore();
      userStore.logout();
      return { name: PAGES.LOGIN };
    },
  },
];
