<template>
  <div class="d-flex flex-column overflow-y-auto w-50" ref="messagesRef">
    <MessageComponent v-for="item in messages" :key="item.id" :item="item" :userId="user!.id" />
  </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref } from "vue";
import useUserStore from "@/stores/user";

import MessageComponent from "./Message/MessageComponent.vue";

import type { Message, MessageGroup } from "@/modules/home/types/index.types";

const userStore = useUserStore();

const user = userStore.getUser;

const messagesRef = ref<HTMLElement | null>(null);

defineProps<{
  messages: Message[] | MessageGroup[];
}>();

onMounted(async () => {
  if (messagesRef.value) {
    const messages = messagesRef.value;
    nextTick(() => {
      messages.scrollIntoView({ block: "end", behavior: "auto" });
    });
  }
});
</script>
