import { defineStore } from "pinia";
import { api, type ApiResponse } from "@/plugins/axios";
import type { Board } from "./types";

interface State {
  board: Board | null;
}

const useDashboardStore = defineStore("dashboard", {
  state: (): State => {
    return {
      board: null,
    };
  },
  getters: {},
  actions: {
    async getBoard() {
      const response = await api.get<ApiResponse, Board>("board");

      return (this.board = response);
    },
  },
});

export default useDashboardStore;
