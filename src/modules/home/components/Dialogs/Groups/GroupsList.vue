<template>
  <v-virtual-scroll :items="groups" item-height="40" height="822">
    <template #default="{ item: group }: { item: Group }">
      <v-list-item
        @click.prevent="clicked(group.id)"
        :class="{
          'v-list-item--active': group.id == selectedItem,
        }"
      >
        <v-list-item-title> {{ group.name }}</v-list-item-title>
        <v-list-item-subtitle> Test </v-list-item-subtitle>
        <template v-slot:prepend>
          <v-avatar size="large" color="brown">
            <span class="text-h5">{{ group.name.charAt(0) }}</span>
          </v-avatar>
        </template>
      </v-list-item>
      <v-divider />
    </template>
  </v-virtual-scroll>
</template>

<script setup lang="ts">
import { ref } from "vue";
import type { Group } from "@/modules/home/types/index.types";

const selectedItem = ref(0);

defineProps<{
  groups: Group[];
}>();

const clicked = (id: number) => {
  console.log(id, "По мне кликнули");
  selectedItem.value = id;
};
</script>
