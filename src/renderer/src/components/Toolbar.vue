<template>
  <header class="flex items-center justify-center w-full my-4">
    <section
      :class="[
        `flex items-center justify-center space-x-3`,
        {
          'pr-6 mr-6 border-r border-surface-400 dark:border-surface-600':
            !isPreview,
        },
      ]"
    >
      <prime-button
        v-if="isPreview"
        severity="secondary"
        icon="pi pi-chevron-left"
        rounded
        v-tooltip.bottom="'Previous slide'"
        raised
        @click.prevent="() => emit('prevSlide')"
      />
      <!-- Same button -->
      <split-button
        v-if="!isPreview"
        label="Preview"
        icon="pi pi-eye"
        :model="previewMenuItems"
        :disabled="slidesNumber < 2"
        raised
        @click.prevent="() => emit('preview')"
      />
      <split-button
        v-else
        label="Exit preview"
        icon="pi pi-eye-slash"
        :model="previewMenuItems"
        :disabled="slidesNumber === 0"
        raised
        @click.prevent="() => emit('endPreview')"
      />
      <prime-button
        v-if="slidesNumber === 0"
        severity="secondary"
        :label="importButton.label"
        :icon="importButton.icon"
        raised
        @click.prevent="importButton.command"
      />
      <split-button
        v-else
        severity="secondary"
        label="Save"
        icon="pi pi-save"
        :model="saveMenuItems"
        raised
        @click.prevent="() => emit('save')"
      />
      <prime-button
        v-if="isPreview"
        severity="secondary"
        icon="pi pi-chevron-right"
        rounded
        v-tooltip.bottom="'Next slide'"
        raised
        @click.prevent="() => emit('nextSlide')"
      />
    </section>
    <section
      v-if="!isPreview"
      class="flex items-center justify-center space-x-3"
    >
      <prime-button
        severity="secondary"
        v-tooltip.bottom="'Undo'"
        raised
        rounded
        icon="pi pi-undo"
        :disabled="slidesNumber === 0"
        @click.prevent="() => emit('undo')"
      />
      <prime-button
        severity="secondary"
        v-tooltip.bottom="'Redo'"
        raised
        rounded
        icon="pi pi-refresh"
        :disabled="slidesNumber === 0"
        @click.prevent="() => emit('redo')"
      />
      <prime-button
        severity="secondary"
        v-tooltip.bottom="'Change language'"
        raised
        rounded
        icon="pi pi-code"
        @click.prevent="() => emit('changeLanguage')"
      />
      <prime-button
        severity="secondary"
        v-tooltip.bottom="'Animation Settings'"
        raised
        rounded
        icon="pi pi-sliders-h"
        :disabled="slidesNumber === 0"
        @click.prevent="() => emit('animationSettings')"
      />
      <prime-button
        severity="danger"
        v-tooltip.bottom="'Clear all slides'"
        raised
        rounded
        icon="pi pi-eraser"
        :disabled="slidesNumber === 0"
        @click.prevent="confirmClear"
      />
    </section>
  </header>
</template>

<script lang="ts" setup>
import { Button as PrimeButton, SplitButton } from "primevue";
import { useConfirm } from "primevue/useconfirm";

const confirm = useConfirm();

defineProps<{
  slidesNumber: number;
  isPreview: boolean;
}>();

const emit = defineEmits([
  "undo",
  "redo",
  "clear",
  "save",
  "saveAs",
  "preview",
  "endPreview",
  "importSlides",
  "exportVideo",
  "autoPlay",
  "changeLanguage",
  "animationSettings",
  "nextSlide",
  "prevSlide",
]);

const previewMenuItems = [
  {
    label: "Auto-play",
    icon: "pi pi-play-circle",
    command: () => emit("autoPlay"),
  },
];

const importButton = {
  label: "Import",
  icon: "pi pi-file-import",
  command: () => emit("importSlides"),
};

const confirmClear = () => {
  confirm.require({
    message: "This action will delete all the slides in the presentation.",
    header: "Confirmation",
    icon: "pi pi-exclamation-triangle",
    rejectProps: {
      label: "Cancel",
      severity: "secondary",
      outlined: true,
    },
    acceptProps: {
      label: "Delete",
      severity: "danger",
    },
    accept: () => emit("clear"),
  });
};

const saveMenuItems = [
  {
    label: "Save to location",
    icon: "pi pi-file-export",
    command: () => emit("saveAs"),
  },
  {
    label: "Export video",
    icon: "pi pi-video",
    command: () => emit("exportVideo"),
  },
  {
    separator: true,
  },
  importButton,
];
</script>
