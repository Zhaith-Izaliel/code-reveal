<template>
  <prime-dialog
    v-model:visible="changeLanguageModalVisible"
    modal
    header="Change language"
    class="w-[25rem]"
  ></prime-dialog>
  <main class="flex h-full w-full">
    <aside
      :class="[
        `min-h-screen h-full w-1/3 xl:w-1/5 bg-surface-100/80 dark:bg-surface-800/80 backdrop-blur-lg p-4 flex flex-col`,
        {
          'opacity-20 pointer-events-none': isPreview,
        },
      ]"
    >
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
    <section class="w-2/3 xl:w-4/5 h-full px-6 xl:px-12">
      <toolbar
        :slides-number="slides.length"
        :is-preview="isPreview"
        @clear="clearSlides"
        @preview="togglePreview(true)"
        @end-preview="togglePreview(false)"
        @next-slide="selectSlide(selectedIndex + 1, true)"
        @prev-slide="selectSlide(selectedIndex - 1, true)"
        @change-language="
          () => {
            changeLanguageModalVisible = true;
          }
        "
      />
      <template v-if="slides[selectedIndex]">
        <slide
          v-model:code="slides[selectedIndex].code"
          v-model:file-name="fileName"
          v-model:color="color"
          v-model:thumbnail="slides[selectedIndex].thumbnail"
          v-model:code-area-size="codeAreaSize"
          :language="language"
          class="w-full xl:w-1/2 m-auto mt-8"
        />
      </template>
    </section>
  </main>
</template>

<script lang="ts" src="./SlideManager.ts"></script>
