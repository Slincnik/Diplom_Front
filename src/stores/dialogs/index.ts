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
  getters: {
    getConversationOrGroup: state => {
      if (!state.currentDialogId) return null;
      return (
        state.conversations.find(({ id }) => id === state.currentDialogId) ||
        state.groups.find(({ id }) => id === state.currentDialogId) ||
        null
      );
    },
  },
  actions: {
    setCurrentDialog(id: number | null) {
      if (!id) {
        this.currentDialogId = null;
        return;
      }

      if (this.currentDialogId === id) return;
      this.currentDialogId = +id;
    },

    async fetchDialogs() {
      const response = await api.get<ApiResponse, Dialogs>("dialogs");
      this.conversations = response.conversations;
      this.conversations.forEach(conversation => conversation.messages.push(conversation.lastMessage));

      this.groups = response.groups;
      this.groups.forEach(group => group.messages.push(group.lastMessage));

      return response;
    },

    addMessageToConversation(conversation_id: number, message: Message) {
      const conversation = this.conversations.find(({ id }) => id === conversation_id);

      if (!conversation) return;

      const newConversation = JSON.parse(JSON.stringify(conversation)) as Conversation;

      newConversation.lastMessage = message;
      newConversation.messages.push(message);

      this.conversations = [newConversation, ...this.conversations];

      this.conversations = orderConversationsOrGroups(this.conversations) as Conversation[];
    },

    addMessageToGroup(group_id: number, message: MessageGroup) {
      const group = this.groups.find(({ id }) => id === group_id);

      if (!group) return;

      const newGroup = JSON.parse(JSON.stringify(group)) as Group;

      newGroup.lastMessage = message;
      newGroup.messages.push(message);

      this.groups = [newGroup, ...this.groups];

      this.groups = orderConversationsOrGroups(this.groups) as Group[];
    },

    addNewConversation(conversation: Conversation) {
      this.conversations.unshift(conversation);
    },

    addNewGroup(group: Group) {
      this.groups.unshift(group);
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
