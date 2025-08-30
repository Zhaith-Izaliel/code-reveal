<template>
  <code-window
    :code-area-size="codeAreaSize"
    :color="color"
    :language="language.name"
  >
    <template #file-name>
      <span class="file-name" :style="{ width: `${fileName.length}ch` }">{{
        fileName
      }}</span>
    </template>
    <template #default>
      <span
        v-html="codeToDisplay"
        :ref="
          () => {
            generateAndPlayAnimation();
          }
        "
      ></span>
    </template>
  </code-window>
</template>

<script lang="ts" src="./SlidePreview.ts"></script>
