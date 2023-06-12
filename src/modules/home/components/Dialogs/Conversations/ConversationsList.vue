<template>
  <div class="overflow-y-auto" style="height: 820px">
    <template v-for="conversation in conversations" :key="conversation.id">
      <v-list-item
        @click.stop="dialogsStore.setCurrentDialog(conversation.id)"
        :class="{
          'v-list-item--active': conversation.id == currentDialogId,
        }"
      >
        <v-list-item-title class="d-flex justify-start text-truncate">
          {{ renderTitle(conversation, user) }}</v-list-item-title
        >
        <v-list-item-subtitle class="d-flex justify-start text-truncate">
          {{ renderLastMessage(conversation) }}</v-list-item-subtitle
        >
        <template v-slot:prepend>
          <v-avatar
            size="large"
            :class="{
              'bg-blue': isFavorite(conversation, user),
              'bg-brown': !isFavorite(conversation, user),
            }"
          >
            <span class="text-h5">
              <v-icon v-if="isFavorite(conversation, user)" icon="mdi-bookmark-outline" />
              <template v-else>
                {{ renderChar(conversation, user) }}
              </template>
            </span>
          </v-avatar>
        </template>
        <!-- <template v-if="!conversation.lastMessage.read_at" v-slot:append>
          <v-badge dot color="blue" />
        </template> -->
      </v-list-item>
    </template>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import useUserStore from "@/stores/user";
import useDialogsStore from "@/stores/dialogs";

//Types
import type { Conversation } from "@/modules/home/types/index.types";
import { isFavorite, renderTitle, renderChar } from "@/modules/home/utils/conversationFunctions";

const userStore = useUserStore();
const dialogsStore = useDialogsStore();

const { user } = storeToRefs(userStore);
const { currentDialogId, conversations } = storeToRefs(dialogsStore);

const renderLastMessage = (conversation: Conversation) => {
  if (!user.value) return "";

  const createdConversation = !conversation.lastMessage && !conversation.messages.length;

  if (createdConversation) {
    return `Личный чат создан`;
  } else {
    const isAuthor = conversation.lastMessage.sender.id === user.value.id;
    if (isFavorite(conversation, user.value)) {
      return conversation.lastMessage.body;
    }

    return `${isAuthor ? "Вы: " : ``} ${conversation.lastMessage.body}`;
  }
};
</script>
