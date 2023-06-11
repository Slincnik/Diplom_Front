import { defineStore } from "pinia";
import type { Conversation, Dialogs, Group, Message, MessageGroup } from "@/modules/home/types/index.types";
import { api, type ApiResponse } from "@/plugins/axios";
import { orderConversationsOrGroups } from "@/modules/home/utils/orderConversationsOrGroups";

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
      this.conversations = orderConversationsOrGroups(response.conversations) as Conversation[];
      this.conversations.forEach(conversation => {
        conversation.messages = new Set([conversation.lastMessage]);
      });

      this.groups = orderConversationsOrGroups(response.groups) as Group[];
      this.groups.forEach(group => {
        group.messages = new Set([group.lastMessage]);
      });

      return response;
    },

    addMessageToConversation(conversation_id: number, message: Message) {
      const conversation = this.conversations.find(({ id }) => id === conversation_id);

      if (!conversation) return;

      conversation.lastMessage = message;
      conversation.messages.add(message);

      this.conversations = orderConversationsOrGroups(this.conversations) as Conversation[];
    },

    addMessageToGroup(group_id: number, message: MessageGroup) {
      const group = this.groups.find(({ id }) => id === group_id);

      if (!group) return;

      group.lastMessage = message;
      group.messages.add(message);

      this.groups = orderConversationsOrGroups(this.groups) as Group[];
    },

    addNewConversation(conversation: Conversation) {
      this.conversations.push(conversation);
    },

    readMessagesInConversation(conversation_id: number, user_id: number, timestamp: string) {
      const conversation = this.conversations.find(({ id }) => id === conversation_id);

      if (!conversation) return;

      conversation.messages.forEach(message => {
        if (message.sender.id === user_id) return;

        message.read_at = timestamp;
      });
    },
  },
});

export default useDialogsStore;
