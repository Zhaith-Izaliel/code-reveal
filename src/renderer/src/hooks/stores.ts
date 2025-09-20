import { ref, toRaw } from "vue";
import { defineStore } from "pinia";
import { useToast } from "primevue";
import { Save, SlideData } from "@/types";

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

export const useSave = defineStore("save", () => {
  const { config } = window;
  const toast = useToast();
  const slidesStore = useSlides();

  const language = ref<string>(config.default.language.value);
  const indent = ref<number>(config.default.indent);

  const save = ref<Save>({
    slides: toRaw(slidesStore.slides),
    fileName: config.default.fileName,
    color: config.default.color,
    indent: indent.value,
    language: language.value,
  });

  const saveLocation = ref<string>("");

  const readSave = async () => {
    try {
      const tuple = await window.save.read();
      saveLocation.value = tuple[1];
      save.value = tuple[0];
      slidesStore.slides = save.value.slides;
      toast.add({
        severity: "success",
        summary: "Open",
        detail: "The file has been opened successfully.",
        life: 6000,
      });
    } catch (err: any) {
      const message = err.message ? err.message : "Couldn't open file.";
      toast.add({
        severity: "error",
        summary: "Open",
        detail: message,
        life: 6000,
      });
    }
  };

  const writeSave = async (file = "", saveAs = false) => {
    try {
      await window.save.write(
        // HACK: I would prefer to use toRaw but it fails with some arrays.
        JSON.parse(JSON.stringify(save.value)),
        file,
        saveAs,
      );

      toast.add({
        severity: "success",
        summary: "Save",
        detail: "The file has been saved successfully.",
        life: 6000,
      });
    } catch (err: any) {
      const message = err.message ? err.message : "Couldn't save file.";

      toast.add({
        severity: "error",
        summary: "Save",
        detail: message,
        life: 6000,
      });
    }
  };

  return {
    save,
    saveLocation,
    language,
    indent,
    readSave,
    writeSave,
  };
});

export const useAnimationTimeline = defineStore("timeline", () => {});
