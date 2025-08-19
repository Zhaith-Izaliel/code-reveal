<template>
  <section
    class="border border-zinc-400 dark:border-zinc-800 rounded-lg shadow-2xl mx-auto bg-white/80 dark:bg-black/80 backdrop-blur-lg flex flex-col"
  >
    <header
      class="flex justify-between w-full h-12 space-x-4 items-center text-zinc-600 dark:text-zinc-400"
    >
      <div class="w-1/3 flex items-center justify-start space-x-2 ml-4">
        <div class="overflow-hidden relative">
          <input
            class="absolute z-10 inset-0 border-none outline-none opacity-0"
            type="color"
            tabindex="-1"
            v-model="color"
          />
          <span class="pi pi-code" :style="{ color: color }"></span>
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
      class="flex space-x-3 min-h-[30rem] relative w-full h-full p-4"
    >
      <volt-textarea
        spellcheck="false"
        class="relative overflow-hidden whitespace-nowrap border-none text-transparent! outline-none! shadow-transparent! resize-none bg-transparent! w-full z-10 caret-black dark:caret-white code-font h-full"
        v-model="code"
        autoResize
      />
      <section class="absolute inset-0 pl-3 w-full h-full">
        <!--prettier-ignore-->
        <pre :class="`relative language-${props.language.name}`"><code v-html="highlightedCode"></code></pre>
      </section>
    </article>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, useTemplateRef, watch } from "vue";
import _ from "lodash";
import Prism from "prismjs";
import { toPng } from "html-to-image";
import { useTheme } from "@renderer/hooks";
import { PrismData } from "@/types";

import VoltTextarea from "@renderer/volt/Textarea.vue";

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

const props = defineProps<{
  language: PrismData;
}>();

const iconColor = ref<string>("");

const previewDOMElement = useTemplateRef("preview");

onMounted(async () => {
  iconColor.value = color.value;
  generatePreview();
});

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

const generatePreview = () => {
  if (!previewDOMElement.value) {
    return;
  }

  toPng(previewDOMElement.value, {
    width: config.preview.width,
    height: config.preview.height,
    skipAutoScale: config.preview.skipAutoScale,
    backgroundColor: config.preview.backgroundColor(theme.value),
    cacheBust: config.preview.cacheBust,
  })
    .then((dataUrl) => {
      console.log(dataUrl);
      previewImage.value = dataUrl;
    })
    .catch((err) => {
      console.error(err);
    });
};

watch(
  highlightedCode,
  _.throttle(async (newCode, oldCode) => {
    if (newCode === oldCode) {
      return;
    }

    generatePreview();
  }, config.preview.throttle),
);

watch(theme, async () => {
  generatePreview();
});
</script>
