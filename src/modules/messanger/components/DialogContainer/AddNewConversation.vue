<template>
  <v-dialog v-model="show" width="auto">
    <v-card v-if="data">
      <v-card-title> Выберите пользователя </v-card-title>
      <v-select
        class="mx-auto"
        style="width: 200px"
        label="Пользователи"
        variant="underlined"
        :items="data"
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
    </v-card>
  </v-dialog>
</template>
<script setup lang="ts">
import { ref, computed } from "vue";
import { useQuery } from "@tanstack/vue-query";

import useDialogsStore from "@/stores/dialogs";
import useUserStore from "@/stores/user";

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "closeModal"): void;
}>();

const dialogsStore = useDialogsStore();
const userStore = useUserStore();

const { isLoading, data } = useQuery({
  queryKey: ["users"],
  queryFn: () => dialogsStore.getUsers(),
  keepPreviousData: true,
  select(data) {
    data.forEach(iUser => {
      if (iUser.id === userStore.getUser?.id) {
        iUser.fullname = "Избранное";
      }
    });
    return data;
  },
});

const user = ref<number | null>(null);
const message = ref("");
const isStoreLoading = ref(false);

const show = computed({
  get() {
    return props.modelValue;
  },
  set() {
    emit("update:modelValue", props.modelValue);
  },
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
