import { AppLayoutsEnum, AppLayoutToFileMap } from "@/layouts/layouts.types";
import type { RouteLocationNormalized } from "vue-router";

export const loadLayoutMiddleware = async (route: RouteLocationNormalized): Promise<void> => {
  const { layout } = route.meta;
  const normalizedLayoutName = layout || AppLayoutsEnum.default;
  const fileName = AppLayoutToFileMap[normalizedLayoutName];
  const fileNameWithoutExtension = fileName.split(".vue")[0];

  const component = await import(`../../layouts/${fileNameWithoutExtension}.vue`);
  route.meta.layoutComponent = component.default;
};
