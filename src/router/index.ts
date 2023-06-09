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
      component: () => import("@/modules/first/pages/TestPage.vue"),
    },
    {
      path: "/:pathMatch(.*)*",
      name: PAGES.NOTFOUND,
      component: () => import("@/components/NotFound.vue"),
    },

    ...authRoutes,
  ],
});

router.beforeEach(loadLayoutMiddleware);
router.beforeEach(loginUserMiddleware);

export default router;
