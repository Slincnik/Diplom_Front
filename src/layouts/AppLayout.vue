<script setup lang="ts">
import { useRoute } from "vue-router";
const route = useRoute();
import LoadingSpinner from "@/components/PageLoadingSpinner.vue";
</script>

<template>
  <template v-if="route.meta.layoutComponent">
    <Transition name="fade" mode="out-in">
      <component :is="route.meta.layoutComponent">
        <slot />
      </component>
    </Transition>
  </template>
  <template v-else>
    <LoadingSpinner />
  </template>
</template>

<style>
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease-out;
}
</style>
