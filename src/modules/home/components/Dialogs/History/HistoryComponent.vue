<template>
  <v-card>
    <v-toolbar dark prominent density="compact" class="bg-transparent">
      <v-toolbar-title class="d-flex"> Test </v-toolbar-title>
      <template v-slot:prepend>
        <v-avatar size="40" elevation="10" color="brown">
          <span class="text-h5"> T </span>
        </v-avatar>
      </template>
    </v-toolbar>
  </v-card>
  <div class="scroll-container mb-2 mt-2 d-flex flex-column justify-end align-center">
    <MessagesComponent v-if="dialogsStore.currentDialogId" ref="messageRef" :messages="currentDialog!.messages" />
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
import { ref, computed } from "vue";
import useDialogsStore from "@/stores/dialogs";
import MessagesComponent from "./MessagesComponent.vue";

const dialogsStore = useDialogsStore();
const currentDialog = computed(() => dialogsStore.getConversationOrGroup);

const body = ref("");

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
