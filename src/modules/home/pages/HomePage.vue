<template>
  <v-row no-gutters class="bg-default fill-height border rounded-lg">
    <v-col sm="2">
      <Sidebar />
    </v-col>
    <v-divider vertical />
    <v-col sm="10"> test </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import Sidebar from "../components/Dialogs/SidebarComponent.vue";
import useDialogsStore from "@/stores/dialogs";

const dialogsStore = useDialogsStore();

onMounted(dialogsStore.fetchDialogs);
</script>
