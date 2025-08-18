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
            v-model="data.color"
            @input="throttleColor"
          />
          <span class="material-icons-round" :style="{ color: iconColor }"
            >code</span
          >
        </div>
      </div>
      <input
        type="text"
        tabindex="-1"
        class="w-1/3 bg-transparent text-center border-none outline-none font-medium text-xs min-w-[7ch] max-w-[50ch]"
        v-model="data.fileName"
        :style="{ width: `${fileNameInputSize}ch` }"
      />
      <div class="w-1/3 flex space-x-3 justify-end mr-4">
        <span class="material-icons-round">remove</span>
        <span class="material-icons-round">crop_square</span>
        <span class="material-icons-round">close</span>
      </div>
    </header>

    <article class="flex space-x-3 min-h-[30rem]">
      <aside class="w-1/12 h-full p-4">AAAAA</aside>
      <section class="relative p-4 w-full h-full">
        <volt-textarea
          spellcheck="false"
          class="relative overflow-hidden whitespace-nowrap border-0! outline-none! resize-none text-transparent! bg-transparent! w-full z-10 caret-black dark:caret-white code-font h-full"
          v-model="data.code"
          autoResize
        />
        <section class="absolute inset-0 left-[0.8rem] w-full h-full">
          <pre
            :class="`relative language-${data.language.name}`"
            v-html="highlightedCode"
          ></pre>
        </section>
      </section>
    </article>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import _ from "lodash";
import Prism from "prismjs";
import { SlideData } from "@renderer/types";
import VoltTextarea from "@renderer/volt/Textarea.vue";

const data = defineModel<SlideData>({
  required: true,
});

const iconColor = ref("");

const throttleColor = _.throttle(() => {
  iconColor.value = data.value.color;
}, 100);

onMounted(() => {
  iconColor.value = data.value.color;
});

const highlightedCode = computed(() => {
  return Prism.highlight(
    data.value.code,
    data.value.language.grammar,
    data.value.language.name,
  );
});

const fileNameInputSize = computed(() => {
  return data.value.fileName.length;
});
</script>
