<script setup lang="ts">
import { computed } from "vue";
import { useTitle } from "@vueuse/core";
import { RouterView, useRoute } from "vue-router";

import AppLayout from "./layouts/AppLayout.vue";

const route = useRoute();

const title = computed(() => {
  return (route.meta?.title as string) ?? "Messanger & Project management";
});

useTitle(title);
</script>

<template>
  <AppLayout>
    <RouterView />
  </AppLayout>
</template>
