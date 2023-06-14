<template>
  <div @mouseenter="isOver = true" @mouseleave="isOver = false">
    <v-card>
      <v-tabs v-model="dialogStore.tab" fixed-tabs>
        <v-tab value="conversations"> Диалоги </v-tab>
        <v-tab value="groups"> Группы </v-tab>
      </v-tabs>
    </v-card>
    <v-divider class="border-opacity-25" />
    <v-sheet :key="dialogStore.tab" class="fill-height rounded-lg" style="max-height: 823px">
      <ConversationsList v-if="dialogStore.tab === 'conversations'" />
      <GroupsList v-else />
    </v-sheet>
    <v-menu attach v-model="showMenu" location="top">
      <template v-slot:activator="{ props }">
        <v-btn
          class="newchatbutton"
          :class="{
            revealed: isOver,
          }"
          color="blue"
          icon="mdi-pencil"
          v-bind="props"
        ></v-btn>
      </template>
      <v-list>
        <v-list-item v-for="(item, index) in items" :key="index" :value="index">
          <div class="d-flex" @click.prevent="menuClicked(item.type as 'group' | 'conversation')">
            <v-icon :icon="item.icon" />
            <span class="ml-2">
              {{ item.title }}
            </span>
          </div>
        </v-list-item>
      </v-list>
    </v-menu>
    <AddNewConversation v-model="showAddConversation" @close-modal="showAddConversation = false" />
    <AddNewGroup v-model="showAddGroup" @close-modal="showAddGroup = false" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useRouter } from "vue-router";
import useDialogsStore from "@/stores/dialogs";
import ConversationsList from "./Conversations/ConversationsList.vue";
import GroupsList from "./Groups/GroupsList.vue";
import AddNewConversation from "../DialogContainer/AddNewConversation.vue";
import AddNewGroup from "../DialogContainer/AddNewGroup.vue";

const items = [
  {
    title: "Новое сообщение",
    icon: "mdi-account-plus",
    type: "conversation",
  },
  {
    title: "Новая группа",
    icon: "mdi-account-group-outline",
    type: "group",
  },
];

const dialogStore = useDialogsStore();

const router = useRouter();

const isOver = ref(false);
const showMenu = ref(false);
const showAddConversation = ref(false);
const showAddGroup = ref(false);

const menuClicked = (type: "conversation" | "group") => {
  if (type === "conversation") {
    showAddConversation.value = true;
  }
  if (type === "group") {
    showAddGroup.value = true;
  }
};

watch(isOver, value => {
  if (!value) {
    showMenu.value = false;
  }
});

watch(
  () => dialogStore.tab,
  () => {
    dialogStore.setCurrentDialog(null);
    router.push({
      query: {
        tab: dialogStore.tab,
      },
    });
  },
);
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

.onHover:hover {
  background-color: rgb(45, 45, 45);
}

.newchatbutton {
  position: absolute;
  bottom: 2rem;
  right: 100rem;
  transform: translateX(-20rem);
}

.revealed {
  transform: translateX(0);
  display: block;
}
</style>
