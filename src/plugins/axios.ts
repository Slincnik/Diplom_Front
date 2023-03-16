import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_AXIOS_URL,
  headers: {
    Accept: "application/json",
  },
});

localStorage.getItem("web_token") &&
  (api.defaults.headers.common["Authorization"] = `Bearer ${localStorage.getItem("web_token")}`);

// перехват запросов
api.interceptors.response.use(
  // обработка успешных запросов
  function (response) {
    // отдача успешного запроса
    return response;
  },

  // Обработка ошибок
  function (error) {
    // Откидываем ошибку
    return Promise.reject(error);
  },
);

export interface ApiResponse {
  success: boolean;
  response?: any;
}
