<template>
  <v-dialog v-model="show" width="auto">
    <v-card>
      <v-select
        class="mx-auto mt-2"
        style="width: 200px"
        label="Пользователи"
        variant="underlined"
        :items="usersInGroup"
        item-title="fullname"
        item-value="id"
        v-model="users"
        :disabled="isLoading"
        multiple
        chips
      >
      </v-select>
      <v-card-actions>
        <v-btn color="blue-darken-1" variant="text" @click="closeModal"> Закрыть </v-btn>
        <v-btn color="blue-darken-1" @click="addUsersToGroup" variant="text"> Пригласить </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, ref, toRaw } from "vue";
import { useQueryClient } from "@tanstack/vue-query";
import useDialogsStore from "@/stores/dialogs";

import type { Group } from "../../types/index.types";
import type { IUser } from "@/stores/user/types";

const props = defineProps<{
  modelValue: boolean;
  group: Group;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
}>();

const users = ref<number[]>([]);
const isLoading = ref(false);

const show = computed({
  get() {
    return props.modelValue;
  },
  set() {
    emit("update:modelValue", props.modelValue);
  },
});
const queryClient = useQueryClient();
const dialogsStore = useDialogsStore();

const userData = computed(() => {
  return queryClient.getQueryData(["users"]) as IUser[];
});

const cloned = ref(toRaw(props.group.members));

const usersInGroup = computed(() => {
  const filteredUsers = [];

  if (!userData.value) return;

  for (const iUser of userData.value) {
    const findUser = cloned.value.find(({ id }) => iUser.id === id);

    if (!findUser) {
      filteredUsers.push(iUser);
    }
  }

  return filteredUsers;
});

const closeModal = () => {
  emit("update:modelValue", false);
};

const addUsersToGroup = async () => {
  if (!users.value.length) return;
  isLoading.value = true;

  await dialogsStore.inviteMembersToGroup(props.group.id, users.value);

  isLoading.value = false;
  users.value = [];
  closeModal();
};
</script>
