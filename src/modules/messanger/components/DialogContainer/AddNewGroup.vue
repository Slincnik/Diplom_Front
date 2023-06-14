<template>
  <v-dialog v-model="show" width="auto">
    <v-card v-if="data">
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
        :items="data"
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
        <v-btn color="blue-darken-1" :loading="isStoreLoading" variant="text" @click="sendMessage">
          Создать группу
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script setup lang="ts">
import { ref, computed } from "vue";
import { useQuery } from "@tanstack/vue-query";
import cloneDeep from "lodash/cloneDeep";

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
    const cloned = cloneDeep(data);
    cloned.forEach(iUser => {
      if (iUser.id === userStore.getUser?.id) {
        cloned.splice(
          cloned.findIndex(({ id }) => id === userStore.getUser?.id),
          1,
        );
      }
    });

    return cloned;
  },
});

const users = ref<number[]>([]);
const groupName = ref("");
const isStoreLoading = ref(false);

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

const show = computed({
  get() {
    return props.modelValue;
  },
  set() {
    emit("update:modelValue", props.modelValue);
  },
});
</script>
