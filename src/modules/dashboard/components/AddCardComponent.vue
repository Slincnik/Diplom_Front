<template>
  <v-dialog v-model="show" width="auto">
    <v-card>
      <v-card-title> Введите содержание </v-card-title>
      <v-text-field
        flat
        single-line
        hide-details
        autofocus
        v-model="cardContent"
        variant="solo"
        type="text"
        density="comfortable"
        label="Введите содержание..."
        placeholder="Введите содержание.."
        @keyup.enter="emit('clickToCreate', cardContent)"
      />
      <v-card-actions>
        <v-btn color="blue-darken-1" variant="text" @click="emit('closeDialog')"> Закрыть </v-btn>
        <v-btn color="blue-darken-1" variant="text" @click="clickToCreate"> Создать </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script setup lang="ts">
import { ref, computed } from "vue";

const cardContent = ref("");
const props = defineProps<{
  modelValue: boolean;
}>();

const show = computed({
  get() {
    return props.modelValue;
  },
  set() {
    emit("update:modelValue", props.modelValue);
  },
});

const emit = defineEmits<{
  (e: "clickToCreate", value: string): void;
  (e: "closeDialog", value: void): void;
  (e: "update:modelValue", value: boolean): void;
}>();

const clickToCreate = () => {
  emit("clickToCreate", cardContent.value);

  cardContent.value = "";
};
</script>
