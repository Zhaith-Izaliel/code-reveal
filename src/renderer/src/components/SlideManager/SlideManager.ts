import { computed, defineComponent, reactive, ref } from "vue";
import { SlideData } from "@/types";
import Prism from "prismjs";
import { useToast } from "primevue/usetoast";
import { Button } from "primevue";
import Slide from "../Slide/Slide.vue";
import SlideThumbnail from "./SlideThumbnail.vue";
import SlideManagerTools from "./SlideManagerTools.vue";
import { VueDraggableNext } from "vue-draggable-next";
import { Mode } from "@renderer/types";

// function parseKeyboardEvent(event: KeyboardEvent, mode: Mode): ActionType {
//   if (mode === Mode.Preview) {
//     switch (event.key) {
//       case "ArrowRight":
//         return ActionType.PreviewNext;
//       case "ArrowLeft":
//         return ActionType.PreviewPrev;
//       default:
//         return ActionType.Noop;
//     }
//   }

//   return ActionType.Noop;
// }

// const handleKeys = (event: KeyboardEvent, mode: Mode, actions: Actions) => {
//   const type = parseKeyboardEvent(event, mode);
//   const callback = actions.get(type);

//   if (callback) {
//     callback();
//   }
// };

// Actions
// const createActions = (): Actions => {
//   const _actions: Actions = new Map();
//   _actions.set(ActionType.PreviewNext, () => {
//     selectSlide(selectedIndex.value + 1);
//   });
//   _actions.set(ActionType.PreviewPrev, () => {
//     selectSlide(selectedIndex.value - 1);
//   });

//   return _actions;
// };
//
// const actions = createActions();

function useSlides() {
  const { config } = window;
  const toast = useToast();

  const slides = reactive<SlideData[]>([{ ...config.slides.defaultSlide }]);
  const selectedIndex = ref(0);

  const clearSlides = () => {
    slides.splice(0, slides.length);
    toast.add({
      severity: "success",
      summary: "Slides cleared",
      detail: "All of the slides have been deleted.",
      life: 6000,
    });
  };

  const duplicateSlide = (index: number) => {
    const slide = slides[index];
    slides.push(Object.assign({}, slide));
  };

  const deleteSlide = (index: number) => {
    if (index === selectedIndex.value) {
      selectSlide(index - 1);
    }
    slides.splice(index, 1);
  };

  const createSlide = () => {
    const { defaultSlide } = config.slides;
    slides.push({
      ...defaultSlide,
    });
  };

  const selectSlide = (i: number, circleAround = false) => {
    const index = circleAround
      ? Math.abs(i % slides.length)
      : Math.min(Math.max(0, i), slides.length - 1);

    selectedIndex.value = index;
  };

  const swapSlides = (left: number, right: number) => {
    const sanitizedLeft = Math.min(Math.max(0, left), slides.length - 1);
    const sanitizedRight = Math.min(Math.max(0, right), slides.length - 1);

    if (sanitizedLeft === sanitizedRight) {
      return;
    }

    [slides[sanitizedLeft], slides[sanitizedRight]] = [
      slides[sanitizedRight],
      slides[sanitizedLeft],
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
}

export default defineComponent({
  components: {
    Slide,
    draggable: VueDraggableNext,
    SlideThumbnail,
    PrimeButton: Button,
    SlideManagerTools,
  },

  setup() {
    const language = ref({
      name: "javascript",
      grammar: Prism.languages.javascript,
    });

    const color = ref("6366F1");
    const fileName = ref("code.js");

    const slidesHook = useSlides();

    // Modes
    const mode = ref(Mode.Normal);

    const togglePreview = (on: boolean) => {
      if (on) {
        mode.value = Mode.Preview;
        slidesHook.selectedIndex.value = 0;
        return;
      }

      mode.value = Mode.Normal;
    };

    const isPreview = computed((): boolean => mode.value === Mode.Preview);

    return {
      ...slidesHook,
      language,
      color,
      fileName,
      mode,
      togglePreview,
      isPreview,
    };
  },
});
