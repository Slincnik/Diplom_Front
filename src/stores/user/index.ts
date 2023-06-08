import { defineStore } from "pinia";
import { api, type ApiResponse } from "@/plugins/axios";
import type { IUser, LoginResponse, RegisterResponse, loginParams, registerParams } from "./types";

const useUserStore = defineStore("user", {
  state: () => ({
    user: null as IUser | null,
  }),
  getters: {
    getUser: state => state.user,
    isAuthenticated: state => !!state.user,
  },
  actions: {
    setBearerToken(token: string | null = null) {
      if (token) {
        localStorage.setItem("web_token", token);
      } else {
        this.$reset();
        localStorage.removeItem("web_token");
      }
    },

    async login(responseData: loginParams) {
      const response = await api.post<ApiResponse, LoginResponse>("auth/login", responseData);
      this.setBearerToken(response.access_token);
      return (this.user = response.user);
    },

    async register(responseData: registerParams) {
      const response = await api.post<ApiResponse, RegisterResponse>("auth/register", responseData);
      this.setBearerToken(response.access_token);

      return (this.user = response.user);
    },

    async fetchUserData() {
      const response = await api.get<ApiResponse, IUser>("auth/me");
      console.log(response);

      return (this.user = response);
    },

    async logout() {
      this.setBearerToken();
    },
  },
});

export default useUserStore;
