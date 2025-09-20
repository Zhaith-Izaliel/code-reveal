<template>
  <div>
    <prime-dialog
      v-model:visible="changeLanguageModalVisible"
      modal
      header="Change language"
      class="w-1/3 xl:w-1/6"
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
              v-model="save.language"
              optionLabel="label"
              optionValue="value"
              class="w-full"
              :options="shownLanguages"
              filter
              checkmark
              inputId="language_label"
              @filter="searchLanguage"
              @change="searchLanguage"
              fluid
            />
            <label for="language_label">Select language</label>
          </float-label>
          <hr class="text-zinc-400 dark:text-zinc-600 border" />
          <h2 class="text-lg font-semibold">Indentation</h2>
          <section class="w-full flex space-x-2">
            <float-label variant="on" class="w-full">
              <input-number
                v-model="save.indent"
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
      class="w-1/3 xl:w-1/6"
    >
      <template #default>
        <section class="flex flex-col space-y-5 w-full">
          <div class="flex flex-col space-y-4 w-full">
            <h2 class="text-md font-semibold">Fade animation</h2>
            <div class="flex space-x-2 items-center">
              <float-label variant="on" class="w-1/2">
                <input-number
                  v-model="
                    slidesStore.slides[slidesStore.selectedIndex].animations
                      .fade.duration
                  "
                  inputId="fade_duration"
                  :min="config.animations.fade.minDuration"
                  :max="config.animations.fade.maxDuration"
                  fluid
                  suffix="ms"
                />
                <label for="fade_duration">Fade duration</label>
              </float-label>
              <slider
                v-model="
                  slidesStore.slides[slidesStore.selectedIndex].animations.fade
                    .duration
                "
                class="w-full"
                :min="config.animations.fade.minDuration"
                :max="config.animations.fade.maxDuration"
                :step="10"
              />
            </div>
            <float-label variant="on" class="w-full">
              <prime-select
                v-model="
                  slidesStore.slides[slidesStore.selectedIndex].animations.fade
                    .ease
                "
                optionLabel="label"
                optionValue="value"
                class="w-full"
                :options="easingOptions"
                filter
                checkmark
                inputId="fade_ease"
                fluid
              />
              <label for="fade_ease">Easing function</label>
            </float-label>
          </div>
          <hr class="text-zinc-400 dark:text-zinc-600 border" />
          <div class="flex flex-col space-y-4 w-full">
            <h2 class="text-md font-semibold">Move animation</h2>
            <div class="flex space-x-2 items-center">
              <float-label variant="on" class="w-1/2">
                <input-number
                  v-model="
                    slidesStore.slides[slidesStore.selectedIndex].animations
                      .move.duration
                  "
                  inputId="move_duration"
                  :min="config.animations.move.minDuration"
                  :max="config.animations.move.maxDuration"
                  fluid
                  suffix="ms"
                />
                <label for="move_duration">Move duration</label>
              </float-label>
              <slider
                v-model="
                  slidesStore.slides[slidesStore.selectedIndex].animations.move
                    .duration
                "
                class="w-full"
                :min="config.animations.move.minDuration"
                :max="config.animations.move.maxDuration"
                :step="10"
              />
            </div>
            <float-label variant="on" class="w-full">
              <prime-select
                v-model="
                  slidesStore.slides[slidesStore.selectedIndex].animations.move
                    .ease
                "
                optionLabel="label"
                optionValue="value"
                class="w-full"
                :options="easingOptions"
                filter
                checkmark
                inputId="move_ease"
                fluid
              />
              <label for="move_ease">Easing function</label>
            </float-label>
          </div>
        </section>
      </template>
      <template #footer>
        <p class="text-zinc-600 dark:text-zinc-400 text-sm text-center">
          Easing functions control the rate of change of a property value over
          time, determining the animation's speed at different points during
          playback.
        </p>
      </template>
    </prime-dialog>
    <section class="flex flex-col space-y-2 w-full">
      <section class="flex items-center justify-center space-x-3">
        <prime-button
          severity="secondary"
          v-tooltip.bottom="'Change language'"
          raised
          rounded
          icon="pi pi-code"
          @click.prevent="
            () => {
              changeLanguageModalVisible = true;
            }
          "
        />
        <prime-button
          severity="secondary"
          v-tooltip.bottom="'Animation Settings'"
          raised
          rounded
          icon="pi pi-sliders-h"
          :disabled="slidesStore.slides.length === 0"
          @click.prevent="
            () => {
              animationSettingsModalVisible = true;
            }
          "
        />
        <prime-button
          severity="danger"
          v-tooltip.bottom="'Clear all slides'"
          raised
          rounded
          icon="pi pi-eraser"
          :disabled="slidesStore.slides.length === 0"
          @click.prevent="confirmClear"
        />
      </section>
      <code-window
        :code-area-size="codeAreaSize"
        :color="save.color"
        :language="save.language"
        @code-changed="updateThumbnail"
      >
        <template #color-picker>
          <color-picker
            class="absolute z-10 inset-0 opacity-0"
            v-model="save.color"
          />
        </template>
        <template #file-name>
          <input
            type="text"
            class="file-name"
            :value="save.fileName"
            @input="updateFileName"
            :style="{ width: `${fileNameInputSize}ch` }"
          />
        </template>
        <template #textarea>
          <textarea
            spellcheck="false"
            cols="80"
            class="mt-[0.5rem] h-full relative pb-2 overflow-hidden whitespace-nowrap border-none text-transparent outline-none resize-none bg-transparent z-10 caret-black dark:caret-white"
            :value="slidesStore.slides[slidesStore.selectedIndex].code"
            @input="updateCode"
            @keydown="handleTab"
          />
        </template>
        <template #default><span v-html="highlightedCode"></span></template>
      </code-window>
    </section>
  </div>
</template>

<script lang="ts" src="./Slide.ts"></script>
