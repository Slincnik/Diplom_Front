<template>
  <div v-if="!groups.length" class="d-flex fill-height justify-center align-center">
    <span class="text-h6 text-center"> Создайте группу и начните общение </span>
  </div>
  <div v-else class="overflow-y-auto list">
    <template v-for="group in groups" :key="group.id">
      <v-list-item
        @click.prevent="dialogsStore.setCurrentDialog(group.id)"
        :class="{
          'v-list-item--active': group.id == currentDialogId,
        }"
      >
        <v-list-item-title class="d-flex justify-start text-truncate"> {{ group.name }}</v-list-item-title>
        <v-list-item-subtitle class="d-block justify-start text-truncate">
          {{ renderLastMessage(group) }}
        </v-list-item-subtitle>
        <template v-slot:prepend>
          <v-avatar size="large" color="brown">
            <span class="text-h5">{{ group.name.charAt(0) }}</span>
          </v-avatar>
        </template>
        <template v-slot:append>
          <v-icon icon="mdi-door-open" class="onHoverLeave" @click.stop="leaveFromGroup(group.id)" />
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

const leaveFromGroup = (group_id: number) => {
  dialogsStore.setCurrentDialog(null);
  dialogsStore.leaveFromGroup(group_id);
};

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

<style scoped>
.list {
  width: 100%;
  position: absolute;
}

.onHoverLeave:hover {
  cursor: crosshair;
}
</style>
