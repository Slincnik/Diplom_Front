<template>
  <v-card>
    <v-tabs v-model="dialogStore.tab" fixed-tabs>
      <v-tab value="conversations"> Диалоги </v-tab>
      <v-tab value="groups"> Группы </v-tab>
    </v-tabs>
  </v-card>
  <v-divider class="border-opacity-25" />
  <v-sheet>
    <ConversationsList v-if="dialogStore.tab === 'conversations'" />
    <GroupsList v-else />
  </v-sheet>
</template>

<script setup lang="ts">
import useDialogsStore from "@/stores/dialogs";
import ConversationsList from "./Conversations/ConversationsList.vue";
import GroupsList from "./Groups/GroupsList.vue";

const dialogStore = useDialogsStore();
</script>

<style scoped>
/* ===== Scrollbar CSS ===== */
/* Firefox */
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
