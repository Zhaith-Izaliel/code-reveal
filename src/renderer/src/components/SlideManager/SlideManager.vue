<template>
  <main class="flex h-full w-full">
    <aside
      :class="[
        `min-h-screen h-full w-2/7 xl:w-1/7 bg-surface-100/80 dark:bg-surface-800/80 backdrop-blur-lg p-4 flex flex-col`,
        {
          'opacity-20 pointer-events-none': isPreview,
        },
      ]"
    >
      <section class="flex items-center justify-center mb-6">
        <!-- Same button -->
        <prime-button
          v-if="slidesStore.slides.length === 0"
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
          @click.prevent="
            async () => {
              await writeSave(saveLocation);
            }
          "
        />
      </section>
      <draggable :list="slidesStore.slides" class="space-y-4 mb-4">
        <article
          :key="i"
          v-for="(slide, i) in slidesStore.slides"
          v-if="slidesStore.slides.length > 0"
          :class="[
            `p-0 border rounded-xl w-full cursor-pointer shadow shadow-black/30 dark:shadow-black/80`,
            {
              'border-surface-300 dark:border-surface-800':
                slidesStore.selectedIndex !== i,
              'border-primary-500 border-2': slidesStore.selectedIndex === i,
            },
          ]"
        >
          <slide-thumbnail
            @delete="slidesStore.deleteSlide"
            @duplicate="slidesStore.duplicateSlide"
            @select="slidesStore.selectSlide"
            @move-down="
              (i: number) => {
                slidesStore.swapSlides(i, i + 1);
              }
            "
            @move-up="
              (i: number) => {
                slidesStore.swapSlides(i, i - 1);
              }
            "
            :index="i"
            :thumbnail="slide.thumbnail"
          ></slide-thumbnail>
        </article>
      </draggable>
      <footer class="text-2xl backdrop-blur-2xl h-preview-slide rounded-xl">
        <prime-button
          @click.prevent="slidesStore.createSlide"
          severity="secondary"
          v-tooltip.bottom="'Add a new slide'"
          raised
          icon="pi pi-plus"
          class="h-full w-full! p-0"
        />
      </footer>
    </aside>
    <section class="w-5/7 xl:w-6/7 h-full px-6 xl:px-12">
      <header class="flex items-center justify-center w-full my-4 space-y-2">
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
      </header>
      <template v-if="slidesStore.slides[slidesStore.selectedIndex]">
        <slide
          v-if="!isPreview"
          v-model:code-area-size="codeAreaSize"
          class="w-full xl:w-1/2 m-auto mt-8"
        />
        <slide-preview
          v-else
          :code-area-size="codeAreaSize"
          class="w-full xl:w-1/2 m-auto mt-8"
        />
      </template>
    </section>
  </main>
</template>

<script lang="ts" src="./SlideManager.ts"></script>
