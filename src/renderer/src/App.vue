<template>
  <router-view></router-view>
</template>

<script setup lang="ts">
import { changeTheme } from "@renderer/utils";
import { onMounted } from "vue";

onMounted(() => {
  changeTheme("dark");

  // FIXME: use electron instead of that
  document.documentElement.classList.toggle(
    "dark",
    localStorage.theme === "dark" ||
      (!("theme" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches),
  );
});
</script>
