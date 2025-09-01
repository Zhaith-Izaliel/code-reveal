<template>
  <code-window
    :code-area-size="codeAreaSize"
    :color="color"
    :language="language"
    @code-changed="updateThumbnail"
  >
    <template #color-picker>
      <color-picker
        class="absolute z-10 inset-0 opacity-0"
        :value="color"
        @update:model-value="(c: string) => $emit('update:color', c)"
      />
    </template>
    <template #file-name>
      <input
        type="text"
        class="file-name"
        :value="fileName"
        @input="updateFileName"
        :style="{ width: `${fileNameInputSize}ch` }"
      />
    </template>
    <template #textarea>
      <textarea
        spellcheck="false"
        cols="80"
        class="mt-[0.5rem] h-full relative pb-2 overflow-hidden whitespace-nowrap border-none text-transparent outline-none resize-none bg-transparent z-10 caret-black dark:caret-white"
        :value="code"
        @input="updateCode"
        @keydown="handleTab"
      />
    </template>
    <template #default><span v-html="highlightedCode"></span></template>
  </code-window>
</template>

<script lang="ts" src="./Slide.ts"></script>
