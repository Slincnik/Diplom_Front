<template>
  <div class="message-container d-flex flex-column justify-end w-50">
    <v-fade-transition group>
      <v-list-item
        class="mb-4 rounded-lg"
        v-for="item in dialog.messages"
        :key="item.id"
        :class="[
          {
            ['align-self-end align-end rounded-be-0 bg-blue']: item.sender.id === user?.id,
            ['align-self-start align-start rounded-bs-0 bg-grey-darken-4']: item.sender.id !== user?.id,
          },
        ]"
        :color="item.sender.id === user?.id ? 'blue' : 'gray'"
        max-width="300px"
      >
        <span class="text-h7 py-3 text-white">
          {{ item.body }}
        </span>
        <v-list-item-subtitle>
          <p
            class="text-white"
            :class="{
              'text-right': item.sender.id === user?.id,
              'text-left': item.sender.id !== user?.id,
            }"
          >
            {{ formatDate(item.created_at) }}
          </p>
        </v-list-item-subtitle>
      </v-list-item>
    </v-fade-transition>
    <div ref="endMessagesRef" id="#scrollHere" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from "vue";
import useUserStore from "@/stores/user";
import type { Conversation, Group } from "@/modules/home/types/index.types";

const userStore = useUserStore();

const endMessagesRef = ref<HTMLElement | null>(null);

const user = userStore.getUser;

const props = defineProps<{
  scrollRef: HTMLElement | null;
  dialog: Conversation | Group;
}>();

const formatDate = (value: string) => {
  return Intl.DateTimeFormat(navigator.language, {
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  }).format(new Date(value));
};

const scrollToTop = (behavior: "auto" | "smooth" = "auto") => {
  if (endMessagesRef.value) {
    const messages = endMessagesRef.value;
    nextTick(() => {
      messages.scrollIntoView({
        block: "end",
        behavior,
      });
    });
  }
};

onMounted(scrollToTop);

watch(
  () => props.dialog.isLoaded,
  isLoaded => {
    if (!isLoaded) return;
    scrollToTop();
  },
);

// onUpdated(() => {
//   if (isFirstLoadingMessages.value) {
//     scrollToTop();
//     isFirstLoadingMessages.value = false;
//   }
// });
</script>

<style scoped>
.message-container {
  min-height: 100%;
}
</style>
