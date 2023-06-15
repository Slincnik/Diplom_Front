<template>
  <v-container fluid class="fill-height overflow-x-auto">
    <v-progress-circular v-if="!board" size="large" class="mx-auto" indeterminate />
    <div v-else class="bg-default fill-height d-flex">
      <v-fade-transition group hideOnLeave>
        <ColumnComponent
          v-for="column in board.columns"
          :key="column.id"
          :column="column"
          :board="board"
          @reorder-change="onReorderChange"
          @reorder-commit="onReorderCommit"
        />
        <div key="addButton" class="my-2">
          <v-btn prepend-icon="mdi-plus" :loading="isLoading" @click="showAddColumnDialog = true"
            >Добавить столбец</v-btn
          >
        </div>
      </v-fade-transition>
      <AddColumnComponent
        v-model="showAddColumnDialog"
        @click-to-create="addColumn"
        @close-dialog="showAddColumnDialog = false"
      />
    </div>
  </v-container>
</template>
<script setup lang="ts">
import { onMounted, ref } from "vue";
import { storeToRefs } from "pinia";
import type { OrderedCardsInColumns } from "@/stores/dashboard/types";

import useDashboardStore from "@/stores/dashboard";

import ColumnComponent from "../components/ColumnComponent.vue";
import AddColumnComponent from "../components/AddColumnComponent.vue";

const dashboardStore = useDashboardStore();
const { board } = storeToRefs(dashboardStore);

const isLoading = ref(false);
const showAddColumnDialog = ref(false);
const columnsWithOrder = ref<OrderedCardsInColumns[]>([]);

const addColumn = async (title: string) => {
  if (!board.value) return;

  if (!title.length) return;

  showAddColumnDialog.value = false;

  isLoading.value = true;

  await dashboardStore.addColumn(title);

  isLoading.value = false;
};

const onReorderChange = (column: OrderedCardsInColumns) => {
  columnsWithOrder.value?.push(column);
};

const onReorderCommit = () => {
  if (!columnsWithOrder?.value?.length) {
    return;
  }

  dashboardStore.reorderCards(columnsWithOrder.value);
  columnsWithOrder.value = [];
};

onMounted(dashboardStore.getBoard);
</script>
