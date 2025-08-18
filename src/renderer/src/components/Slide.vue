<template>
  <section
    class="border border-zinc-400 dark:border-zinc-800 rounded-lg shadow-2xl mx-auto bg-white/80 dark:bg-black/80 flex flex-col"
  >
    <header class="flex justify-between w-full h-9 items-center">
      <div></div>
      <div class="inline-flex items-center space-x-2">
        <div class="w-2 h-2 rounded-full overflow-hidden relative">
          <input
            class="absolute border-none overflow-hidden left-1/2 -translate-1/2 m-0 p-0"
            type="color"
            tabindex="-1"
            :value="state.input.color"
          />
        </div>
        <input
          type="text"
          tabindex="-1"
          class="bg-transparent text-center border-none outline-none font-medium text-zinc-600 dark:text-zinc-400 text-xs min-w-[7ch] max-w-[50ch]"
          v-model="state.input.fileName"
          :style="{ width: `${fileNameInputSize}ch` }"
        />
      </div>
      <div class="flex space-x-3 justify-center mx-2">
        <span class="material-icons-round">remove</span>
        <span class="material-icons-round">crop_square</span>
        <span class="material-icons-round">close</span>
      </div>
    </header>

    <article class="relative p-4 font-mono">
      <textarea
        spellcheck="false"
        class="relative overflow-hidden whitespace-nowrap focus-visible:outline-none resize-none text-transparent bg-transparent w-full z-10 h-full caret-black dark:caret-white min-h-40 code-font"
        v-model="state.input.code"
      >
      </textarea>
      <!-- This specific value (0.3125rem) corresponds to the 5px gap between the parsed code and the textarea to seamlessly overlap. -->
      <section class="absolute inset-0 -top-[0.3125rem] w-full h-full">
        <pre
          :class="`relative language-${state.language.language}`"
          v-html="highlightedCode"
        ></pre>
      </section>
    </article>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive } from "vue";
import Prism from "prismjs";

const state = reactive({
  language: {
    grammar: Prism.languages.javascript,
    language: "javascript",
  },
  input: {
    color: "#2B7FFF",
    fileName: "code.rs",
    code: "const isExample = animations.some(() => {})",
  },
});

const highlightedCode = computed(() => {
  return Prism.highlight(
    state.input.code,
    state.language.grammar,
    state.language.language,
  );
});

const fileNameInputSize = computed(() => {
  return state.input.fileName.length;
});
</script>
