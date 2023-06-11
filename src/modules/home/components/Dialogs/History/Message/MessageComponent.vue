<template>
  <v-card
    class="mb-4 d-flex flex-column rounded-lg"
    :class="[
      {
        ['align-self-end ' + 'align-end' + ' rounded-be-0']: item.sender.id === userId,
        ['align-self-start' + ' align-start' + ' rounded-bs-0']: item.sender.id !== userId,
      },
    ]"
    :color="item.sender.id === userId ? 'blue' : 'gray'"
    max-width="300px"
  >
    <v-card-text class="text-h7 py-3">
      {{ item.body }}
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import type { Message, MessageGroup } from "@/modules/home/types/index.types";

defineProps<{
  item: Message | MessageGroup;
  userId: number;
}>();
</script>
