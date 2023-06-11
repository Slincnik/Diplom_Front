<template>
  <v-virtual-scroll :items="conversations" item-height="40" height="822">
    <template #default="{ item: conversation }: { item: Conversation }">
      <v-list-item
        @click.prevent="dialogsStore.setCurrentDialog(conversation.id)"
        :class="{
          'v-list-item--active': conversation.id == currentDialogId,
        }"
      >
        <v-list-item-title class="d-flex justify-start"> {{ renderTitle(conversation) }}</v-list-item-title>
        <v-list-item-subtitle class="d-flex justify-start"> {{ renderLastMessage(conversation) }}</v-list-item-subtitle>
        <template v-slot:prepend>
          <v-avatar
            size="large"
            :class="{
              'bg-blue': isFavorite(conversation),
              'bg-brown': !isFavorite(conversation),
            }"
          >
            <span class="text-h5">
              <v-icon v-if="isFavorite(conversation)" icon="mdi-bookmark-outline" />
              <template v-else>
                {{ renderChar(conversation) }}
              </template>
            </span>
          </v-avatar>
        </template>
        <template v-if="!conversation.lastMessage.read_at" v-slot:append>
          <v-badge dot color="blue" />
        </template>
      </v-list-item>
      <v-divider />
    </template>
  </v-virtual-scroll>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import useUserStore from "@/stores/user";
import useDialogsStore from "@/stores/dialogs";

//Types
import type { Conversation } from "@/modules/home/types/index.types";

defineProps<{
  conversations: Conversation[];
}>();

const userStore = useUserStore();
const dialogsStore = useDialogsStore();

const { user } = storeToRefs(userStore);
const { currentDialogId } = storeToRefs(dialogsStore);

const isFavorite = (conversation: Conversation) => {
  if (!user.value) return false;

  if (user.value.id === conversation.user.id && user.value.id === conversation.recipient.id) {
    return true;
  }

  return false;
};

const renderTitle = (conversation: Conversation) => {
  if (!user.value) return "";

  if (isFavorite(conversation)) {
    return "Избранное";
  }

  if (user.value.id === conversation.user.id) {
    return conversation.recipient.fullname;
  } else if (user.value.id === conversation.recipient.id) {
    return conversation.user.fullname;
  }
};

const renderLastMessage = (conversation: Conversation) => {
  if (!user.value) return "";

  const createdConversation = !conversation.lastMessage && !conversation.messages.length;

  if (createdConversation) {
    return `Личный чат создан`;
  } else {
    const isAuthor = conversation.lastMessage.sender.id === user.value.id;
    if (isFavorite(conversation)) {
      return conversation.lastMessage.body;
    }

    return `${isAuthor ? "Вы: " : ``} ${conversation.lastMessage.body}`;
  }
};

const renderChar = (conversation: Conversation) => {
  if (!user.value) return "";

  if (user.value.id === conversation.user.id) {
    return conversation.recipient.fullname.charAt(0);
  } else if (user.value.id === conversation.recipient.id) {
    return conversation.user.fullname.charAt(0);
  }
};
</script>
