import { createRouter, createWebHistory } from "vue-router";
import { loadLayoutMiddleware } from "./middleware/loadLayout.middleware";
import { loginUserMiddleware } from "./middleware/loginUser.middleware";
import { PAGES } from "./router.types";
import { authRoutes } from "./routes/auth";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: PAGES.HOME,
      component: () => import("@/modules/home/pages/HomePage.vue"),
      meta: {
        title: "Home",
      },
    },

    {
      path: "/messanger",
      name: PAGES.MESSANGER,
      component: () => import("@/modules/messanger/pages/MessangerPage.vue"),
      meta: {
        title: "Мессенджер",
      },
    },
    {
      path: "/dashboard",
      name: PAGES.DASHBOARD,
      component: () => import("@/modules/dashboard/pages/DashboardPage.vue"),
      meta: {
        title: "Канбан доска",
      },
    },

    {
      path: "/:pathMatch(.*)*",
      name: PAGES.NOTFOUND,
      component: () => import("@/components/NotFound.vue"),
      meta: {
        guest: true,
        title: "Not Found Page",
      },
    },

    ...authRoutes,
  ],
});

router.beforeEach(loadLayoutMiddleware);
router.beforeEach(loginUserMiddleware);

export default router;
