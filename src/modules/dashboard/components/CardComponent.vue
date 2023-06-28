<template>
  <div
    @mouseenter="isOver = true"
    @mouseleave="isOver = false"
    class="rounded bg-grey-darken-4 mb-2 mt-2 mx-2 card d-flex align-center"
  >
    <v-tooltip v-model="showTooltip" location="top" :text="`Дата последнего изменения: ${formatDate(card.updated_at)}`">
      <template #activator="{ props }">
        <p v-if="!isEditing" class="font-weight-medium mx-auto" v-bind="props">
          {{ card.content }}
          <v-icon
            v-if="isOver"
            @click.prevent="$emit('deleteClick', card)"
            class="cursor-pointer text-right"
            icon="mdi-close"
            size="16"
          />
        </p>
        <v-text-field
          v-else
          autofocus
          density="compact"
          single-line
          variant="underlined"
          hide-details
          class="ml-4 custom-text-field pa-0"
          v-model="newCardContent"
          @keyup.enter="updateCard"
        />
      </template>
    </v-tooltip>
  </div>
</template>
<script setup lang="ts">
import { ref, computed } from "vue";
import type { Card } from "@/stores/dashboard/types";
import useDashboardStore from "@/stores/dashboard";

const props = defineProps<{
  card: Card;
  isEditing: boolean;
  columnId: number;
}>();

const emit = defineEmits<{
  (e: "deleteClick", value: Card): void;
  (e: "updateEditing"): void;
}>();

const dashboardStore = useDashboardStore();

const isOver = ref(false);

const showTooltip = computed(() => {
  if (props.isEditing) return false;

  if (isOver.value) return true;

  return false;
});

const newCardContent = ref(props.card.content);

const updateCard = async () => {
  emit("updateEditing");

  if (props.card.content === newCardContent.value) return;

  await dashboardStore.editCardContent(props.columnId, props.card.id, newCardContent.value);
};

const formatDate = (value: string) => {
  return Intl.DateTimeFormat(navigator.language, {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  }).format(new Date(value));
};
</script>

<style scoped>
.custom-text-field >>> .v-field__input {
  padding-top: 0 !important;
}
.card {
  height: 50px;
}

.cursor-pointer {
  cursor: pointer;
}
</style>
