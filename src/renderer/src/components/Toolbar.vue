<template>
  <header
    class="flex flex-col items-center justify-center w-full my-4 space-y-2"
  >
    <section class="flex items-center justify-center w-full">
      <select-button
        v-model="mode"
        :options="modes"
        optionLabel="label"
        optionValue="value"
        optionDisabled="disabled"
        :allow-empty="false"
      >
        <template #option="{ option }">
          <p v-if="!option.disabled" v-tooltip.bottom="option.description">
            <i :class="`${option.icon} pr-1`"></i>
            {{ option.label }}
          </p>
          <p v-else>
            <i :class="`${option.icon} pr-1`"></i>
            {{ option.label }}
          </p>
        </template>
      </select-button>
    </section>
    <section class="flex justify-center items-center w-full">
      <section
        class="flex items-center justify-center space-x-3 pr-6 mr-6 border-r border-surface-400 dark:border-surface-600"
      >
        <!-- Same button -->
        <prime-button
          v-if="slidesNumber === 0"
          severity="primary"
          :label="openButton.label"
          :icon="openButton.icon"
          raised
          @click.prevent="openButton.command"
        />
        <split-button
          v-else
          severity="primary"
          label="Save"
          icon="pi pi-save"
          :model="saveMenuItems"
          raised
          @click.prevent="() => emit('save')"
        />
      </section>
      <section class="flex items-center justify-center space-x-3">
        <template v-if="mode === 'preview'">
          <prime-button
            severity="secondary"
            icon="pi pi-step-backward"
            rounded
            v-tooltip.bottom="'Backward'"
            raised
            @click.prevent="() => emit('prevSlide')"
          />
          <prime-button
            severity="secondary"
            icon="pi pi-play"
            rounded
            v-tooltip.bottom="'Play'"
            raised
            @click.prevent="() => emit('play')"
          />
          <prime-button
            severity="secondary"
            icon="pi pi-pause"
            rounded
            v-tooltip.bottom="'Pause'"
            raised
            @click.prevent="() => emit('pause')"
          />
          <prime-button
            severity="secondary"
            icon="pi pi-stop"
            rounded
            v-tooltip.bottom="'Stop'"
            raised
            @click.prevent="() => emit('stop')"
          />
          <prime-button
            severity="secondary"
            icon="pi pi-replay"
            rounded
            v-tooltip.bottom="'Replay'"
            raised
            @click.prevent="() => emit('replay')"
          />
          <prime-button
            severity="secondary"
            icon="pi pi-step-forward"
            rounded
            v-tooltip.bottom="'Forward'"
            raised
            @click.prevent="() => emit('nextSlide')"
          />
        </template>
        <template v-else>
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
        </template>
      </section>
    </section>
  </header>
</template>

<script lang="ts" setup>
import { Mode, ModeOption } from "@renderer/types";
import { Button as PrimeButton, SplitButton, SelectButton } from "primevue";
import { useConfirm } from "primevue/useconfirm";

const confirm = useConfirm();

const mode = defineModel<Mode>("mode");

defineProps<{
  slidesNumber: number;
  modes: ModeOption[];
}>();

const emit = defineEmits([
  // Slides
  "undo",
  "redo",
  "clear",
  // Language
  "changeLanguage",
  // Preview
  "nextSlide",
  "prevSlide",
  // Save
  "save",
  "saveAs",
  "openSave",
  "exportVideo",
  // Animations
  "animationSettings",
  "play",
  "pause",
  "replay",
  "stop",
]);

const openButton = {
  label: "Open",
  icon: "pi pi-file-import",
  command: () => emit("openSave"),
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
    label: "Save as",
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
  openButton,
];
</script>
