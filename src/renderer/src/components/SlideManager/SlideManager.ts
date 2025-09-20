import { computed, defineComponent, reactive, ref, watch } from "vue";

import _ from "lodash";
import { Mode, ModeOption } from "@renderer/types";

import { useSave, useSlides } from "@renderer/hooks";

import { SelectButton, Button, SplitButton } from "primevue";
import Slide from "@renderer/components/Slide/Slide.vue";
import SlideThumbnail from "@renderer/components/SlideThumbnail.vue";
import SlidePreview from "@renderer/components/SlidePreview/SlidePreview.vue";
import { VueDraggableNext } from "vue-draggable-next";

export default defineComponent({
  components: {
    SelectButton,
    Slide,
    SlidePreview,
    draggable: VueDraggableNext,
    SlideThumbnail,
    PrimeButton: Button,
    SplitButton,
  },

  setup() {
    const { config } = window;
    const slidesStore = useSlides();
    const { readSave, writeSave, saveLocation } = useSave();

    // Required prop
    const codeAreaSize = ref(1);

    // Modes
    const mode = ref<Mode>("normal");

    const modes = ref<ModeOption[]>([
      {
        label: "Normal",
        value: "normal",
        disabled: false,
        icon: "pi pi-pencil",
        description: "Edit the slides content and order.",
      },
      {
        label: "Preview",
        value: "preview",
        disabled: true,
        icon: "pi pi-eye",
        description: "Preview the animation slide by slide.",
      },
    ]);

    const isPreview = computed((): boolean => mode.value === "preview");

    watch(isPreview, (newIsPreview) => {
      if (newIsPreview) {
        slidesStore.selectSlide(0);
      }
    });

    const slidesLength = computed((): number => slidesStore.slides.length);

    watch(slidesLength, (newLength) => {
      const previewIdx = modes.value.findIndex(
        (item) => item.value === "preview",
      );

      if (previewIdx !== -1) {
        modes.value[previewIdx].disabled = newLength <= 1;
      }
    });

    const openButton = {
      label: "Open",
      icon: "pi pi-file-import",
      command: async () => {
        await readSave();
      },
    };

    const saveMenuItems = [
      {
        label: "Save as",
        icon: "pi pi-file-export",
        command: async () => {
          await writeSave(saveLocation, true);
        },
      },
      {
        label: "Export video",
        icon: "pi pi-video",
        command: () => {},
      },
      {
        separator: true,
      },
      openButton,
    ];

    return {
      config,
      // Slides
      slidesStore,
      // Required props
      codeAreaSize,
      // Save Menu
      openButton,
      saveMenuItems,
      writeSave,
      saveLocation,
      // Mode
      mode,
      modes,
      isPreview,
    };
  },
});
