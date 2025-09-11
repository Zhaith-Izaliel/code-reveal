import { ref } from "vue";
import { defineStore } from "pinia";
import { useToast } from "primevue";
import { SlideData } from "@/types";

export const useSlides = defineStore("slides", () => {
  const { config } = window;
  const toast = useToast();

  const slides = ref<SlideData[]>([]);
  const selectedIndex = ref(0);

  const clearSlides = () => {
    slides.value.splice(0, slides.value.length);
    toast.add({
      severity: "success",
      summary: "Slides cleared",
      detail: "All of the slides have been deleted.",
      life: 6000,
    });
  };

  const duplicateSlide = (index: number) => {
    const slide = slides.value[index];
    slides.value.push(Object.assign({}, slide));
  };

  const deleteSlide = (index: number) => {
    if (index === selectedIndex.value) {
      selectSlide(index - 1);
    }
    slides.value.splice(index, 1);
  };

  const createSlide = () => {
    const { slide } = config.default;
    slides.value.push({
      ...slide,
    });
  };

  const selectSlide = (i: number, circleAround = false) => {
    const index = circleAround
      ? Math.abs(i % slides.value.length)
      : Math.min(Math.max(0, i), slides.value.length - 1);

    selectedIndex.value = index;
  };

  const swapSlides = (left: number, right: number) => {
    const sanitizedLeft = Math.min(Math.max(0, left), slides.value.length - 1);
    const sanitizedRight = Math.min(
      Math.max(0, right),
      slides.value.length - 1,
    );

    if (sanitizedLeft === sanitizedRight) {
      return;
    }

    [slides.value[sanitizedLeft], slides.value[sanitizedRight]] = [
      slides.value[sanitizedRight],
      slides.value[sanitizedLeft],
    ];
  };

  return {
    slides,
    selectedIndex,
    clearSlides,
    duplicateSlide,
    deleteSlide,
    createSlide,
    selectSlide,
    swapSlides,
  };
});
