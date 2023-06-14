<template>
  <v-row no-gutters class="bg-default fill-height elevation-5 border rounded-lg overflow-y-auto">
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
import { POSITION, useToast } from "vue-toastification";
import { storeToRefs } from "pinia";
import { useSound } from "@vueuse/sound";

import newMessageSound from "@/assets/sounds/newMessage.mp3";

import useDialogsStore from "@/stores/dialogs";
import useUserStore from "@/stores/user";

import centra from "@/plugins/centrifuge";

import type { MessagesFromCentrifugo } from "../types/index.types";
// Components
import Sidebar from "../components/Dialogs/SidebarComponent.vue";
import HistoryComponent from "../components/Dialogs/History/HistoryComponent.vue";
import { isFavorite, renderTitle } from "../utils/conversationFunctions";

const dialogsStore = useDialogsStore();
const userStore = useUserStore();
const router = useRouter();
const route = useRoute();
const toast = useToast();
const { play } = useSound(newMessageSound, {
  volume: 0.3,
});

const user = computed(() => userStore.getUser);

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

  const truncateText = (body: string, num: number) => {
    if (body.length > num) {
      return body.substring(0, num) + "...";
    } else {
      return body;
    }
  };

  centra.subs.on("publication", ({ data }: { data: MessagesFromCentrifugo }) => {
    switch (data.type) {
      case "NEW_MESSAGE":
        dialogsStore.addMessageToConversation(data.conversation_id, data.message);
        if (currentDialogId.value !== data.conversation_id) {
          const conversation = dialogsStore.getOptionalConversation(data.conversation_id);

          if (!conversation) return;

          const isFavoriteValue = isFavorite(conversation, user.value);

          if (isFavoriteValue) return;

          play();
          const title = renderTitle(conversation, user.value);
          toast.info(`${title}: ${truncateText(data.message.body, 7)}`, {
            position: POSITION.TOP_RIGHT,
            timeout: 10000,
            pauseOnFocusLoss: true,
          });
        }
        break;

      case "NEW_MESSAGE_GROUP":
        dialogsStore.addMessageToGroup(data.group_id, data.message);
        if (currentDialogId.value !== data.group_id) {
          const group = dialogsStore.getOptionalGroup(data.group_id);

          if (!group) return;

          toast.info(
            `${group.name.substring(0, 4)}_${data.message.sender.name}: ${truncateText(data.message.body, 5)}`,
            {
              position: POSITION.TOP_RIGHT,
              timeout: 10000,
              pauseOnFocusLoss: true,
            },
          );
          play();
        }
        break;

      case "ADD_CONVERSATION":
        dialogsStore.addNewConversation(data.conversation);

        if (isFavorite(data.conversation, user.value)) return;

        toast.info(
          `${renderTitle(data.conversation, user.value)}: ${truncateText(
            data.conversation.lastMessage?.body || "",
            7,
          )}`,
          {
            position: POSITION.TOP_RIGHT,
            timeout: 10000,
            pauseOnFocusLoss: true,
          },
        );
        play();
        break;

      case "ADD_GROUP":
        dialogsStore.addNewGroup(data.group);
        toast.info(`Вы были добавлены в группу: ${data.group.name}`, {
          position: POSITION.TOP_RIGHT,
          timeout: 10000,
          pauseOnFocusLoss: true,
        });
        play();
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
        dialogsStore.editMessageInDialog({
          type: "conversations",
          newMessage: data.message.body,
          dialogId: data.conversation_id,
          messageId: data.message.id,
        });
        break;

      case "EDIT_MESSAGE_GROUP":
        dialogsStore.editMessageInDialog({
          type: "groups",
          newMessage: data.message.body,
          dialogId: data.group_id,
          messageId: data.message.id,
        });
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
