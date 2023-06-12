<template>
  <div class="rounded bg-grey-darken-4 mb-2 mt-2 mx-2 card d-flex align-center">
    <p class="font-weight-medium mx-auto">{{ card.content }}</p>
  </div>
</template>
<script setup lang="ts">
import type { Card } from "@/stores/dashboard/types";

defineProps<{
  card: Card;
}>();
</script>

<style scoped>
.card {
  height: 50px;
}
</style>
