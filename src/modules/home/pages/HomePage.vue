<template>
  <div class="fill-height d-flex flex-column align-center justify-center mx-auto w-20">
    <p class="text-h5">Здравствуйте, куда пойдем?</p>
    <div class="d-flex ma-2 justify-center align-center">
      <v-card class="mr-2" @click.prevent="$router.push({ name: PAGES.MESSANGER })">
        <v-card-title>
          <v-icon icon="mdi-chat" />
          Мессенджер
        </v-card-title>
      </v-card>
      <v-card @click.prevent="$router.push({ name: PAGES.DASHBOARD })">
        <v-card-title>
          <v-icon icon="mdi-view-dashboard" />
          Канбан доска
        </v-card-title>
      </v-card>
    </div>
  </div>
</template>
<script setup lang="ts">
import { PAGES } from "@/router/router.types";
</script>
