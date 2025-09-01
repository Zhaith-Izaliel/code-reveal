<template>
  <code-window
    :code-area-size="codeAreaSize"
    :color="color"
    :language="language"
    @code-changed="
      () => {
        generateAndPlayAnimation();
      }
    "
  >
    <template #file-name>
      <span class="file-name" :style="{ width: `${fileName.length}ch` }">{{
        fileName
      }}</span>
    </template>
    <template #default>
      <span v-html="codeToDisplay"></span>
    </template>
  </code-window>
</template>

<script lang="ts" src="./SlidePreview.ts"></script>
