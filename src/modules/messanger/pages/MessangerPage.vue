<template>
  <v-row no-gutters class="bg-default fill-height border rounded-lg overflow-y-auto">
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
      <HistoryComponent v-if="currentDialog" />
      <div v-else class="fill-height d-flex flex-column justify-center align-center">Выберите чат</div>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, watch } from "vue";
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

const { currentDialogId, tab } = storeToRefs(dialogsStore);

const currentDialog = computed(() => dialogsStore.getConversationOrGroup);

const { isLoading } = useQuery({
  queryKey: ["dialogs"],
  queryFn: dialogsStore.fetchDialogs,
});

watch([currentDialogId, tab], ([newId, newTab]) => {
  router.push({
    query: {
      tab: newTab,
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

  if (route.query.id) {
    dialogsStore.setCurrentDialog(+route.query.id);
  }

  if (route.query.tab) {
    tab.value = route.query.tab as "conversations" | "groups";
  }

  centra.subs.on("publication", ({ data }: { data: MessagesFromCentrifugo }) => {
    switch (data.type) {
      case "NEW_MESSAGE":
        dialogsStore.addMessageToConversation(data.conversation_id, data.message);
        break;

      case "NEW_MESSAGE_GROUP":
        dialogsStore.addMessageToGroup(data.group_id, data.message);
        break;

      case "ADD_CONVERSATION":
        dialogsStore.addNewConversation(data.conversation);
        break;

      case "READ_MESSAGES":
        dialogsStore.readMessagesInConversation(data.conversation_id, data.user_id, data.timestamp);
        break;

      case "DELETE_MESSAGES":
        dialogsStore.deleteMessageInDialog(data.messages[0]);
        break;

      case "DELETE_MESSAGE_GROUP":
        dialogsStore.deleteMessageInDialog(data.messages[0]);
        break;

      case "EDIT_MESSAGE":
        dialogsStore.editMessageInDialog(data.message.body, data.message.id);
        break;

      default:
        break;
    }
  });

  window.addEventListener("keyup", listener);
});

onUnmounted(() => {
  window.removeEventListener("keyup", listener);
});
</script>
