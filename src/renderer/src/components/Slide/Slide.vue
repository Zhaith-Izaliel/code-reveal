<template>
  <section
    class="border border-zinc-400 dark:border-zinc-800 rounded-lg shadow-2xl mx-auto bg-white/80 dark:bg-black/80 backdrop-blur-lg flex flex-col"
  >
    <header
      class="flex justify-between w-full h-12 space-x-4 items-center text-zinc-600 dark:text-zinc-400"
    >
      <div class="w-1/3 flex ml-4">
        <div class="overflow-hidden relative flex items-center justify-start">
          <color-picker
            class="absolute z-10 inset-0 opacity-0"
            v-model="color"
          />
          <span
            class="pi pi-code absolute inset-0"
            :style="{ color: `#${color}` }"
          ></span>
        </div>
      </div>
      <input
        type="text"
        tabindex="-1"
        class="w-1/3 bg-transparent text-center border-none outline-none font-medium text-xs min-w-[7ch] max-w-[50ch]"
        v-model="fileName"
        :style="{ width: `${fileNameInputSize}ch` }"
      />
      <div class="w-1/3 flex space-x-3 justify-end mr-4">
        <span class="pi pi-minus"></span>
        <span class="pi pi-stop"></span>
        <span class="pi pi-times"></span>
      </div>
    </header>

    <article
      ref="preview"
      class="flex space-x-3 min-h-[30rem] relative w-full h-full p-4 font-mono!"
    >
      <prime-textarea
        spellcheck="false"
        class="mt-[0.5rem] relative p-0! overflow-hidden whitespace-nowrap text-transparent! border-none! outline-none! shadow-transparent! resize-none bg-transparent! w-full z-10 caret-black dark:caret-white code-font h-full"
        v-model="code"
        autoResize
      />
      <section class="absolute inset-0 w-full h-full">
        <!--prettier-ignore-->
        <pre :class="`relative language-${language.name}`"><code v-html="highlightedCode"></code></pre>
      </section>
    </article>
  </section>
</template>

<script lang="ts" setup>
import { computed, onMounted, useTemplateRef, watch } from "vue";
import _ from "lodash";
import Prism from "prismjs";
import { PrismData } from "@/types";
import { usePreviewGeneration } from "./Slide";
import { Textarea as PrimeTextarea, ColorPicker } from "primevue";
import { useTheme } from "@renderer/hooks";

const { config } = window;
const { theme } = useTheme();

const code = defineModel<string>("code", {
  required: true,
});

const color = defineModel<string>("color", {
  required: true,
});

const fileName = defineModel<string>("fileName", {
  required: true,
});

const previewImage = defineModel<string>("preview", {
  default: "",
});

const props = withDefaults(
  defineProps<{
    generatePreview?: boolean;
    language: PrismData;
  }>(),
  {
    generatePreview: true,
  },
);
const previewDOMElement = useTemplateRef<HTMLElement>("preview");

const { generatePreview } = usePreviewGeneration();

const highlightedCode = computed((): string => {
  if (code.value === "") {
    return "";
  }

  return Prism.highlight(
    code.value,
    props.language.grammar,
    props.language.name,
  );
});

const fileNameInputSize = computed(() => {
  return fileName.value.length;
});

const updatePreviewImage = async () => {
  if (props.generatePreview) {
    previewImage.value = await generatePreview(
      previewDOMElement.value,
      theme.value,
    );
  }
};

onMounted(updatePreviewImage);

watch(theme, updatePreviewImage);

watch(
  highlightedCode,
  _.throttle(async (newCode, oldCode) => {
    if (newCode === oldCode) {
      return;
    }

    await updatePreviewImage();
  }, config.preview.throttle),
);
</script>
