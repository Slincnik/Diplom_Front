<template>
  <div class="d-flex flex-column fill-height leftMenu" @mouseenter="isOver = true" @mouseleave="isOver = false">
    <div>
      <v-card>
        <v-tabs v-model="dialogStore.tab" fixed-tabs>
          <v-tab value="conversations"> Диалоги </v-tab>
          <v-tab value="groups"> Группы </v-tab>
        </v-tabs>
      </v-card>
    </div>
    <v-divider class="border-opacity-25" />
    <v-sheet :key="dialogStore.tab" class="overflow-y-auto fill-height sheet">
      <ConversationsList v-if="dialogStore.tab === 'conversations'" />
      <GroupsList v-else />
    </v-sheet>
    <v-menu style="position: fixed" persistent attach v-model="showMenu" location="top">
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
      <v-list style="position: relative">
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
    <v-dialog :key="currentDialog" v-model="showDialog" width="auto">
      <v-card :loading="isLoading">
        <component
          :is="components[currentDialog]"
          :key="currentDialog"
          :is-loading="isLoading"
          :data="data"
          :userId="userStore.getUser!.id"
          @closeModal="showDialog = false"
        />
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useRouter } from "vue-router";
import useDialogsStore from "@/stores/dialogs";
import useUserStore from "@/stores/user";

//Components
import ConversationsList from "./Conversations/ConversationsList.vue";
import GroupsList from "./Groups/GroupsList.vue";
import AddNewConversation from "../DialogContainer/AddNewConversation.vue";
import AddNewGroup from "../DialogContainer/AddNewGroup.vue";
import { useQuery } from "@tanstack/vue-query";

const dialogStore = useDialogsStore();
const userStore = useUserStore();
const router = useRouter();

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

const components = {
  conversation: AddNewConversation,
  group: AddNewGroup,
};

const isOver = ref(false);
const showMenu = ref(false);
const showDialog = ref(false);
const currentDialog = ref<"conversation" | "group">("conversation");

const { isLoading, data } = useQuery({
  queryKey: ["users"],
  queryFn: () => dialogStore.getUsers(),
  keepPreviousData: true,
});

const menuClicked = (type: "conversation" | "group") => {
  showDialog.value = true;
  currentDialog.value = type;
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
.sheet {
  position: relative;
}
.leftMenu {
  background-color: rgb(var(--v-theme-surface));
  position: relative;
}
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
  bottom: 1rem;
  right: 2rem;
  transform: translateY(5rem);
}

.revealed {
  transform: translateY(0);
}
</style>
