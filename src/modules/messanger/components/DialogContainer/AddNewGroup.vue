<template>
  <v-card-title> Введите название группы </v-card-title>
  <v-text-field
    class="mx-auto"
    style="width: 200px"
    rounded
    variant="outlined"
    v-model="groupName"
    label="Название группы"
    :disabled="isStoreLoading"
  />

  <v-select
    class="mx-auto"
    style="width: 200px"
    label="Пользователи"
    variant="underlined"
    :items="computedData"
    item-title="fullname"
    item-value="id"
    v-model="users"
    :loading="isLoading"
    :disabled="isStoreLoading"
    multiple
    chips
  >
  </v-select>

  <v-card-actions>
    <v-btn color="blue-darken-1" :loading="isStoreLoading" variant="text" @click="closeModal"> Закрыть </v-btn>
    <v-btn color="blue-darken-1" :loading="isStoreLoading" variant="text" @click="sendMessage"> Создать группу </v-btn>
  </v-card-actions>
</template>
<script setup lang="ts">
import { ref, computed } from "vue";
import cloneDeep from "lodash/cloneDeep";

import useDialogsStore from "@/stores/dialogs";
import type { IUser } from "@/stores/user/types";

const props = defineProps<{
  data?: IUser[];
  isLoading: boolean;
  userId: number;
}>();

const emit = defineEmits<{
  (e: "closeModal"): void;
}>();

const dialogsStore = useDialogsStore();
const users = ref<number[]>([]);
const groupName = ref("");
const isStoreLoading = ref(false);

const computedData = computed(() => {
  const cloned = cloneDeep(props.data);

  cloned?.forEach(iUser => {
    if (iUser.id === props.userId) {
      cloned.splice(
        cloned.findIndex(({ id }) => id === props.userId),
        1,
      );
    }
  });

  return cloned;
});

const closeModal = () => {
  users.value = [];
  groupName.value = "";
  emit("closeModal");
};

const sendMessage = async () => {
  if (!users.value) return;

  if (!groupName.value) return;

  isStoreLoading.value = true;

  await dialogsStore.createGroup(groupName.value, users.value);

  isStoreLoading.value = false;
  closeModal();
};
</script>
