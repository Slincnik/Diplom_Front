<template>
  <div class="fill-height d-flex justify-center align-center">
    <v-sheet rounded elevation="5" min-width="300" max-width="500" class="pa-6 mx-auto">
      <p class="text-h5 text-center pb-3">Вход</p>
      <v-form ref="form" :disabled="isLoading" @submit.prevent="onSubmit">
        <v-text-field
          class="pb-2"
          rounded
          variant="outlined"
          v-model="data.login"
          :rules="[rules.required]"
          label="Логин"
        ></v-text-field>

        <v-text-field
          rounded
          variant="outlined"
          :type="showPassword ? 'text' : 'password'"
          v-model="data.password"
          :rules="[rules.required]"
          label="Пароль"
          :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
          @click:append-inner="showPassword = !showPassword"
        ></v-text-field>

        <v-btn type="submit" border="md" :loading="isLoading" block class="mt-2 bg-transparent">Войти</v-btn>
      </v-form>
      <div class="mt-2">
        <p class="text-body-2 text-center">
          Не имеете аккаунта?
          <router-link :to="{ name: PAGES.REGISTRATION }" class="bg-transparent">Зарегистрироваться</router-link>
        </p>
      </div>
    </v-sheet>
  </div>
</template>
<script setup lang="ts">
import { shallowReactive, ref } from "vue";
import { useRouter } from "vue-router";
import useUserStore from "@/stores/user";
import type { Form } from "../types/form.type";
import { rules } from "../utils/rules";
import { PAGES } from "@/router/router.types";

const data = shallowReactive({
  login: "",
  password: "",
});

const showPassword = ref(false);

const form = ref<Form | null>(null);

const isLoading = ref(false);

const router = useRouter();

const userStore = useUserStore();

const onSubmit = async () => {
  try {
    if (!form.value) return;

    const { valid } = await form.value.validate();

    if (!valid) return;

    isLoading.value = true;

    await userStore.login(data);
    router.push("/");
  } catch (error) {
    !import.meta.env.PROD && console.log(error);
  } finally {
    isLoading.value = false;
  }
};
</script>
