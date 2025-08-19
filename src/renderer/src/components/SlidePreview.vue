<template>
  <div class="relative" @click.prevent="emit('select', index)">
    <img
      class="w-full rounded-xl h-preview-slide"
      :src="preview"
      alt="Preview"
      v-if="preview"
    />
    <div
      v-else
      :style="{
        backgroundColor: config.preview.backgroundColor(theme),
      }"
      class="rounded-xl h-preview-slide"
    ></div>
    <header
      class="absolute w-1/3 top-0 right-0 p-2 flex justify-end space-x-2 text-zinc-800 dark:text-zinc-400 text-xs"
    >
      <prime-button
        icon="pi pi-clone"
        variant="text"
        severity="secondary"
        raised
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
        raised
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
  preview?: string;
  index: number;
}>();

const emit = defineEmits<{
  (e: "delete", index: number): void;
  (e: "duplicate", index: number): void;
  (e: "select", index: number): void;
}>();
</script>
