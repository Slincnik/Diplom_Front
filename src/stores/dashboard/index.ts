import { defineStore } from "pinia";
import { api, type ApiResponse } from "@/plugins/axios";
import type { AddCard, Board, Card, Column, OrderedCardsInColumns, RemoveCard } from "./types";

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
    async editColumnTitle(columnId: number, newTitle: string) {
      const column = this.board?.columns.find(({ id }) => id === columnId);
      if (!column) return;

      column.title = newTitle;

      await api.post<ApiResponse>(`board/column/${columnId}`, {
        title: newTitle,
      });
    },
    async editCardContent(columnId: number, cardId: number, newContent: string) {
      const column = this.board?.columns.find(({ id }) => id === columnId);

      if (!column) return;

      const card = column.cards.find(({ id }) => id === cardId);

      if (!card) return;

      await api.put<ApiResponse>(`board/column/${columnId}/card/${cardId}`, {
        content: newContent,
      });
      card.updated_at = new Date().toUTCString();
      card.content = newContent;
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
    async reorderCards(orderCards: OrderedCardsInColumns[]) {
      orderCards.forEach(({ cards, id }) => {
        cards.forEach(() => {
          const findedColumn = this.board?.columns.find(column => column.id === id);

          if (!findedColumn) return;

          findedColumn.cards.forEach(card => (card.updated_at = new Date().toUTCString()));
        });
      });
      api.put("board/cards/reorder", {
        columns: orderCards,
      });
    },
  },
});

export default useDashboardStore;
