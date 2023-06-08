import axios, { AxiosError } from "axios";
import { useToast } from "vue-toastification";
import router from "@/router";
import type { ServerError } from "./axios.types";

export const api = axios.create({
  baseURL: import.meta.env.VITE_AXIOS_URL,
  headers: {
    Accept: "application/json",
  },
  withCredentials: true,
});

localStorage.getItem("web_token") &&
  (api.defaults.headers.common["Authorization"] = `Bearer ${localStorage.getItem("web_token")}`);

const toast = useToast();

// перехват запросов
api.interceptors.response.use(
  // обработка успешных запросов
  function (response) {
    // отдача успешного запроса
    return response.data.response;
  },

  // Обработка ошибок
  function (axiosError: AxiosError) {
    const data = axiosError.response?.data as ServerError;

    switch (axiosError?.response?.status) {
      case 401:
        router.push({ name: "auth.logout" });
        break;

      case 403:
        toast.warning("Попробуйте позже");
        break;

      case 422:
        for (const key in data.errors) toast.error(data.errors[key][0]);
        break;

      case 400:
        toast.error(data.error.error || "Некорректный запрос");
        break;

      default:
        toast.error("Произошла ошибка. Попробуйте позже");
        break;
    }
    // Откидываем ошибку
    return Promise.reject(data);
  },
);

export interface ApiResponse {
  success: boolean;
  response?: any;
}
