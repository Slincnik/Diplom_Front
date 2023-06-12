<template>
  <div class="bg-default fill-height d-flex overflow-x-auto">
    <PageLoadingSpinner v-if="!board" />
    <div
      v-else
      v-for="column in board.columns"
      :key="column.id"
      class="elevation-5 border rounded-lg mt-2 mb-2 ml-2 column-width mr-4"
    >
      <div class="d-flex align-center justify-space-between mx-auto">
        <p class="font-weight-medium ml-4">{{ column.title }}</p>
        <v-btn variant="text" class="align-self-center" size="36" icon="mdi-dots-vertical" />
      </div>
      <v-divider />
      <draggable
        v-model="column.cards"
        class="list-group overflow-y-auto"
        :list="column.cards"
        v-bind="dragOptions"
        :item-key="column.title"
        group="columns"
        ghost-class="ghost-card"
      >
        <template #item="{ element }: { element: Card }">
          <CardComponent :key="element.id" :card="element" />
        </template>
      </draggable>
      <v-divider />
      <div class="ma-2">
        <v-btn>Добавить карточку</v-btn>
      </div>
    </div>
    <div class="ma-2 ml-2 mr-4">
      <v-btn prepend-icon="mdi-plus">Добавить столбец</v-btn>
    </div>
  </div>
</template>
<script setup lang="ts">
import { onMounted, computed } from "vue";
import { storeToRefs } from "pinia";
import draggable from "vuedraggable";

import PageLoadingSpinner from "@/components/PageLoadingSpinner.vue";
import useDashboardStore from "@/stores/dashboard";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { Card } from "@/stores/dashboard/types";
import CardComponent from "../components/CardComponent.vue";

const dashboardStore = useDashboardStore();
const { board } = storeToRefs(dashboardStore);

const dragOptions = computed(() => {
  return { animation: 200, group: "description", disabled: false };
});

onMounted(dashboardStore.getBoard);
</script>

<style scoped>
.column-width {
  min-width: 320px;
  width: 240px !important;
}

.list-group {
  min-height: 20px;
  height: 100%;
  max-height: 748px;
  overflow-x: hidden;
}

/* ===== Scrollbar CSS ===== */
/* Firefox */
* {
  scrollbar-width: none;
  scrollbar-color: #3b3a3b;
}

/* Chrome, Edge, and Safari */
*::-webkit-scrollbar {
  width: 9px;
}

*::-webkit-scrollbar-track {
  background: transparent;
}

*::-webkit-scrollbar-thumb {
  background-color: #3b3a3b;
  border-radius: 24px;
  border: 2px solid transparent;
}
</style>
