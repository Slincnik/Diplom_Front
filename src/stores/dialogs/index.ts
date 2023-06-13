import { defineStore } from "pinia";
import type { Conversation, Dialogs, Group, Message, MessageGroup } from "@/modules/home/types/index.types";
import { api, type ApiResponse } from "@/plugins/axios";
import { orderConversationsOrGroups } from "@/modules/home/utils/orderConversationsOrGroups";
import queryString from "query-string";

type Cursor = {
  id: number;
  type: "conversations" | "groups";
  cursor: string | null;
};
interface State {
  currentDialogId: null | number;
  conversations: Conversation[];
  groups: Group[];
  cursors: Cursor[];
  tab: "conversations" | "groups";
}

const useDialogsStore = defineStore("dialogs", {
  state: (): State => {
    return {
      currentDialogId: null,
      conversations: [],
      groups: [],
      cursors: [],
      tab: "conversations",
    };
  },
  getters: {
    getConversationOrGroup: state => {
      if (!state.currentDialogId) return null;
      if (state.tab === "conversations")
        return state.conversations.find(({ id }) => id === state.currentDialogId) as Conversation;
      else if (state.tab === "groups") return state.groups.find(({ id }) => id === state.currentDialogId) as Group;
      else return null;
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
      this.conversations.forEach(conversation => {
        conversation.messages.push(conversation.lastMessage);
        conversation.isLoaded = false;
        conversation.type = "conversation";
      });

      this.groups = response.groups;
      this.groups.forEach(group => {
        group.messages.push(group.lastMessage);
        group.isLoaded = false;
        group.type = "group";
      });

      return response;
    },

    async loadingMessages(type: "conversation" | "group", newCursor?: Cursor) {
      if (type === "conversation") {
        const { messages, cursor } = await api.get<
          ApiResponse,
          {
            messages: Message[];
            cursor: string | null;
          }
        >(
          `dialogs/conversation/${this.currentDialogId}/messages?${queryString.stringify({
            cursor: newCursor?.cursor,
          })}`,
        );

        const conversation = this.conversations.find(({ id }) => id === this.currentDialogId);

        if (!conversation) return;

        conversation.isLoaded = true;

        conversation.messages.unshift(...messages);

        const hadCursor = this.cursors.find(({ id, type }) => id === this.currentDialogId && type === "conversations");

        if (hadCursor) {
          hadCursor.cursor = cursor;
          return;
        }

        this.cursors.push({
          id: this.currentDialogId!,
          type: "conversations",
          cursor,
        });
      }

      if (type === "group") {
        const { messages, cursor } = await api.get<
          ApiResponse,
          {
            messages: Message[];
            cursor: string | null;
          }
        >(
          `dialogs/groups/${this.currentDialogId}/messages?${queryString.stringify({
            cursor: newCursor?.cursor,
          })}`,
        );

        const group = this.groups.find(({ id }) => id === this.currentDialogId);

        if (!group) return;

        group.messages.unshift(...messages);

        group.isLoaded = true;

        const hadCursor = this.cursors.find(({ id, type }) => id === this.currentDialogId && type === "groups");

        if (hadCursor) {
          hadCursor.cursor = cursor;
          return;
        }

        this.cursors.push({
          id: this.currentDialogId!,
          type: "groups",
          cursor,
        });
      }
    },

    async deleteMessage(messageId: number) {
      this.deleteMessageInDialog(messageId);
      await api.delete(`dialogs/conversation/${this.currentDialogId}/messages`, {
        data: {
          messages: [messageId],
        },
      });
    },

    addMessageToConversation(conversation_id: number, message: Message) {
      const conversation = this.conversations.find(({ id }) => id === conversation_id);

      if (!conversation) return;

      conversation.lastMessage = message;
      conversation.messages.push(message);

      this.conversations = orderConversationsOrGroups(this.conversations) as Conversation[];
    },

    addMessageToGroup(group_id: number, message: MessageGroup) {
      const group = this.groups.find(({ id }) => id === group_id);

      if (!group) return;

      group.lastMessage = message;
      group.messages.push(message);

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

    deleteMessageInDialog(messageId: number) {
      const dialog = this.getConversationOrGroup;

      if (!dialog) return;

      const message = dialog.messages.find(({ id }) => id === messageId);

      if (!message) return;

      dialog.messages.splice(
        dialog.messages.findIndex(({ id }) => id === messageId),
        1,
      );

      if (message.id === dialog.lastMessage.id) {
        dialog.lastMessage = dialog.messages.at(-1) as Message | MessageGroup;
      }
    },
  },
});

export default useDialogsStore;
