import { api, type ApiResponse } from "@/plugins/axios";
import { defineStore } from "pinia";
import type { IUser } from "./types";

const useUserStore = defineStore("user", {
  state: () => ({
    user: null as IUser | null,
  }),
  getters: {
    getUser: state => state.user,
    isLoggedIn: state => !!state.user,
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

    async login() {},
    async register() {},
    async fetchUserData() {
      const response = await api.get<ApiResponse, IUser>("auth/me");
      return (this.user = response);
    },
  },
});

export default useUserStore;
