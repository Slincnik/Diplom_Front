<template>
  <v-card-title> Выберите пользователя </v-card-title>
  <v-select
    class="mx-auto"
    style="width: 200px"
    label="Пользователи"
    variant="underlined"
    :items="computedData"
    item-title="fullname"
    item-value="id"
    v-model="user"
    :loading="isLoading"
    :disabled="isStoreLoading"
  />

  <v-text-field
    v-if="user"
    class="mx-auto"
    style="width: 200px"
    rounded
    variant="outlined"
    v-model="message"
    label="Сообщение"
    :disabled="isStoreLoading"
  />

  <v-card-actions>
    <v-btn color="blue-darken-1" :loading="isStoreLoading" variant="text" @click="closeModal"> Закрыть </v-btn>
    <v-btn color="blue-darken-1" :loading="isStoreLoading" variant="text" @click="sendMessage">
      Отправить сообщение
    </v-btn>
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

const user = ref<number | null>(null);
const message = ref("");
const isStoreLoading = ref(false);

const computedData = computed(() => {
  const cloned = cloneDeep(props.data);

  cloned?.forEach(iUser => {
    if (iUser.id === props.userId) {
      iUser.fullname = "Избранное";
    }
  });
  return cloned;
});

const closeModal = () => {
  user.value = null;
  message.value = "";
  emit("closeModal");
};

const sendMessage = async () => {
  if (!user.value) return;

  if (!message.value) return;

  isStoreLoading.value = true;

  await dialogsStore.storeMessage(message.value, "conversation", user.value);

  isStoreLoading.value = false;
  closeModal();
};
</script>
