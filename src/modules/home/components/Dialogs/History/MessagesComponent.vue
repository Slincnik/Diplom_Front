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
        @contextmenu.prevent="RMBClick($event, item)"
      >
        <v-list-item-title class="text-wrap text-white text-right">
          {{ item.body }}
        </v-list-item-title>
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
    <v-menu
      v-model="showMenu"
      location="top"
      location-strategy="static"
      :style="{ left: menuSettings.x + 'px', top: menuSettings.y - 200 + 'px', maxHeight: '300px' }"
    >
      <v-list class="rounded-lg">
        <v-list-item class="onHover rounded-lg mx-1" v-for="item in menuItems" :key="item.id">
          <div class="d-flex" @click="item.clicked">
            <v-icon :icon="item.icon" />
            <span class="ml-2">
              {{ item.title }}
            </span>
          </div>
        </v-list-item>
      </v-list>
    </v-menu>
    <div ref="endMessagesRef" id="#scrollHere" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch, reactive } from "vue";
import useUserStore from "@/stores/user";
import type { Conversation, Group, Message, MessageGroup } from "@/modules/home/types/index.types";

const userStore = useUserStore();

const menuItemsOriginal = [
  {
    id: 1,
    title: "Ответить",
    icon: "mdi-reply",
    view: true,
    clicked: () => {
      console.log("hehe");
    },
  },
  {
    id: 2,
    title: "Изменить",
    icon: "mdi-pencil-outline",
    view: true,
    clicked: () => {
      console.log("hehe");
    },
  },
  {
    id: 3,
    title: "Копировать текст",
    icon: "mdi-content-copy",
    view: true,
    clicked: () => {
      console.log("hehe");
    },
  },
  {
    id: 4,
    title: "Удалить",
    icon: "mdi-delete",
    view: true,
    clicked: (item: Message | MessageGroup) => {
      console.log("hehe", item);
    },
  },
];

const endMessagesRef = ref<HTMLElement | null>(null);
const showMenu = ref(false);
const menuSettings = ref({
  x: 0,
  y: 0,
});
const menuItems = reactive([...menuItemsOriginal]);

watch(showMenu, value => {
  if (!value) {
    setTimeout(() => {
      Object.assign(menuItems, menuItemsOriginal);
    }, 300);
  }
});

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

const RMBClick = (event: MouseEvent, item: Message | MessageGroup) => {
  showMenu.value = false;
  menuSettings.value = {
    x: event.clientX,
    y: event.clientY,
  };

  menuItems.forEach(menu => {
    if (menu.id === 2 && item.sender.id !== user?.id) {
      menuItems.splice(
        menuItems.findIndex(menu => menu.id === 2),
        1,
      );
    }

    if (menu.id === 4 && item.sender.id !== user?.id)
      menuItems.splice(
        menuItems.findIndex(menu => menu.id === 4),
        1,
      );

    menu.clicked.bind(item);
  });

  nextTick(() => {
    showMenu.value = true;
  });
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
.onHover:hover {
  background-color: rgb(45, 45, 45);
}
.onHover {
  cursor: pointer;
}
</style>
