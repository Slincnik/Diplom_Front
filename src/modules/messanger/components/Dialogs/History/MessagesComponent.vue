<template>
  <div class="message-container d-flex flex-column justify-end">
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
        @contextmenu.prevent="(event: MouseEvent) => RMBClick(event, item)"
      >
        <div v-if="dialog.type === 'group' && item.sender.id !== user?.id" class="text-wrap text-left text-white">
          {{ item.sender.fullname }}
        </div>
        <v-list-item v-if="item.response" class="pl-2 pr-0 itemReply">
          <v-list-item-title class="text-white text-wrap">
            {{ item.response.sender.fullname }}
          </v-list-item-title>
          <v-list-item-subtitle class="text-white text-high-emphasis text-wrap">
            {{ item.response.body }}
          </v-list-item-subtitle>
        </v-list-item>
        <v-list-item-title class="text-wrap text-left text-white">
          {{ item.body }}
        </v-list-item-title>
        <v-list-item-subtitle>
          <div
            class="d-flex"
            :class="{
              'flex-row-reverse justify-end': item.sender.id !== user?.id,
              'flor-row justify-end': item.sender.id === user?.id,
            }"
          >
            <p
              v-if="isUpdating(item)"
              class="text-white"
              :class="{
                'text-right mr-1': item.sender.id === user?.id,
                'text-left ml-1': item.sender.id !== user?.id,
              }"
            >
              Изменено
            </p>
            <p
              class="text-white"
              :class="{
                'text-right': item.sender.id === user?.id,
                'text-left': item.sender.id !== user?.id,
              }"
            >
              {{ formatDate(item.created_at) }}
            </p>
          </div>
        </v-list-item-subtitle>
      </v-list-item>
    </v-fade-transition>
    <v-menu
      v-model="showMenu"
      origin="left"
      location-strategy="static"
      max-height="220"
      max-width="192"
      min-height="220"
      min-width="192"
      :style="{ left: menuSettings.x - 80 + 'px', top: menuSettings.y - 200 + 'px', maxHeight: '300px' }"
    >
      <v-list class="rounded-lg">
        <v-list-item class="onHover rounded-lg mx-1" v-for="item in menuItems" :key="item.id">
          <div class="d-flex" @click.prevent="menuClicked(item.type as 'reply' | 'delete' | 'copy')">
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
import { ref, onMounted, nextTick, watch, reactive, computed } from "vue";
import { POSITION, useToast } from "vue-toastification";
import useUserStore from "@/stores/user";
import useDialogsStore from "@/stores/dialogs";

//Types
import type { Conversation, Group, Message, MessageGroup } from "@/modules/messanger/types/index.types";

const props = defineProps<{
  scrollRef: HTMLElement | null;
  dialog: Conversation | Group;
}>();

const emit = defineEmits<{
  (e: "editMessage", value: { message: Message | MessageGroup; isEditing: boolean }): void;
  (e: "replyMessage", value: { message: Message | MessageGroup; isReply: boolean }): void;
}>();

const menuItemsOriginal = [
  {
    id: 1,
    title: "Ответить",
    icon: "mdi-reply",
    type: "reply",
  },
  {
    id: 2,
    title: "Изменить",
    icon: "mdi-pencil-outline",
    type: "edit",
  },
  {
    id: 3,
    title: "Копировать текст",
    icon: "mdi-content-copy",
    type: "copy",
  },
  {
    id: 4,
    title: "Удалить",
    icon: "mdi-delete",
    type: "delete",
  },
];

const userStore = useUserStore();
const dialogsStore = useDialogsStore();
const toast = useToast();

const endMessagesRef = ref<HTMLElement | null>(null);
const showMenu = ref(false);
const menuSettings = ref({
  x: 0,
  y: 0,
});
const menuItems = reactive([...menuItemsOriginal]);
const currentItem = ref<Message | MessageGroup | null>(null);

const user = computed(() => userStore.getUser);

const isUpdating = computed(() => {
  return (item: Message | MessageGroup) => new Date(item.created_at).getTime() !== new Date(item.updated_at).getTime();
});

watch(showMenu, value => {
  if (!value) {
    setTimeout(() => {
      Object.assign(menuItems, menuItemsOriginal);
    }, 300);
  }
});

watch(props.dialog.messages, () => {
  let a = props.scrollRef!.scrollTop;
  let b = props.scrollRef!.scrollHeight - props.scrollRef!.clientHeight;
  let c = a / b;

  if (c === 1) {
    scrollToTop("smooth");
  }
});

watch(
  () => props.dialog.isLoaded,
  isLoaded => {
    if (!isLoaded) return;
    scrollToTop();
  },
);

const menuClicked = async (event: "delete" | "edit" | "copy" | "reply") => {
  if (!currentItem.value) return;

  if (event === "delete") {
    await dialogsStore.deleteMessage(currentItem.value.id);
  }

  if (event === "edit") {
    emit("editMessage", { message: currentItem.value, isEditing: true });
  }

  if (event === "copy") {
    const error = ref(false);
    const unsecuredCopyToClipboard = (text: string) => {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
    };

    if (window.isSecureContext && navigator.clipboard) {
      navigator.clipboard.writeText(currentItem.value.body);
    } else {
      try {
        unsecuredCopyToClipboard(currentItem.value.body);
      } catch (e) {
        error.value = true;
        console.error("Error to copy to clipboard");
      }
    }

    if (error.value) return;

    toast.info("Сохранено в буфер обмена", {
      position: POSITION.TOP_CENTER,
    });
  }

  if (event === "reply") {
    emit("replyMessage", { message: currentItem.value, isReply: true });
  }

  currentItem.value = null;
};

const formatDate = (value: string) => {
  return Intl.DateTimeFormat(navigator.language, {
    hour: "numeric",
    minute: "numeric",
  }).format(new Date(value));
};

const RMBClick = (event: MouseEvent, item: Message | MessageGroup) => {
  menuSettings.value = {
    x: event.clientX,
    y: event.clientY,
  };

  currentItem.value = item;

  Object.assign(menuItems, menuItemsOriginal);

  menuItems.forEach(menu => {
    if (menu.id === 2 && item.sender.id !== user.value?.id) {
      menuItems.splice(
        menuItems.findIndex(menu => menu.id === 2),
        1,
      );
    }

    if (menu.id === 4 && item.sender.id !== user.value?.id)
      menuItems.splice(
        menuItems.findIndex(menu => menu.id === 4),
        1,
      );
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
</script>

<style scoped>
.itemReply::before {
  content: "";
  display: block;
  position: absolute;
  top: 0.3125rem;
  bottom: 0.3125rem;
  width: 2px;
  background: white;
  border-radius: 2px;
}
.message-container {
  min-height: 100%;
  width: 100%;
  background-color: transparent;
  max-width: 37rem;
  margin: 0 auto;
}
.onHover:hover {
  background-color: rgb(45, 45, 45);
  color: white;
}
.onHover {
  cursor: pointer;
}
</style>
