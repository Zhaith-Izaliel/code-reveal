<template>
  <section
    class="border-2 border-surface-300 dark:border-surface-800 rounded-lg shadow-2xl mx-auto bg-white/80 dark:bg-black/80 backdrop-blur-lg flex flex-col h-full"
  >
    <header
      class="flex justify-between w-full h-12 space-x-4 items-center text-surface-600 dark:text-surface-400"
    >
      <div class="w-1/3 flex ml-4">
        <div class="relative flex items-center justify-start">
          <slot name="color-picker"></slot>
          <span
            class="pi pi-code absolute"
            :style="{ color: `#${color}` }"
          ></span>
        </div>
      </div>
      <slot name="file-name"></slot>
      <div class="w-1/3 flex space-x-3 justify-end mr-4">
        <span class="pi pi-minus"></span>
        <span class="pi pi-stop"></span>
        <span class="pi pi-times"></span>
      </div>
    </header>

    <article
      :ref="
        (el) => {
          emit('codeChanged', el);
        }
      "
      class="flex space-x-3 relative w-full h-full p-4 font-mono min-h-[30rem]"
      :style="{
        height: `${codeAreaSize + 20}px`,
      }"
    >
      <slot name="textarea"></slot>
      <section class="absolute inset-0 w-full h-full">
        <!--prettier-ignore-->
        <pre :class="`relative h-full language-${language}`"><code class="absolute"><slot></slot></code></pre>
      </section>
    </article>
  </section>
</template>

<script lang="ts" setup>
defineProps<{
  codeAreaSize: number;
  color: string;
  language: string;
}>();

const emit = defineEmits<{
  (e: "codeChanged", el: any): void;
}>();
</script>
