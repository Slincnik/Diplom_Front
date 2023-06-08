import type { RouteRecordRaw } from "vue-router";
import useUserStore from "@/stores/user";

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
    path: "/register",
    name: "auth.register",
    component: () => import("@/modules/auth/pages/RegisterPage.vue"),
    meta: {
      guest: true,
    },
  },
  {
    path: "/logout",
    name: "auth.logout",
    redirect: () => {
      const userStore = useUserStore();
      userStore.logout();
      return { name: "auth.login" };
    },
  },
];
