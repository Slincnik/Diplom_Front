<template>
  <v-progress-circular v-if="!board" size="large" class="mx-auto" indeterminate />
  <div v-else class="bg-default fill-height d-flex overflow-x-auto">
    <v-fade-transition group>
      <div
        v-for="column in board.columns"
        :key="column.id"
        class="elevation-5 border rounded-lg mt-2 mb-2 ml-2 column-width mr-4"
      >
        <div class="d-flex align-center justify-space-between mx-auto">
          <p class="font-weight-medium ml-4">{{ column.title }}</p>
          <v-btn variant="text" @click="removeColumn(column.id)" size="36" icon="mdi-close" />
        </div>
        <v-divider />
        <draggableComponent
          :list="column.cards"
          class="list-group overflow-y-auto"
          v-bind="dragOptions"
          :item-key="column.title"
          group="columns"
          ghost-class="ghost-card"
        >
          <template #item="{ element }: { element: Card }">
            <CardComponent class="cursor-grable" :key="element.id" @delete-click="removeCard" :card="element" />
          </template>
        </draggableComponent>
        <v-divider />
        <div class="ma-2 mx-auto">
          <v-btn @click="showAddCardComponent(column)">Добавить карточку</v-btn>
        </div>
      </div>
    </v-fade-transition>
    <div class="my-2">
      <v-btn prepend-icon="mdi-plus" :loading="isLoading" @click="showAddColumnDialog = true">Добавить столбец</v-btn>
    </div>
    <AddColumnComponent
      v-model="showAddColumnDialog"
      @click-to-create="addColumn"
      @close-dialog="showAddColumnDialog = false"
    />
    <AddCardComponent
      v-model="showAddCardDialog"
      @click-to-create="addCard"
      @close-dialog="showAddCardDialog = false"
    />
  </div>
</template>
<script setup lang="ts">
import { onMounted, computed, ref } from "vue";
import { storeToRefs } from "pinia";
import draggableComponent from "vuedraggable";

import useDashboardStore from "@/stores/dashboard";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { Card, Column } from "@/stores/dashboard/types";

//Components
import CardComponent from "../components/CardComponent.vue";
import AddColumnComponent from "../components/AddColumnComponent.vue";
import AddCardComponent from "../components/AddCardComponent.vue";

const dashboardStore = useDashboardStore();
const { board } = storeToRefs(dashboardStore);

const isLoading = ref(false);
const showAddColumnDialog = ref(false);
const showAddCardDialog = ref(false);
const currentColumn = ref<Column | null>(null);

const dragOptions = computed(() => {
  return { animation: 200, group: "column" };
});

const showAddCardComponent = (column: Column) => {
  showAddCardDialog.value = true;
  currentColumn.value = column;
};

const addColumn = async (title: string) => {
  if (!board.value) return;

  if (!title.length) return;

  showAddColumnDialog.value = false;

  isLoading.value = true;

  await dashboardStore.addColumn(title);

  isLoading.value = false;
};

const addCard = async (content: string) => {
  if (!board.value) return;

  if (!content.length) return;

  if (!currentColumn.value) return;

  showAddCardDialog.value = false;

  await dashboardStore.addCard({
    content,
    position: 2,
    columnId: currentColumn.value.id,
  });
};

const removeColumn = async (columnId: number) => {
  if (!board.value) return;

  await dashboardStore.removeColumn(columnId);
};

const removeCard = async (newCard: Card) => {
  if (!board.value) return;

  const column = board.value.columns.find(({ cards }) => {
    return cards.find(({ id }) => id === newCard.id);
  });

  if (!column) return;

  await dashboardStore.removeCard({
    columnId: column.id,
    cardId: newCard.id,
  });
};

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
  max-height: 760px;
  overflow-x: hidden;
}

.cursor-grable {
  cursor: grab;
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
