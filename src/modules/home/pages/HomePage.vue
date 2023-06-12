<template>
  <v-row no-gutters class="bg-default fill-height border rounded-lg">
    <v-col sm="2">
      <v-progress-circular
        v-if="isLoading"
        size="large"
        class="mx-auto fill-height d-flex justify-center align-center"
        indeterminate
      />
      <Sidebar v-else />
    </v-col>
    <v-divider vertical />
    <v-col sm="10">
      <HistoryComponent v-if="currentDialogId" :key="currentDialogId" />
      <div v-else class="fill-height d-flex flex-column justify-center align-center">Выберите чат</div>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useQuery } from "@tanstack/vue-query";
import { storeToRefs } from "pinia";
import useDialogsStore from "@/stores/dialogs";

import centra from "@/plugins/centrifuge";

import type { MessagesFromCentrifugo } from "../types/index.types";
// Components
import Sidebar from "../components/Dialogs/SidebarComponent.vue";
import HistoryComponent from "../components/Dialogs/History/HistoryComponent.vue";

const dialogsStore = useDialogsStore();
const router = useRouter();
const route = useRoute();

const { currentDialogId } = storeToRefs(dialogsStore);

const { isLoading } = useQuery({
  queryKey: ["dialogs"],
  queryFn: dialogsStore.fetchDialogs,
});

watch(currentDialogId, newId => {
  router.push({
    query: {
      ...route.query,
      id: newId,
    },
  });
});

const listener = (event: KeyboardEvent) => {
  if (event.code === "Escape") {
    dialogsStore.setCurrentDialog(null);
  }
};

onMounted(() => {
  if (!centra.subs) return;

  centra.subs.on("publication", ({ data }: { data: MessagesFromCentrifugo }) => {
    if (data.type === "NEW_MESSAGE") {
      dialogsStore.addMessageToConversation(data.conversation_id, data.message);
    }

    if (data.type === "NEW_MESSAGE_GROUP") {
      dialogsStore.addMessageToGroup(data.group_id, data.message);
    }

    if (data.type === "ADD_CONVERSATION") {
      dialogsStore.addNewConversation(data.conversation);
    }

    if (data.type === "READ_MESSAGES") {
      dialogsStore.readMessagesInConversation(data.conversation_id, data.user_id, data.timestamp);
    }
  });

  window.addEventListener("keyup", listener);
});

onUnmounted(() => {
  window.removeEventListener("keyup", listener);
});
</script>
