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
      class="h-4 absolute w-1/3 top-0 right-0 p-2 flex justify-end space-x-2 text-zinc-800 dark:text-zinc-400 text-xs"
    >
      <secondary-button
        variant="text"
        raised
        icon="pi pi-clone"
        class="h-full w-6!"
        @click.prevent="
          () => {
            emit('duplicate', index);
          }
        "
      />
      <secondary-button
        variant="text"
        raised
        icon="pi pi-trash"
        class="h-full w-6!"
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
import SecondaryButton from "@renderer/volt/SecondaryButton.vue";
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
