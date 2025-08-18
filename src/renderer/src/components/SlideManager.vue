<template>
  <slide v-model="state[0]" class="w-2/3 m-auto mt-8"></slide>
</template>

<script lang="ts" setup>
import { reactive } from "vue";
import Slide from "./Slide.vue";
import Prism from "prismjs";
import { SlideData } from "@renderer/types";

const state = reactive<SlideData[]>([
  {
    language: {
      grammar: Prism.languages.haskell,
      name: "haskell",
    },
    color: "#2B7FFF",
    fileName: "code.rs",
    code: "maximum' :: (Ord a) => [a] -> a",
  },
]);
</script>
