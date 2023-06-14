<template>
  <div class="elevation-5 border rounded-lg mt-2 mb-2 ml-2 column-width mr-4">
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
      @change="onReorderCards"
      @end="onReorderEnds"
    >
      <template #item="{ element }: { element: Card }">
        <CardComponent class="cursor-grable" :key="element.id" @delete-click="removeCard" :card="element" />
      </template>
    </draggableComponent>
    <v-divider />
    <div class="ma-2 mx-auto">
      <v-btn @click="showAddCardDialog = true">Добавить карточку</v-btn>
    </div>
    <AddCardComponent
      v-model="showAddCardDialog"
      @click-to-create="addCard"
      @close-dialog="showAddCardDialog = false"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { cloneDeep } from "lodash";
import useDashboardStore from "@/stores/dashboard";

import type { Column, Card, Board } from "@/stores/dashboard/types";

const props = defineProps<{
  column: Column;
  board: Board;
}>();

const emit = defineEmits(["reorder-change", "reorder-commit"]);
//Components
import draggableComponent from "vuedraggable";
import CardComponent from "./CardComponent.vue";
import AddCardComponent from "./AddCardComponent.vue";

const dashboardStore = useDashboardStore();

const showAddCardDialog = ref(false);
const columnsWithOrder = ref<unknown[]>([]);
const cards = ref(props.column.cards);

// Keep the cards up-to-date
watch(
  () => props.column,
  () => (cards.value = props.column.cards),
);

const dragOptions = computed(() => {
  return { animation: 200, group: "column" };
});

const addCard = async (content: string) => {
  if (!props.board) return;

  if (!content.length) return;

  showAddCardDialog.value = false;

  await dashboardStore.addCard({
    content,
    position: 2,
    columnId: props.column.id,
  });
};

const removeColumn = async (columnId: number) => {
  if (!props.board) return;

  await dashboardStore.removeColumn(columnId);
};

const removeCard = async (newCard: Card) => {
  if (!props.board) return;

  const column = props.board.columns.find(({ cards }) => {
    return cards.find(({ id }) => id === newCard.id);
  });

  if (!column) return;

  await dashboardStore.removeCard({
    columnId: column.id,
    cardId: newCard.id,
  });
};

const onReorderCards = () => {
  const cloned = cloneDeep(cards.value);

  const cardsWithOrder = [
    ...cloned.map((card, index) => ({
      id: card.id,
      position: index * 1000 + 1000,
    })),
  ];

  emit("reorder-change", {
    id: props?.column?.id,
    cards: cardsWithOrder,
  });
};

const onReorderEnds = () => {
  emit("reorder-commit");
};
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
