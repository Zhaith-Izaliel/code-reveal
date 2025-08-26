<template>
  <div
    class="relative bg-white/80 dark:bg-black/80 rounded-xl"
    @click.prevent="emit('select', index)"
  >
    <img
      class="w-full h-preview-slide"
      :src="thumbnail"
      alt="Preview"
      v-if="thumbnail"
    />
    <div
      v-else
      :style="{
        backgroundColor: config.thumbnail.backgroundColor(theme),
      }"
      class="h-preview-slide rounded-xl"
    ></div>
    <header
      class="absolute w-1/2 xl:w-2/5 top-0 right-0 p-2 flex justify-end space-x-2 text-surface-800 dark:text-surface-400 text-xs"
    >
      <prime-button
        icon="pi pi-chevron-down"
        variant="text"
        severity="secondary"
        class="h-6"
        v-tooltip.bottom="'Move down'"
        @click.prevent="
          () => {
            emit('move-down', index);
          }
        "
      />
      <prime-button
        icon="pi pi-chevron-up"
        variant="text"
        severity="secondary"
        class="h-6"
        v-tooltip.bottom="'Move up'"
        @click.prevent="
          () => {
            emit('move-up', index);
          }
        "
      />
      <prime-button
        icon="pi pi-clone"
        variant="text"
        severity="secondary"
        class="h-6"
        v-tooltip.bottom="'Duplicate'"
        @click.prevent="
          () => {
            emit('duplicate', index);
          }
        "
      />
      <prime-button
        icon="pi pi-trash"
        variant="text"
        severity="secondary"
        class="h-6"
        v-tooltip.bottom="'Delete'"
        @click.prevent="
          () => {
            emit('delete', index);
          }
        "
      />
    </header>
    <footer
      class="absolute w-1/6 right-0 bottom-0 flex justify-end p-3 text-sm"
    >
      {{ index + 1 }}
    </footer>
  </div>
</template>
<script lang="ts" setup>
import { Button as PrimeButton } from "primevue";
import { useTheme } from "@renderer/hooks";

const { config } = window;

const { theme } = useTheme();

defineProps<{
  thumbnail?: string;
  index: number;
}>();

const emit = defineEmits<{
  (e: "delete", index: number): void;
  (e: "duplicate", index: number): void;
  (e: "select", index: number): void;
  (e: "move-up", index: number): void;
  (e: "move-down", index: number): void;
}>();
</script>
