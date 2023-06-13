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
  <div v-if="currentDialog" class="scroll-container mb-2 mt-2" ref="scrollRef">
    <MessagesComponent
      :key="currentDialog?.id"
      :dialog="currentDialog"
      :scrollRef="scrollRef"
      v-model="isEditing"
      v-model:editMessage="messageItem"
    />
  </div>
  <v-responsive class="mx-auto" max-width="790">
    <v-text-field
      flat
      single-line
      hide-details
      v-model="body"
      variant="solo"
      :append-inner-icon="!isEditing ? 'mdi-send' : 'mdi-check'"
      type="text"
      density="comfortable"
      label="Написать сообщение..."
      placeholder="Написать сообщение..."
      @click:append-inner="sendMessage"
      @keyup.enter="sendMessage"
      :loading="isLoadingComputed"
    />
  </v-responsive>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useInfiniteScroll } from "@vueuse/core";

// Stores
import useDialogsStore from "@/stores/dialogs";
import useUserStore from "@/stores/user";

// Components
import MessagesComponent from "./MessagesComponent.vue";

// Utils
import { renderChar, renderTitle, isFavorite, giveRecipientId } from "@/modules/messanger/utils/conversationFunctions";

//Types
import type { Conversation, Message, MessageGroup } from "@/modules/messanger/types/index.types";

const dialogsStore = useDialogsStore();
const userStore = useUserStore();

//Refs
const body = ref("");
const scrollRef = ref<HTMLElement | null>(null);
const isFirstLoading = ref(false);
const isAddLoading = ref(false);
const isEditing = ref(false);
const messageItem = ref<Message | MessageGroup | null>(null);

//Computed
const user = userStore.getUser;
const cursors = computed(() =>
  dialogsStore.cursors.find(({ id, type }) => id === dialogsStore.currentDialogId && type === dialogsStore.tab),
);
const currentDialog = computed(() => dialogsStore.getConversationOrGroup);
const isLoadingComputed = computed(() => {
  if (isFirstLoading.value) return true;

  if (isAddLoading.value) return true;

  if (isLoadingMore.value && !cursors.value?.cursor) return false;

  if (
    isLoadingMore.value &&
    scrollRef.value?.scrollHeight !== scrollRef.value?.clientHeight &&
    scrollRef.value!.scrollTop <= 20
  )
    return true;

  return false;
});
const recipientId = computed(() => {
  if (!currentDialog.value) return 0;

  if (!user) return 0;

  if (dialogsStore.tab === "groups") return 0;

  const conversation = currentDialog.value as Conversation;
  return giveRecipientId(conversation, user);
});

watch(
  () => currentDialog.value,
  newDialog => {
    if (!newDialog) return;
    loadingFirstMessages();
  },
);

watch(
  () => messageItem.value,
  value => {
    if (value) body.value = value.body;
  },
);

const { isLoading: isLoadingMore } = useInfiniteScroll(
  scrollRef,
  () => {
    if (scrollRef.value?.scrollHeight === scrollRef.value?.clientHeight) return;

    if (cursors.value && cursors.value.cursor) {
      dialogsStore.loadingMessages(currentDialog.value!.type, cursors.value);
    }
  },
  { distance: 10, direction: "top", interval: 1000 },
);

const loadingFirstMessages = async () => {
  if (!currentDialog.value) return;

  const isLoadedMessages = currentDialog.value.isLoaded;

  if (!isLoadedMessages) {
    isFirstLoading.value = true;
    await dialogsStore.loadingMessages(currentDialog.value.type);
    isFirstLoading.value = false;
  }
};

const sendMessage = () => {
  if (!body.value) return;

  isAddLoading.value = true;

  if (isEditing.value) {
    if (!messageItem.value) return;

    if (body.value === messageItem.value.body) {
      isEditing.value = false;
      body.value = "";
      isAddLoading.value = false;
      return;
    }

    dialogsStore.editMessage(body.value, messageItem.value.id).then(() => {
      isAddLoading.value = false;
      isEditing.value = false;
    });
    body.value = "";
    return;
  }

  dialogsStore.storeMessage(body.value, recipientId.value).then(() => {
    isAddLoading.value = false;
  });
  body.value = "";
};

onMounted(() => {
  loadingFirstMessages();
});
</script>

<style scoped>
.scroll-container {
  height: 100%;
  max-height: 740px;
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
