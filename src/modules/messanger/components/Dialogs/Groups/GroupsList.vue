<template>
  <div class="overflow-y-auto" style="height: 820px">
    <template v-for="group in groups" :key="group.id">
      <v-list-item
        @click.prevent="dialogsStore.setCurrentDialog(group.id)"
        :class="{
          'v-list-item--active': group.id == currentDialogId,
        }"
      >
        <v-list-item-title class="d-flex justify-start text-truncate"> {{ group.name }}</v-list-item-title>
        <v-list-item-subtitle class="d-flex justify-start text-truncate">
          {{ renderLastMessage(group) }}
        </v-list-item-subtitle>
        <template v-slot:prepend>
          <v-avatar size="large" color="brown">
            <span class="text-h5">{{ group.name.charAt(0) }}</span>
          </v-avatar>
        </template>
      </v-list-item>
      <v-divider />
    </template>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import useUserStore from "@/stores/user";
import useDialogsStore from "@/stores/dialogs";

//Types
import type { Group } from "@/modules/messanger/types/index.types";

const userStore = useUserStore();
const dialogsStore = useDialogsStore();

const { user } = storeToRefs(userStore);
const { currentDialogId, groups } = storeToRefs(dialogsStore);

const renderLastMessage = (group: Group) => {
  if (!user.value) return "";

  const createdGroup = !group.lastMessage && !group.messages.length;

  if (createdGroup) {
    return `Группа создана`;
  } else {
    const isAuthor = group.lastMessage?.sender.id === user.value.id;

    return `${isAuthor ? "Вы: " : `${group.lastMessage?.sender.fullname}: `} ${group.lastMessage?.body}`;
  }
};
</script>
