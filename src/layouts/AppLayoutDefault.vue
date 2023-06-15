<template>
  <v-app>
    <v-app-bar density="comfortable" :elevation="2" rounded>
      <v-app-bar-title>
        <v-btn variant="text" size="large" @click="$router.push({ name: PAGES.HOME })">Home</v-btn>
      </v-app-bar-title>
      <template v-slot:append>
        <v-btn class="mr-2" :icon="darkMode ? 'mdi-weather-night' : 'mdi-weather-sunny'" @click="toggleTheme" />
        <v-menu v-if="user" rounded min-width="200px">
          <template v-slot:activator="{ props }">
            <v-btn icon v-bind="props">
              <v-avatar color="brown" size="large">
                <span class="text-h5">{{ getInitials(user.fullname) }}</span>
              </v-avatar>
            </v-btn>
          </template>
          <v-card>
            <v-card-text>
              <div class="mx-auto text-center">
                <v-avatar size="large" color="brown">
                  <span class="text-h5">{{ getInitials(user.fullname) }}</span>
                </v-avatar>
                <h4 class="mt-2">{{ user.fullname }}</h4>
                <p class="text-caption mt-2" style="cursor: pointer" @click.prevent="copyLogin(user.login)">
                  {{ user.login }}
                </p>
                <v-divider class="my-3"></v-divider>
                <v-btn rounded variant="text" to="/logout"> Выйти </v-btn>
              </div>
            </v-card-text>
          </v-card>
        </v-menu>
      </template>
    </v-app-bar>
    <v-main>
      <slot />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { storeToRefs } from "pinia";
import { POSITION, useToast } from "vue-toastification";
import useUserStore from "@/stores/user";
import { PAGES } from "@/router/router.types";
import { useTheme } from "vuetify/lib/framework.mjs";
import { useStorage } from "@vueuse/core";

const toast = useToast();
const theme = useTheme();

const userStore = useUserStore();
const { user } = storeToRefs(userStore);

const darkMode = ref(false);
const currentTheme = useStorage("theme", "dark");

const getInitials = (fullname: string) => {
  return fullname
    .split(" ")
    .map(name => name[0])
    .join("")
    .toUpperCase();
};

const copyLogin = (login: string) => {
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
    navigator.clipboard.writeText(login);
  } else {
    try {
      unsecuredCopyToClipboard(login);
    } catch (e) {
      error.value = true;
      console.error("Error to copy to clipboard");
    }
  }

  if (error.value) return;

  toast.info("Сохранено в буфер обмена", {
    position: POSITION.BOTTOM_RIGHT,
  });
};

const toggleTheme = () => {
  darkMode.value = !darkMode.value;
  theme.global.name.value = darkMode.value ? "dark" : "light";
  currentTheme.value = theme.global.name.value;
};

onMounted(() => {
  darkMode.value = currentTheme.value === "dark";
  theme.global.name.value = darkMode.value ? "dark" : "light";
});
</script>
