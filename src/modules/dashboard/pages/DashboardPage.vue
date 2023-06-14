<template>
  <v-progress-circular v-if="!board" size="large" class="mx-auto" indeterminate />
  <div v-else class="bg-default fill-height d-flex overflow-x-auto">
    <v-fade-transition group>
      <ColumnComponent
        v-for="column in board.columns"
        :key="column.id"
        :column="column"
        :board="board"
        @reorder-change="onReorderChange"
        @reorder-commit="onReorderCommit"
      />
    </v-fade-transition>
    <div class="my-2">
      <v-btn prepend-icon="mdi-plus" :loading="isLoading" @click="showAddColumnDialog = true">Добавить столбец</v-btn>
    </div>
    <AddColumnComponent
      v-model="showAddColumnDialog"
      @click-to-create="addColumn"
      @close-dialog="showAddColumnDialog = false"
    />
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref } from "vue";
import { storeToRefs } from "pinia";

import useDashboardStore from "@/stores/dashboard";

import ColumnComponent from "../components/ColumnComponent.vue";
import AddColumnComponent from "../components/AddColumnComponent.vue";

const dashboardStore = useDashboardStore();
const { board } = storeToRefs(dashboardStore);

const isLoading = ref(false);
const showAddColumnDialog = ref(false);
const columnsWithOrder = ref([]);

const addColumn = async (title: string) => {
  if (!board.value) return;

  if (!title.length) return;

  showAddColumnDialog.value = false;

  isLoading.value = true;

  await dashboardStore.addColumn(title);

  isLoading.value = false;
};

const onReorderChange = column => {
  columnsWithOrder.value?.push(column);
};

const onReorderCommit = () => {
  if (!columnsWithOrder?.value?.length) {
    return;
  }

  dashboardStore.reorderCards(columnsWithOrder.value);
};

onMounted(dashboardStore.getBoard);
</script>
