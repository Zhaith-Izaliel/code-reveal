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
            :value="color"
            @update:model-value="(c: string) => $emit('update:color', c)"
          />
          <span
            class="pi pi-code absolute inset-0"
            :style="{ color: `#${color}` }"
          ></span>
        </div>
      </div>
      <input
        type="text"
        class="w-1/3 bg-transparent text-center border-none outline-none font-medium text-xs min-w-[7ch] max-w-[50ch]"
        :value="fileName"
        @input="updateFileName"
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
        class="mt-[0.5rem] relative p-0! overflow-hidden whitespace-nowrap border-none! text-transparent! outline-none! shadow-transparent! resize-none bg-transparent! w-full z-10 caret-black dark:caret-white code-font h-full"
        :value="code"
        @input="$emit('update:code', $event.target.value)"
        @keydown="handleTab"
        autoResize
      />
      <section class="absolute inset-0 w-full h-full">
        <!--prettier-ignore-->
        <pre :class="`relative language-${language.name}`"><code v-html="highlightedCode"></code></pre>
      </section>
    </article>
  </section>
</template>

<script lang="ts" src="./Slide.ts"></script>
