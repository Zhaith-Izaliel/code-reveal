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
      <transition>
        <span
          v-html="codeToDisplay"
          :ref="
            () => {
              generateAndPlayAnimation();
            }
          "
        ></span>
      </transition>
    </template>
  </code-window>
</template>

<style scoped>
.v-enter-active,
.v-leave-active {
  transition: color 0.5s ease;
}
</style>

<script lang="ts" src="./SlidePreview.ts"></script>
