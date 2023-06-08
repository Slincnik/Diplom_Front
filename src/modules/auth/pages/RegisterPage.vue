<template>
  <v-sheet rounded elevation="5" min-width="300" max-width="400" width="400" class="pa-6 mx-auto">
    <p class="text-h5 text-center pb-3">Регистрация</p>
    <v-form ref="form" :disabled="isLoading" @submit.prevent="onSubmit">
      <v-text-field
        rounded
        type="input"
        class="pb-2"
        variant="outlined"
        label="Login"
        v-model="data.login"
        :rules="[rules.required, rules.min5]"
      />

      <v-text-field
        rounded
        class="pb-2"
        type="email"
        variant="outlined"
        label="Email"
        placeholder="email@mail.ru"
        v-model="data.email"
        :rules="[rules.required, rules.email]"
      />

      <v-text-field
        rounded
        type="input"
        class="pb-2"
        variant="outlined"
        label="Имя"
        v-model="data.name"
        :rules="[rules.required]"
      />

      <v-text-field
        rounded
        class="pb-2"
        variant="outlined"
        label="Пароль"
        v-model="data.password"
        :rules="[rules.required, rules.min8]"
        :type="showPassword ? 'text' : 'password'"
        :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
        @click:append-inner="showPassword = !showPassword"
      />

      <v-text-field
        rounded
        variant="outlined"
        label="Подтверждение пароля"
        v-model="data.password_confirmation"
        :rules="[rules.required, passwordConfirm]"
        :type="showConfirmedPassword ? 'text' : 'password'"
        :append-inner-icon="showConfirmedPassword ? 'mdi-eye' : 'mdi-eye-off'"
        @click:append-inner="showConfirmedPassword = !showConfirmedPassword"
      />

      <v-btn type="submit" border="md" :loading="isLoading" block class="mt-2 bg-transparent">
        Зарегистрироваться
      </v-btn>
    </v-form>
    <div class="mt-2">
      <p class="text-body-2 text-center">
        Имеете аккаунт?
        <router-link :to="{ name: 'auth.register' }" class="bg-transparent">Войти</router-link>
      </p>
    </div>
  </v-sheet>
</template>
<script setup lang="ts">
import { shallowReactive, ref } from "vue";
import { useRouter } from "vue-router";
import useUserStore from "@/stores/user";
import type { Form } from "../types/form.type";
import { rules } from "../utils/rules";

const data = shallowReactive({
  login: "",
  email: "",
  name: "",
  password: "",
  password_confirmation: "",
});

const showPassword = ref(false);
const showConfirmedPassword = ref(false);

const passwordConfirm = (value: string) => data.password === value || "Пароли не совпадают";

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

    await userStore.register(data);
    router.push("/");
  } catch (error) {
    !import.meta.env.PROD && console.log(error);
  } finally {
    isLoading.value = false;
  }
};
</script>
