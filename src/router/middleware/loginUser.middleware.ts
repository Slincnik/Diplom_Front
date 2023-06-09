import type { RouteLocationNormalized } from "vue-router";
import useUserStore from "@/stores/user";
import centrifugo from "@/plugins/centrifuge";

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

  if (!to.meta.guest && !auth.isAuthenticated) return { name: "auth.login" };

  if (to.meta.guest && auth.isAuthenticated) return { name: "home" };

  return true;
};
