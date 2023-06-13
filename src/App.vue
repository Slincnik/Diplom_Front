<script setup lang="ts">
import { onErrorCaptured } from "vue";
import { ref } from "vue";
import { RouterView } from "vue-router";

import AppLayout from "./layouts/AppLayout.vue";

const isError = ref(false);

onErrorCaptured((error, _, info) => {
  if (info === "component event handler") return;
  isError.value = true;
});
</script>

<template>
  <template v-if="isError">
    <h2>Случилась ошибка, перезагрузите страницу</h2>
  </template>
  <AppLayout v-else>
    <RouterView />
  </AppLayout>
</template>
