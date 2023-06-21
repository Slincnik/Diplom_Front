<template>
  <v-row no-gutters class="fill-height">
    <v-col
      key="sidebar"
      sm="5"
      md="3"
      lg="3"
      xl="2"
      xxl="1"
      class="fill-height flex-sm-fill"
      :class="{
        'hidden-sm-and-down': currentDialogId,
      }"
    >
      <v-progress-circular
        v-if="isLoading"
        size="large"
        class="mx-auto fill-height d-flex justify-center align-center"
        indeterminate
      />
      <Sidebar v-else />
    </v-col>
    <v-divider key="center" vertical />
    <v-col
      key="history"
      :sm="currentDialogId ? '12' : '7'"
      md="9"
      xl="10"
      xxl="11"
      :class="{
        'd-none d-sm-block': !currentDialogId,
      }"
    >
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
import useDialogsStore from "@/stores/dialogs";
import useUserStore from "@/stores/user";

import centra from "@/plugins/centrifuge";
import newMessageSound from "@/assets/sounds/newMessage.mp3";

// Components & Types
import Sidebar from "../components/Dialogs/SidebarComponent.vue";
import HistoryComponent from "../components/Dialogs/History/HistoryComponent.vue";
import { isFavorite, renderTitle } from "../utils/conversationFunctions";
import type { Conversation, Group, MessagesFromCentrifugo } from "../types/index.types";
import type { ToastContent } from "vue-toastification/dist/types/types";
import type { BufferSource } from "stream/web";

const dialogsStore = useDialogsStore();
const userStore = useUserStore();
const router = useRouter();
const route = useRoute();
const toast = useToast();
const { play } = useSound(newMessageSound, {
  volume: 0.3,
});

const { isLoading } = useQuery({
  queryKey: ["dialogs"],
  queryFn: dialogsStore.fetchDialogs,
});

const { currentDialogId, tab } = storeToRefs(dialogsStore);

const user = computed(() => userStore.getUser);

const currentDialog = computed(() => dialogsStore.getConversationOrGroup);

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

onMounted(async () => {
  if (!centra.channelSubscription) return;

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

  const sendSoundAndToastNotify = (dialog: Conversation | Group, data: ToastContent) => {
    play();

    if (dialog.type === "conversation") {
      toast.info(data, {
        position: POSITION.TOP_RIGHT,
        timeout: 10000,
        pauseOnFocusLoss: true,
      });
      return;
    }

    if (dialog.type === "group") {
      toast.info(data, {
        position: POSITION.TOP_RIGHT,
        timeout: 10000,
        pauseOnFocusLoss: true,
      });
      return;
    }
  };

  centra.channelSubscription.on("publication", ({ data }: { data: BufferSource }) => {
    const decodeData = JSON.parse(new TextDecoder("utf-8").decode(data)) as MessagesFromCentrifugo;
    switch (decodeData.type) {
      case "NEW_MESSAGE":
        dialogsStore.addMessageToConversation(decodeData.conversation_id, decodeData.message);
        if (currentDialogId.value !== decodeData.conversation_id) {
          const conversation = dialogsStore.getOptionalConversation(decodeData.conversation_id);

          if (!conversation) return;

          const isFavoriteValue = isFavorite(conversation, user.value);

          if (isFavoriteValue) return;

          const title = renderTitle(conversation, user.value);

          sendSoundAndToastNotify(conversation, `${title}: ${truncateText(decodeData.message.body, 7)}`);
        }
        break;

      case "NEW_MESSAGE_GROUP":
        dialogsStore.addMessageToGroup(decodeData.group_id, decodeData.message);
        if (currentDialogId.value !== decodeData.group_id) {
          const group = dialogsStore.getOptionalGroup(decodeData.group_id);

          if (!group) return;

          sendSoundAndToastNotify(
            group,
            `${group.name.substring(0, 4)}_${decodeData.message.sender.name}: ${truncateText(
              decodeData.message.body,
              5,
            )}`,
          );
        }
        break;

      case "ADD_CONVERSATION":
        dialogsStore.addNewConversation(decodeData.conversation);

        if (isFavorite(decodeData.conversation, user.value)) return;

        if (decodeData.conversation.lastMessage?.sender.id === user.value?.id) return;

        sendSoundAndToastNotify(
          decodeData.conversation,
          `${renderTitle(decodeData.conversation, user.value)}: ${truncateText(
            decodeData.conversation.lastMessage?.body || "",
            7,
          )}`,
        );
        break;

      case "ADD_GROUP":
        dialogsStore.addNewGroup(decodeData.group);
        sendSoundAndToastNotify(decodeData.group, `Вы были добавлены в группу: ${decodeData.group.name}`);
        break;

      case "READ_MESSAGES":
        dialogsStore.readMessagesInConversation(decodeData.conversation_id, decodeData.user_id, decodeData.timestamp);
        break;

      case "DELETE_MESSAGES":
        dialogsStore.deleteMessageInDialog(decodeData.messages[0]);
        break;

      case "DELETE_MESSAGE_GROUP":
        dialogsStore.deleteMessageInDialog(decodeData.messages[0]);
        break;

      case "EDIT_MESSAGE":
        dialogsStore.editMessageInDialog({
          type: "conversations",
          newMessage: decodeData.message.body,
          dialogId: decodeData.conversation_id,
          messageId: decodeData.message.id,
        });
        break;

      case "EDIT_MESSAGE_GROUP":
        dialogsStore.editMessageInDialog({
          type: "groups",
          newMessage: decodeData.message.body,
          dialogId: decodeData.group_id,
          messageId: decodeData.message.id,
        });
        break;

      case "ADDED_TO_GROUP":
        dialogsStore.addNewMembersToGroup(decodeData.group.id, decodeData.users);

        if (decodeData.users.find(({ id }) => id !== user.value?.id)) return;

        dialogsStore.addNewGroup(decodeData.group, false);

        sendSoundAndToastNotify(decodeData.group, `Вы были добавлены в группу ${decodeData.group.name}`);
        break;

      case "DELETE_FROM_GROUP":
        dialogsStore.deleteMemberFromGroup(decodeData.group_id, decodeData.user);
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
