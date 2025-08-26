<template>
  <code-window
    :code-area-size="codeAreaSize"
    :color="color"
    :language="language"
  >
    <template #file-name>
      <span class="file-name" :style="{ width: `${fileName.length}ch` }">{{
        fileName
      }}</span>
    </template>
    <template #default><span v-html=""></span></template>
  </code-window>
</template>
<script lang="ts" src="./SlidePreview.ts"></script>
