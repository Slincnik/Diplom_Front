import type { RouteLocationNormalized } from "vue-router";
import useUserStore from "@/stores/user";
import centrifugo from "@/plugins/centrifuge";
import { PAGES } from "../router.types";

export const loginUserMiddleware = async (to: RouteLocationNormalized) => {
  const auth = useUserStore();

  if (!auth.isAuthenticated) {
    const token: string | null = localStorage.getItem("web_token");

    if (token) {
      auth.setBearerToken(token);
      await auth.fetchUserData();
    }
  }

  if (!centrifugo.isLoaded && auth.isAuthenticated) {
    if (!auth.user) return;
    centrifugo.connect(auth.user.id);
  }

  if (!to.meta.guest && !auth.isAuthenticated) return { name: PAGES.LOGIN };

  if (to.meta.guest && auth.isAuthenticated) return { name: PAGES.HOME };

  return true;
};
