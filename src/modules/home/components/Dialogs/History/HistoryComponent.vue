<template>
  <v-card>
    <v-toolbar dark prominent density="compact" class="bg-transparent">
      <v-toolbar-title class="d-flex">
        {{ currentDialog?.type === "conversation" ? renderTitle(currentDialog!, user) : currentDialog?.name }}
      </v-toolbar-title>
      <template v-slot:prepend>
        <v-avatar
          size="40"
          elevation="10"
          :class="{
            'bg-blue': currentDialog?.type === 'conversation' ? isFavorite(currentDialog!, user) : false,
            'bg-brown': currentDialog?.type === 'conversation' ? !isFavorite(currentDialog!, user) : true,
          }"
        >
          <span class="text-h5">
            <v-icon
              v-if="currentDialog?.type === 'conversation' ? isFavorite(currentDialog as Conversation, user) : false"
              icon="mdi-bookmark-outline"
            />
            <template v-else>
              {{
                currentDialog?.type === "conversation"
                  ? renderChar(currentDialog!, user)
                  : currentDialog?.name.charAt(0)
              }}
            </template>
          </span>
        </v-avatar>
      </template>
    </v-toolbar>
  </v-card>
  <div class="scroll-container mb-2 mt-2 d-flex flex-column justify-end align-center">
    <!-- <v-progress-circular v-if="isLoading" size="large" class="mx-auto justify-center align-center" indeterminate /> -->
    <MessagesComponent ref="el" :messages="currentDialog!.messages" />
  </div>
  <v-responsive class="mx-auto" max-width="790">
    <v-text-field
      flat
      single-line
      hide-details
      v-model="body"
      append-inner-icon="mdi-send"
      variant="solo"
      type="text"
      density="comfortable"
      label="Написать сообщение..."
      placeholder="Написать сообщение..."
      @click:append-inner="sendMessage"
      @keyup.enter="sendMessage"
    />
  </v-responsive>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUpdated } from "vue";
import { useQuery } from "@tanstack/vue-query";
import useDialogsStore from "@/stores/dialogs";
import useUserStore from "@/stores/user";

import { renderChar, renderTitle, isFavorite } from "@/modules/home/utils/conversationFunctions";

import MessagesComponent from "./MessagesComponent.vue";
import type { Conversation } from "@/modules/home/types/index.types";

const dialogsStore = useDialogsStore();
const userStore = useUserStore();

const user = userStore.getUser;
const currentDialog = computed(() => dialogsStore.getConversationOrGroup!(dialogsStore.tab));

const body = ref("");
const el = ref<HTMLElement | null>(null);

const { refetch, isLoading, isRefetching } = useQuery({
  queryKey: ["messages", currentDialog.value?.id],
  queryFn: () => dialogsStore.loadingMessages(currentDialog.value!.type),
  enabled: false,
});

const loadingFirstMessages = () => {
  if (!currentDialog.value) return;

  const isLoadedMessages = currentDialog.value.isLoaded;

  if (!isLoadedMessages) {
    dialogsStore.loadingMessages(currentDialog.value.type);
  }
};

onMounted(() => {
  loadingFirstMessages();
});

onUpdated(() => {
  loadingFirstMessages();
});

const sendMessage = () => {
  console.log("sending message");
};
</script>

<style scoped>
.scroll-container {
  height: 740px;
  overflow-y: auto;
}
* {
  scrollbar-width: none;
  scrollbar-color: #3b3a3b;
}

/* Chrome, Edge, and Safari */
*::-webkit-scrollbar {
  width: 9px;
}

*::-webkit-scrollbar-track {
  background: transparent;
}

*::-webkit-scrollbar-thumb {
  background-color: #3b3a3b;
  border-radius: 24px;
  border: 2px solid transparent;
}
</style>
