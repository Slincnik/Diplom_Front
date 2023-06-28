<template>
  <div class="elevation-5 border rounded-lg mt-2 mb-2 ml-2 column-width mr-4">
    <div class="d-flex flex-column fill-height">
      <div
        class="d-flex align-center justify-space-between"
        :class="{
          'mx-auto': !isEditing,
        }"
      >
        <p v-if="!isEditing" @dblclick="isEditing = true" class="font-weight-medium ml-4">{{ columnTitle }}</p>
        <v-text-field
          v-else
          autofocus
          density="compact"
          single-line
          variant="underlined"
          hide-details
          class="ml-4 custom-text-field pa-0"
          v-model="columnTitle"
          @keyup.enter="editColumn"
        />
        <v-btn variant="text" @click="removeColumn(column.id)" size="36" icon="mdi-close" />
      </div>
      <v-divider />
      <draggableComponent
        :list="column.cards"
        class="list-group overflow-y-auto"
        v-bind="dragOptions"
        :item-key="columnTitle"
        group="columns"
        ghost-class="ghost-card"
        @change="onReorderCards"
        @end="onReorderEnds"
      >
        <template #item="{ element }: { element: Card }">
          <CardComponent
            class="cursor-grable"
            @dblclick="openCardDialog(element)"
            :key="element.id"
            @delete-click="removeCard"
            :card="element"
            :isEditing="isCardEditing"
            :column-id="column.id"
            @updateEditing="isCardEditing = !isCardEditing"
          />
        </template>
      </draggableComponent>
      <v-divider />
      <div class="mx-auto my-2">
        <v-btn @click="showAddCardDialog = true">Добавить карточку</v-btn>
      </div>
    </div>
    <AddCardComponent
      v-model="showAddCardDialog"
      @click-to-create="addCard"
      @close-dialog="showAddCardDialog = false"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import cloneDeep from "lodash/cloneDeep";
import draggableComponent from "vuedraggable";
import useDashboardStore from "@/stores/dashboard";

//Components & Types
import CardComponent from "./CardComponent.vue";
import AddCardComponent from "./AddCardComponent.vue";
import type { Column, Card, Board } from "@/stores/dashboard/types";

const props = defineProps<{
  column: Column;
  board: Board;
}>();

const emit = defineEmits(["reorder-change", "reorder-commit"]);

const dashboardStore = useDashboardStore();

const showAddCardDialog = ref(false);
const isEditing = ref(false);
const isCardEditing = ref(false);
const cards = ref(props.column.cards);
const selectedCard = ref<Card | null>(null);

const columnTitle = computed({
  get() {
    return props.column.title;
  },
  set(value) {
    newColumnTitle.value = value;
  },
});

const newColumnTitle = ref(columnTitle.value);

const dragOptions = computed(() => {
  return { animation: 200, group: "column" };
});

// Keep the cards up-to-date
watch(
  () => props.column,
  () => (cards.value = props.column.cards),
);

const addCard = async (content: string) => {
  if (!props.board) return;

  if (!content.length) return;

  showAddCardDialog.value = false;

  await dashboardStore.addCard({
    content,
    columnId: props.column.id,
  });
};

const editColumn = async () => {
  isEditing.value = false;
  if (props.column.title === newColumnTitle.value) return;

  await dashboardStore.editColumnTitle(props.column.id, newColumnTitle.value);
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

const openCardDialog = (card: Card) => {
  isCardEditing.value = true;
  selectedCard.value = card;
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

const listener = (e: KeyboardEvent) => {
  if (e.key === "Escape") {
    if (isEditing.value) {
      isEditing.value = false;
    }

    if (isCardEditing.value) {
      isCardEditing.value = false;
    }
  }
};

onMounted(() => {
  window.addEventListener("keyup", listener);
});

onUnmounted(() => {
  window.removeEventListener("keyup", listener);
});
</script>

<style scoped>
.custom-text-field >>> .v-field__input {
  padding-top: 0 !important;
}
.column-width {
  min-width: 320px;
  width: 320px !important;
}

.list-group {
  height: 100%;
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
