<template>
  <router-view></router-view>
  <toast />
  <confirm-dialog></confirm-dialog>
</template>

<script setup lang="ts">
import { Toast, ConfirmDialog } from "primevue";
</script>
