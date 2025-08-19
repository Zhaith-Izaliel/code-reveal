<template>
  <div class="flex h-screen w-full">
    <aside class="h-full w-2/8 xl:w-1/8 bg-zinc-800/80 backdrop-blur-lg p-4">
      <ul class="w-full h-full flex flex-col space-y-4">
        <li
          :key="i"
          v-for="(slide, i) in slides"
          v-if="slides.length > 0"
          :class="[
            `p-0 border rounded-xl w-full cursor-pointer`,
            {
              'border-zinc-600 dark:border-zinc-800 ': selectedIndex !== i,
              'border-blue-500': selectedIndex === i,
            },
          ]"
        >
          <slide-preview
            @delete="deleteSlide"
            @duplicate="duplicateSlide"
            @select="selectSlide"
            :index="i"
            :preview="slide.preview"
          ></slide-preview>
        </li>
        <li class="text-2xl backdrop-blur-2xl h-preview-slide rounded-xl">
          <prime-button
            @click.prevent="createSlide"
            variant="text"
            severity="secondary"
            raised
            icon="pi pi-plus"
            class="h-full w-full! p-0 border border-zinc-600 dark:border-zinc-800"
          />
        </li>
      </ul>
    </aside>
    <div class="w-full h-full">
      <slide
        v-if="slides && slides[selectedIndex]"
        v-model:code="slides[selectedIndex].code"
        v-model:file-name="slides[selectedIndex].fileName"
        v-model:color="slides[selectedIndex].color"
        v-model:preview="slides[selectedIndex].preview"
        :language="language"
        class="w-2/3 xl:w-2/5 m-auto mt-8"
      ></slide>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref } from "vue";

import Slide from "./Slide/Slide.vue";
import SlidePreview from "./SlidePreview.vue";
import { SlideData } from "@/types";
import Prism from "prismjs";
import { Button as PrimeButton } from "primevue";

const { config } = window;

const selectedIndex = ref(0);

const slides = reactive<SlideData[]>([
  {
    color: "#2B7FFF",
    fileName: "code.example",
    code: "",
    preview: "",
  },
]);

const language = {
  name: "javascript",
  grammar: Prism.languages.javascript,
};

const duplicateSlide = (index: number) => {
  const slide = slides[index];
  slides.push(Object.assign({}, slide));
};

const deleteSlide = (index: number) => {
  if (index === selectedIndex.value) {
    selectSlide(index - 1);
  }
  slides.splice(index, 1);
};

const createSlide = () => {
  const { defaultSlide } = config.slides;
  slides.push({
    ...defaultSlide,
  });
};

const selectSlide = (i: number) => {
  selectedIndex.value = Math.min(Math.max(0, i), slides.length);
};
</script>
