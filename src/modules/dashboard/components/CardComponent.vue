<template>
  <div
    @mouseenter="isOver = true"
    @mouseleave="isOver = false"
    class="rounded bg-grey-darken-4 mb-2 mt-2 mx-2 card d-flex align-center"
  >
    <p class="font-weight-medium mx-auto">
      {{ card.content }}
      <v-icon
        v-if="isOver"
        @click.prevent="$emit('deleteClick', card)"
        class="cursor-pointer text-right"
        icon="mdi-close"
        size="16"
      />
    </p>
  </div>
</template>
<script setup lang="ts">
import { ref } from "vue";
import type { Card } from "@/stores/dashboard/types";

defineProps<{
  card: Card;
}>();

defineEmits<{
  (e: "deleteClick", value: Card): void;
}>();

const isOver = ref(false);
</script>

<style scoped>
.card {
  height: 50px;
}

.cursor-pointer {
  cursor: pointer;
}
</style>
