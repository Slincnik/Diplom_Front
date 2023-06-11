<template>
  <v-row no-gutters class="bg-default fill-height border rounded-lg">
    <v-col sm="2">
      <LoadingSpinner v-if="isLoading" />
      <Sidebar v-else />
    </v-col>
    <v-divider vertical />
    <v-col sm="10"> test </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useQuery } from "@tanstack/vue-query";
import { storeToRefs } from "pinia";
import useDialogsStore from "@/stores/dialogs";
import centra from "@/plugins/centrifuge";
import type { MessagesFromCentrifugo } from "../types/index.types";
// Components
import Sidebar from "../components/Dialogs/SidebarComponent.vue";
import LoadingSpinner from "@/components/PageLoadingSpinner.vue";

const dialogsStore = useDialogsStore();
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { currentDialogId, conversations, groups } = storeToRefs(dialogsStore);

const { isLoading } = useQuery({
  queryKey: ["dialogs"],
  queryFn: dialogsStore.fetchDialogs,
});

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
});
</script>
