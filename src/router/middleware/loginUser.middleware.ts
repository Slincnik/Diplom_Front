import type { RouteLocationNormalized } from "vue-router";
import useUserStore from "@/modules/auth/stores/user";

export const loginUserMiddleware = async (to: RouteLocationNormalized) => {
  const auth = useUserStore();

  if (!auth.isLoggedIn) {
    const token: string | null = localStorage.getItem("web_token");

    if (token) {
      auth.setBearerToken(token);
      await auth.fetchUserData();
    }
  }

  if (!to.meta.guest && !auth.isLoggedIn) return { name: "auth.login" };

  return true;
};
