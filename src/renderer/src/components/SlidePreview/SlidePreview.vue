<template>
  <section class="flex flex-col space-y-2 w-full">
    <section class="flex items-center justify-center space-x-3">
      <prime-button
        severity="secondary"
        icon="pi pi-step-backward"
        rounded
        v-tooltip.bottom="'Backward'"
        raised
        @click.prevent="
          () => {
            if (completed) {
              slidesStore.selectSlide(slidesStore.selectedIndex - 1, true);
            }
          }
        "
      />
      <prime-button
        severity="secondary"
        :icon="playing ? 'pi pi-pause' : 'pi pi-play'"
        rounded
        v-tooltip.bottom="playing ? 'Pause' : 'Play'"
        raised
        @click.prevent="
          () => {
            if (playing) {
              return;
            }
          }
        "
      />
      <prime-button
        severity="secondary"
        icon="pi pi-stop"
        rounded
        v-tooltip.bottom="'Stop'"
        raised
        @click.prevent="() => {}"
      />
      <prime-button
        severity="secondary"
        icon="pi pi-replay"
        rounded
        v-tooltip.bottom="'Replay'"
        raised
        @click.prevent="() => {}"
      />
      <prime-button
        severity="secondary"
        icon="pi pi-step-forward"
        rounded
        v-tooltip.bottom="'Forward'"
        raised
        @click.prevent="
          () => {
            if (completed) {
              slidesStore.selectSlide(slidesStore.selectedIndex + 1, true);
            }
          }
        "
      />
    </section>
    <code-window
      :code-area-size="codeAreaSize"
      :color="save.color"
      :language="save.language"
      @code-changed="
        () => {
          generateAndPlayAnimation();
        }
      "
      class="w-full"
    >
      <template #file-name>
        <span
          class="file-name"
          :style="{ width: `${save.fileName.length}ch` }"
          >{{ save.fileName }}</span
        >
      </template>
      <template #default>
        <span v-html="codeToDisplay"></span>
      </template>
    </code-window>
  </section>
</template>

<script lang="ts" src="./SlidePreview.ts"></script>
