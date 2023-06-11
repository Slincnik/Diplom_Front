<template>
  <v-virtual-scroll :items="conversations" item-height="40" height="822">
    <template #default="{ item: conversation }: { item: Conversation }">
      <v-list-item
        @click.prevent="clicked(conversation.id)"
        :class="{
          'v-list-item--active': conversation.id == selectedItem,
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
import { ref } from "vue";
import { storeToRefs } from "pinia";
import type { Conversation } from "@/modules/home/types/index.types";
import useUserStore from "@/stores/user";

const userStore = useUserStore();
const { user } = storeToRefs(userStore);

const selectedItem = ref(0);

defineProps<{
  conversations: Conversation[];
}>();

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

  return user.value.id === conversation.user.id ? conversation.user.name : conversation.recipient.name;
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

  return user.value.id === conversation.user.id
    ? conversation.user.name.charAt(0)
    : conversation.recipient.name.charAt(0);
};

const clicked = (id: number) => {
  console.log(id, "По мне кликнули");
  selectedItem.value = id;
};
</script>
