import { defineStore } from "pinia";
import type { Conversation, Dialogs, Group } from "@/modules/home/types/index.types";
import { api, type ApiResponse } from "@/plugins/axios";

interface State {
  currentDialogId: null | number;
  conversations: Conversation[];
  groups: Group[];
}

const useDialogsStore = defineStore("dialogs", {
  state: (): State => {
    return {
      currentDialogId: null,
      conversations: [],
      groups: [],
    };
  },
  actions: {
    setCurrentDialog(id: number) {
      this.currentDialogId = +id;
    },

    async fetchDialogs() {
      const response = await api.get<ApiResponse, Dialogs>("dialogs");
      this.conversations = response.conversations;
      this.groups = response.groups;
    },
  },
});

export default useDialogsStore;
