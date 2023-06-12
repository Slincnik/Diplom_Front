<template>
  <div class="message-container d-flex flex-column justify-end w-50" ref="messagesRef">
    <v-fade-transition group>
      <v-list-item
        @click.prevent="consoled"
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
      </v-list-item>
    </v-fade-transition>
  </div>
</template>

<script setup lang="ts">
import { onUpdated, ref, onMounted, nextTick } from "vue";
import useUserStore from "@/stores/user";
import type { Conversation, Group } from "@/modules/home/types/index.types";

const userStore = useUserStore();

const messagesRef = ref<HTMLElement | null>(null);
const isFirstLoadingMessages = ref(true);

const user = userStore.getUser;

const props = defineProps<{
  scrollRef: HTMLElement | null;
  dialog: Conversation | Group;
}>();

const formatDate = (value: string) => {
  return Intl.DateTimeFormat(navigator.language, {
    day: "numeric",
    year: "numeric",
    month: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  }).format(new Date(value));
};

const scrollToTop = (behavior: "auto" | "smooth" = "auto") => {
  if (messagesRef.value) {
    const messages = messagesRef.value;
    nextTick(() => {
      messages.scrollIntoView({
        block: "end",
        behavior,
      });
    });
  }
};

const consoled = () => {
  const messages = props.scrollRef;
  messages?.scrollTo({
    top: 156,
    behavior: "smooth",
  });
};

onMounted(scrollToTop);

onUpdated(() => {
  nextTick(() => {
    if (isFirstLoadingMessages.value) {
      scrollToTop();
      isFirstLoadingMessages.value = false;
    }
  });
});
</script>

<style scoped>
.message-container {
  min-height: 100%;
}
</style>
