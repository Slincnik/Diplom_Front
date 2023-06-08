<template>
  <div class="d-flex align-center justify-center h-screen">
    <v-sheet rounded elevation="5" min-width="250" width="20%" class="pa-6 mx-auto">
      <p class="text-h5 text-center pb-3">Вход</p>
      <v-form ref="form" @submit.prevent="onSubmit">
        <v-text-field
          class="pb-2"
          rounded
          variant="outlined"
          v-model="data.login"
          :rules="[rules.required]"
          label="Логин"
          :disabled="isLoading"
          required
        ></v-text-field>

        <v-text-field
          rounded
          variant="outlined"
          type="password"
          v-model="data.password"
          :rules="[rules.required]"
          label="Пароль"
          :disabled="isLoading"
          required
        ></v-text-field>

        <a href="#" class="text-body-2 bg-transparent font-weight-regular float-sm-none">Забыли пароль?</a>

        <v-btn type="submit" border="md" :loading="isLoading" block class="mt-2 bg-transparent">Войти</v-btn>
      </v-form>
      <div class="mt-2">
        <p class="text-body-2">Не имеете аккаунта? <a href="#" class="bg-transparent">Зарегистрироваться</a></p>
      </div>
    </v-sheet>
  </div>
</template>
<script setup lang="ts">
import { shallowReactive, ref } from "vue";
import { useRouter } from "vue-router";
import useUserStore from "@/stores/user";

const data = shallowReactive({
  login: "",
  password: "",
});

const form = ref<{
  id: string | number;
  validate: () => Promise<{
    valid: boolean;
    errors: { id: string | number; errorMessages: string[] }[];
  }>;
  reset: () => void;
  resetValidation: () => void;
  isValid: boolean;
  errorMessages: string[];
} | null>(null);

const isLoading = ref(false);

const rules = {
  required: (value: string) => !!value || "Введите это поле",
};

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
