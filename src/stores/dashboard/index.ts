import { defineStore } from "pinia";
import { api, type ApiResponse } from "@/plugins/axios";
import type { AddCard, Board, Card, Column, RemoveCard } from "./types";

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
    async addColumn(title: string) {
      const response = await api.post<ApiResponse, Column>("board/column", {
        title,
      });

      this.board?.columns.push({
        ...response,
        cards: [],
      });
    },
    async removeColumn(columnId: number) {
      this.board?.columns.splice(
        this.board.columns.findIndex(({ id }) => id === columnId),
        1,
      );
      await api.delete(`board/column/${columnId}`);
    },
    async addCard(settings: AddCard) {
      const response = await api.post<ApiResponse, Card>(`board/column/${settings.columnId}/card`, {
        content: settings.content,
        position: settings.position,
      });

      const column = this.board?.columns.find(({ id }) => id === settings.columnId);

      if (!column) return;

      column.cards.push(response);
    },
    async removeCard(settings: RemoveCard) {
      const column = this.board?.columns.find(({ id }) => id === settings.columnId);

      if (!column) return;

      column.cards.splice(
        column.cards.findIndex(({ id }) => id === settings.cardId),
        1,
      );

      await api.delete(`board/column/${settings.columnId}/card/${settings.cardId}`);
    },
    async reorderCards(cards: unknown[]) {
      api.put("board/cards/reorder", {
        columns: cards,
      });
    },
  },
});

export default useDashboardStore;
