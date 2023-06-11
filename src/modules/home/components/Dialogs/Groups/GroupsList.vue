<template>
  <v-virtual-scroll :items="groups" item-height="40" height="822">
    <template #default="{ item: group }: { item: Group }">
      <v-list-item
        @click.prevent="dialogsStore.setCurrentDialog(group.id)"
        :class="{
          'v-list-item--active': group.id == currentDialogId,
        }"
      >
        <v-list-item-title class="d-flex justify-start"> {{ group.name }}</v-list-item-title>
        <v-list-item-subtitle class="d-flex justify-start"> {{ renderLastMessage(group) }} </v-list-item-subtitle>
        <template v-slot:prepend>
          <v-avatar size="large" color="brown">
            <span class="text-h5">{{ group.name.charAt(0) }}</span>
          </v-avatar>
        </template>
      </v-list-item>
      <v-divider />
    </template>
  </v-virtual-scroll>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import useUserStore from "@/stores/user";
import useDialogsStore from "@/stores/dialogs";

//Types
import type { Group } from "@/modules/home/types/index.types";

defineProps<{
  groups: Group[];
}>();

const userStore = useUserStore();
const dialogsStore = useDialogsStore();

const { user } = storeToRefs(userStore);
const { currentDialogId } = storeToRefs(dialogsStore);

const renderLastMessage = (group: Group) => {
  if (!user.value) return "";

  const createdGroup = !group.lastMessage && !group.messages.length;

  if (createdGroup) {
    return `Группа создана`;
  } else {
    const isAuthor = group.lastMessage.sender.id === user.value.id;

    return `${isAuthor ? "Вы: " : `${group.lastMessage.sender.fullname}`} ${group.lastMessage.body}`;
  }
};
</script>
