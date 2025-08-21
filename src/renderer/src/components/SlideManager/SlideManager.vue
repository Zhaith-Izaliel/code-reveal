<template>
  <main class="flex h-full w-full">
    <aside
      :class="[
        `min-h-screen h-full w-3/8 xl:w-1/6 bg-surface-100/80 dark:bg-surface-800/80 backdrop-blur-lg p-4 flex flex-col`,
        {
          'opacity-20 pointer-events-none': isPreview,
        },
      ]"
    >
      <header class="flex items-center justify-center mb-4"></header>
      <draggable :list="slides" class="space-y-4 mb-4">
        <article
          :key="i"
          v-for="(slide, i) in slides"
          v-if="slides.length > 0"
          :class="[
            `p-0 border rounded-xl w-full cursor-pointer shadow shadow-black/30 dark:shadow-black/80`,
            {
              'border-surface-300 dark:border-surface-800': selectedIndex !== i,
              'border-primary-500 border-2': selectedIndex === i,
            },
          ]"
        >
          <slide-thumbnail
            @delete="deleteSlide"
            @duplicate="duplicateSlide"
            @select="selectSlide"
            @move-down="
              (i: number) => {
                swapSlides(i, i + 1);
              }
            "
            @move-up="
              (i: number) => {
                swapSlides(i, i - 1);
              }
            "
            :index="i"
            :thumbnail="slide.thumbnail"
          ></slide-thumbnail>
        </article>
      </draggable>
      <footer class="text-2xl backdrop-blur-2xl h-preview-slide rounded-xl">
        <prime-button
          @click.prevent="createSlide"
          severity="secondary"
          v-tooltip.bottom="'Add a new slide'"
          raised
          icon="pi pi-plus"
          class="h-full w-full! p-0"
        />
      </footer>
    </aside>
    <section class="w-full h-full px-12">
      <slide-manager-tools
        :slides-number="slides.length"
        :is-preview="isPreview"
        @clear="clearSlides"
        @preview="togglePreview(true)"
        @end-preview="togglePreview(false)"
        @next-slide="selectSlide(selectedIndex + 1, true)"
        @prev-slide="selectSlide(selectedIndex - 1, true)"
      />
      <slide
        v-if="slides[selectedIndex]"
        v-model:code="slides[selectedIndex].code"
        v-model:file-name="fileName"
        v-model:color="color"
        v-model:thumbnail="slides[selectedIndex].thumbnail"
        :is-preview="isPreview"
        :generate-thumbnail="!isPreview"
        :language="language"
        :slides-to-animate="slides"
        class="xl:w-2/5 m-auto mt-8"
      />
    </section>
  </main>
</template>

<script lang="ts" src="./SlideManager.ts"></script>
