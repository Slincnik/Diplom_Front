<template>
  <v-dialog v-model="show" width="auto">
    <v-card>
      <v-card-title> Введите название столбца </v-card-title>
      <v-text-field
        flat
        single-line
        hide-details
        autofocus
        v-model="columnTitle"
        variant="solo"
        type="text"
        density="comfortable"
        label="Название столбца..."
        placeholder="Название столбца..."
        @keyup.enter="createColumn"
      />
      <v-card-actions>
        <v-btn color="blue-darken-1" variant="text" @click="closeDialog"> Закрыть </v-btn>
        <v-btn color="blue-darken-1" variant="text" @click="createColumn"> Создать </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script setup lang="ts">
import { ref, computed } from "vue";

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  (e: "clickToCreate", value: string): void;
  (e: "closeDialog", value: void): void;
  (e: "update:modelValue", value: boolean): void;
}>();

const columnTitle = ref("");

const show = computed({
  get() {
    return props.modelValue;
  },
  set() {
    columnTitle.value = "";
    emit("update:modelValue", props.modelValue);
  },
});

const closeDialog = () => {
  emit("closeDialog");
  columnTitle.value = "";
};

const createColumn = () => {
  emit("clickToCreate", columnTitle.value);
  columnTitle.value = "";
};
</script>
