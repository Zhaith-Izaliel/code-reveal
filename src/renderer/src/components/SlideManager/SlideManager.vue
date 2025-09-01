<template>
  <prime-dialog
    v-model:visible="changeLanguageModalVisible"
    modal
    header="Change language"
    class="w-1/3"
  >
    <template #header>
      <main class="flex flex-col space-y-2">
        <h1 class="text-xl font-semibold">Change Language</h1>
        <p class="text-sm text-red-900 dark:text-red-300">
          This applies it to
          <b>all the slides</b>.
        </p>
      </main>
    </template>
    <template #default>
      <main class="flex flex-col space-y-4 mt-4">
        <float-label variant="on" class="w-full">
          <prime-select
            v-model="language"
            optionLabel="label"
            optionValue="id"
            class="w-full"
            :options="shownLanguages"
            filter
            checkmark
            inputId="language_label"
            @filter="searchLanguage"
            fluid
          />
          <label for="language_label">Select language</label>
        </float-label>
        <hr class="text-zinc-400 dark:text-zinc-600 border" />
        <h2 class="text-lg font-semibold">Indentation</h2>
        <section class="w-full flex space-x-2">
          <float-label variant="on" class="w-full">
            <input-number
              v-model="indent"
              inputId="indent_number"
              showButtons
              :min="1"
              fluid
            />
            <label for="indent_number">Number of spaces</label>
          </float-label>
        </section>
      </main>
    </template>
    <template #footer>
      <p class="text-zinc-600 dark:text-zinc-400 text-sm text-center">
        Changing the indentation will not update the content of the current
        slides.
      </p>
    </template>
  </prime-dialog>
  <prime-dialog
    v-model:visible="animationSettingsModalVisible"
    modal
    header="Animation Settings"
    class="w-[25rem]"
  ></prime-dialog>
  <main class="flex h-full w-full">
    <aside
      :class="[
        `min-h-screen h-full w-2/7 xl:w-1/7 bg-surface-100/80 dark:bg-surface-800/80 backdrop-blur-lg p-4 flex flex-col`,
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
    <section class="w-5/7 xl:w-6/7 h-full px-6 xl:px-12">
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
        @animation-settings="
          () => {
            animationSettingsModalVisible = true;
          }
        "
        @save="
          async () => {
            await writeSave(saveLocation);
          }
        "
        @save-as="
          async () => {
            await writeSave(saveLocation, true);
          }
        "
        @open-save="
          async () => {
            await readSave();
          }
        "
      />
      <template v-if="slides[selectedIndex]">
        <slide
          v-if="!isPreview"
          v-model:code="slides[selectedIndex].code"
          v-model:file-name="save.fileName"
          v-model:color="save.color"
          v-model:thumbnail="slides[selectedIndex].thumbnail"
          v-model:code-area-size="codeAreaSize"
          :language="language"
          :indent="indent"
          class="w-full xl:w-1/2 m-auto mt-8"
        />
        <slide-preview
          v-else
          :language="language"
          :color="save.color"
          :file-name="save.fileName"
          :code-area-size="codeAreaSize"
          :selected-slide="selectedIndex"
          :slides="slides"
          class="w-full xl:w-1/2 m-auto mt-8"
        />
      </template>
    </section>
  </main>
</template>

<script lang="ts" src="./SlideManager.ts"></script>
