<template>
  <div class="d-flex flex-column fill-height">
    <v-toolbar dark prominent density="compact" class="toolbar elevation-2">
      <v-toolbar-title class="d-flex">
        {{ currentDialog?.type === "conversation" ? renderTitle(currentDialog!, user) : currentDialog?.name }}
      </v-toolbar-title>
      <template v-slot:prepend>
        <v-btn
          @click.prevent="dialogsStore.setCurrentDialog(null)"
          icon="mdi-keyboard-backspace"
          class="mr-2 d-block d-sm-block d-md-none"
        />
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
      <template #append>
        <template v-if="currentDialog?.type === 'group'">
          <span class="mr-2">Участники: </span>
          <v-btn
            class="mr-n2"
            variant="outlined"
            color="blue"
            max-width="35"
            max-height="35"
            icon="mdi-plus"
            @click.prevent="isAddNewMember = true"
          />
          <v-avatar color="brown" class="mr-2" size="35" elevation="10">
            <span class="text-h5">{{ currentDialog.members[0].name.charAt(0) }}</span>
          </v-avatar>
        </template>
      </template>
    </v-toolbar>
    <div class="center">
      <div class="scroll-container d-flex flex-column align-center">
        <div key="scroll-container" class="fill-height w-100 mt-2 mb-2 overflow-y-auto" ref="scrollRef">
          <MessagesComponent
            v-if="currentDialog"
            :key="currentDialog?.id"
            :dialog="currentDialog"
            :scrollRef="scrollRef"
            @editMessage="editMessage"
            @reply-message="replyMessage"
          />
        </div>
        <v-responsive class="mx-auto mb-4 elevation-4" width="560px">
          <v-slide-y-reverse-transition group>
            <v-list-item
              v-if="isReply"
              key="replyField"
              append-icon="mdi-close"
              class="replyItem"
              :class="{
                'rounded-lg border': !isReply,
                'rounded-t-xl': isReply,
              }"
            >
              <template #prepend>
                <v-icon icon="mdi-reply-outline" class="replyIconMargin" />
                <v-divider vertical class="border-opacity-50 mr-2" />
              </template>
              <v-list-item-title class="text-wrap text-white">
                {{ messageItem?.body }}
              </v-list-item-title>
              <template #append>
                <v-icon icon="mdi-close" @click="resetReply" />
              </template>
            </v-list-item>
            <v-text-field
              key="textField"
              flat
              autofocus
              single-line
              hide-details
              v-model="body"
              ref="messageFieldRef"
              variant="solo"
              :append-inner-icon="computedIcon"
              type="text"
              density="comfortable"
              label="Написать сообщение..."
              placeholder="Написать сообщение..."
              @click:append-inner="sendMessage"
              @keyup.enter="sendMessage"
              :loading="isLoadingComputed"
            />
          </v-slide-y-reverse-transition>
        </v-responsive>
      </div>
    </div>
  </div>
  <AddMemberToGroupVue v-if="currentDialog?.type === 'group'" v-model="isAddNewMember" :group="currentDialog" />
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useInfiniteScroll } from "@vueuse/core";
import useDialogsStore from "@/stores/dialogs";
import useUserStore from "@/stores/user";

// Components & Types
import MessagesComponent from "./MessagesComponent.vue";
import AddMemberToGroupVue from "../../DialogContainer/AddMemberToGroup.vue";
import type { Conversation, Message, MessageGroup } from "@/modules/messanger/types/index.types";
import { renderChar, renderTitle, isFavorite, giveRecipientId } from "@/modules/messanger/utils/conversationFunctions";

const dialogsStore = useDialogsStore();
const userStore = useUserStore();

const body = ref("");
const scrollRef = ref<HTMLElement | null>(null);
const isFirstLoading = ref(false);
const isAddLoading = ref(false);
const isEditing = ref(false);
const isReply = ref(false);
const messageItem = ref<Message | MessageGroup | null>(null);
const messageFieldRef = ref<HTMLInputElement | null>(null);
const isAddNewMember = ref(false);

const user = computed(() => userStore.getUser);

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

const computedIcon = computed(() => {
  if (isEditing.value && !body.value.length) return "mdi-delete-outline";

  if (isEditing.value) return "mdi-check";

  return "mdi-send";
});

const recipientId = computed(() => {
  if (!currentDialog.value) return 0;

  if (!user.value) return 0;

  if (dialogsStore.tab === "groups") return 0;

  const conversation = currentDialog.value as Conversation;
  return giveRecipientId(conversation, user.value);
});

const editMessage = (settings: { message: Message | MessageGroup; isEditing: boolean }) => {
  isReply.value = false;
  messageFieldRef.value?.focus();
  messageItem.value = settings.message;
  isEditing.value = settings.isEditing;
  body.value = settings.message.body;
};

const replyMessage = (settings: { message: Message | MessageGroup; isReply: boolean }) => {
  isEditing.value = false;
  isReply.value = true;
  messageFieldRef.value?.focus();
  messageItem.value = settings.message;
};

const resetReply = () => {
  isReply.value = false;
  messageItem.value = null;
};

watch(
  () => currentDialog.value,
  newDialog => {
    if (!newDialog) return;
    loadingFirstMessages();
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

const resetTextField = () => {
  isEditing.value = false;
  body.value = "";
  messageItem.value = null;
  isAddLoading.value = false;
};

const sendMessage = () => {
  isAddLoading.value = true;

  if (isEditing.value) {
    if (!messageItem.value) return resetTextField();

    if (!body.value.length) {
      body.value = "";
      isEditing.value = false;

      return dialogsStore.deleteMessage(messageItem.value.id).then(() => {
        isAddLoading.value = false;
        messageItem.value = null;
      });
    }

    if (body.value === messageItem.value.body) return resetTextField();

    dialogsStore.editMessage(body.value, messageItem.value.id).then(() => {
      isAddLoading.value = false;
      isEditing.value = false;
      messageItem.value = null;
    });
    body.value = "";
    return;
  }

  if (!body.value) return resetTextField();

  dialogsStore.storeMessage(body.value, recipientId.value, messageItem.value?.id).then(() => {
    isAddLoading.value = false;
  });
  messageItem.value = null;
  isReply.value = false;
  body.value = "";
};

onMounted(loadingFirstMessages);
</script>

<style scoped>
.toolbar {
  background: rgb(var(--v-theme-surface));
}
.replyItem {
  background: rgb(var(--v-theme-surface));
}
.replyIconMargin {
  margin-inline-end: 10px !important;
}

.center {
  height: 100%;
  width: 100%;
  overflow: hidden;
  position: relative;
}
.scroll-container {
  width: 100%;
  height: 100%;
  position: absolute;
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
