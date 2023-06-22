import { defineStore } from "pinia";
import queryString from "query-string";
import useUserStore from "@/stores/user";
import { api, type ApiResponse } from "@/plugins/axios";
import { orderConversationsOrGroups } from "@/modules/messanger/utils/orderConversationsOrGroups";
import { sortMessagesByDate } from "@/utils/sortMessagesByDate";
import type {
  Conversation,
  Dialogs,
  Group,
  Message,
  MessageGroup,
  DialogUser,
} from "@/modules/messanger/types/index.types";
import type { IUser } from "../user/types";

type Cursor = {
  id: number;
  type: "conversations" | "groups";
  cursor: string | null;
};

type editMessageSettings = {
  type: "conversations" | "groups";
  messageId: number;
  dialogId: number;
  newMessage: string;
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
    getOptionalConversation: state => {
      return (conversationId: number) => state.conversations.find(({ id }) => id === conversationId);
    },
    getOptionalGroup: state => {
      return (groupId: number) => state.groups.find(({ id }) => id === groupId);
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
      const { conversations, groups } = await api.get<ApiResponse, Dialogs>("dialogs");
      this.conversations = orderConversationsOrGroups(conversations) as Conversation[];
      this.conversations.forEach(conversation => {
        conversation.lastMessage && conversation.messages.push(conversation.lastMessage);
        conversation.isLoaded = false;
        conversation.type = "conversation";
      });

      this.groups = orderConversationsOrGroups(groups) as Group[];
      this.groups.forEach(group => {
        group.lastMessage && group.messages.push(group.lastMessage);
        group.isLoaded = false;
        group.type = "group";
      });

      return { conversations, groups };
    },

    async createGroup(groupName: string, usersId: number[] = []) {
      await api.post("dialogs/groups", {
        name: groupName,
        users: usersId,
      });
    },

    async loadingMessages(
      type: "conversation" | "group",
      newCursor?: Cursor,
      currentMessages: Message[] | MessageGroup[] = [],
    ) {
      if (type === "conversation") {
        const { messages, cursor } = await this.fetchMessages("conversation", currentMessages, newCursor);

        const conversation = this.conversations.find(({ id }) => id === this.currentDialogId);

        if (!conversation) return;

        const sortedMessages = sortMessagesByDate([...conversation.messages, ...messages]) as Message[];

        conversation.isLoaded = true;

        conversation.messages = sortedMessages;

        this.updateCursor("conversations", cursor);
      }

      if (type === "group") {
        const { messages, cursor } = await this.fetchMessages("group", currentMessages, newCursor);

        const group = this.groups.find(({ id }) => id === this.currentDialogId);

        if (!group) return;

        const sortedMessages = sortMessagesByDate([...group.messages, ...messages]) as Message[];

        group.isLoaded = true;

        group.messages = sortedMessages;

        this.updateCursor("groups", cursor);
      }
    },

    async fetchMessages(
      type: "conversation" | "group",
      currentMessages: Message[] | MessageGroup[],
      newCursor?: Cursor,
    ) {
      const endpoint =
        type === "conversation"
          ? `dialogs/conversation/${this.currentDialogId}/messages`
          : `dialogs/groups/${this.currentDialogId}/messages`;

      const { messages, cursor } = await api.get<
        ApiResponse,
        {
          messages: Message[];
          cursor: string | null;
        }
      >(
        `${endpoint}?${queryString.stringify({
          cursor: newCursor?.cursor,
        })}`,
        {
          params: {
            messages: currentMessages.map(msg => msg["id"]),
          },
        },
      );

      return { messages, cursor };
    },

    async getUsers() {
      const { users } = await api.get<
        ApiResponse,
        {
          users: IUser[];
        }
      >("dialogs/users");

      return users;
    },

    async storeMessage(body: string, tab: "conversation" | "group", userId?: number, reference_id?: number) {
      const endpoint =
        tab === "conversation" ? `dialogs/conversation/${userId}` : `dialogs/groups/${this.currentDialogId}`;

      await api.post<ApiResponse>(endpoint, {
        body,
        reference_id,
      });
    },

    async deleteMessage(messageId: number) {
      this.deleteMessageInDialog(messageId);

      const endpoint =
        this.tab === "conversations"
          ? `dialogs/conversation/${this.currentDialogId}/messages`
          : `dialogs/groups/${this.currentDialogId}/messages`;

      await api.delete(endpoint, {
        data: {
          messages: [messageId],
        },
      });
    },

    async editMessage(newMessage: string, messageId: number) {
      this.editMessageInDialog({ type: this.tab, messageId, dialogId: this.currentDialogId!, newMessage });

      const endpoint =
        this.tab === "conversations"
          ? `dialogs/conversation/${this.currentDialogId}/messages/${messageId}`
          : `dialogs/groups/${this.currentDialogId}/messages/${messageId}`;

      await api.put(endpoint, {
        message: newMessage,
      });
    },

    async inviteMembersToGroup(group_id: number, users: number[]) {
      await api.post(`dialogs/groups/${group_id}/invite`, {
        users,
      });
    },

    async leaveFromGroup(group_id: number) {
      const userStore = useUserStore();
      const user = userStore.getUser!;

      this.deleteMemberFromGroup(group_id, user.id);
      this.deleteGroupFromList(group_id);

      await api.post(`dialogs/groups/${group_id}/leave`);
    },

    addMessageToConversation(conversation_id: number, message: Message) {
      const conversation = this.conversations.find(({ id }) => id === conversation_id);

      if (!conversation) return;

      conversation.lastMessage = message;
      conversation.messages.push(message);

      this.conversations = orderConversationsOrGroups([...this.conversations]) as Conversation[];
    },

    addMessageToGroup(group_id: number, message: MessageGroup) {
      const group = this.groups.find(({ id }) => id === group_id);

      if (!group) return;

      group.lastMessage = message;
      group.messages.push(message);

      this.groups = orderConversationsOrGroups([...this.groups]) as Group[];
    },

    addNewConversation(conversation: Conversation) {
      conversation.isLoaded = true;
      conversation.messages.push(conversation.lastMessage!);
      conversation.type = "conversation";
      this.conversations.unshift(conversation);
    },

    addNewGroup(group: Group, isLoaded: boolean = true) {
      group.isLoaded = isLoaded;
      if (group.lastMessage) {
        group.messages.push(group.lastMessage);
      }
      group.type = "group";
      this.groups.unshift(group);
    },

    addNewMembersToGroup(group_id: number, users: DialogUser[]) {
      const findGroup = this.groups.find(({ id }) => id === group_id);

      if (!findGroup) return;

      findGroup.members.push(...users);
    },

    deleteMemberFromGroup(group_id: number, user_id: number) {
      const findGroup = this.groups.find(({ id }) => id === group_id);

      if (!findGroup) return;

      findGroup.members.splice(
        findGroup.members.findIndex(({ id }) => id === user_id),
        1,
      );
    },

    deleteGroupFromList(group_id: number) {
      const findGroup = this.groups.find(({ id }) => id === group_id);

      if (!findGroup) return;

      this.groups.splice(
        this.groups.findIndex(({ id }) => id === findGroup.id),
        1,
      );
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

      if (dialog.lastMessage && message.id === dialog.lastMessage.id) {
        dialog.lastMessage = dialog.messages.at(-1) as Message | MessageGroup;
      }

      this.conversations = orderConversationsOrGroups(this.conversations) as Conversation[];
      this.groups = orderConversationsOrGroups(this.groups) as Group[];
    },

    editMessageInDialog(settings: editMessageSettings) {
      if (settings.type === "conversations") {
        const conversation = this.conversations.find(({ id }) => id === settings.dialogId);

        if (!conversation) return;

        const message = conversation.messages.find(({ id }) => id === settings.messageId);

        if (!message) return;

        message.body = settings.newMessage;
        message.updated_at = new Date().toUTCString();
      } else if (settings.type === "groups") {
        const group = this.groups.find(({ id }) => id === settings.dialogId);

        if (!group) return;

        const message = group.messages.find(({ id }) => id === settings.messageId);

        if (!message) return;

        message.body = settings.newMessage;
        message.updated_at = new Date().toUTCString();
      }
    },

    updateCursor(type: "conversations" | "groups", cursor: string | null) {
      const hadCursor = this.cursors.find(item => item.id === this.currentDialogId && item.type === type);

      if (hadCursor) {
        hadCursor.cursor = cursor;
        return;
      }

      this.cursors.push({
        id: this.currentDialogId!,
        type: "conversations",
        cursor,
      });
    },
  },
});

export default useDialogsStore;
