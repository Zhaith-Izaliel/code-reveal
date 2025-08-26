import { computed, defineComponent, ref } from "vue";

import Prism from "prismjs";
import { Mode } from "@renderer/types";

import { useSlides } from "@renderer/hooks";

import { Button, Dialog } from "primevue";
import Slide from "../Slide/Slide.vue";
import SlideThumbnail from "@renderer/components/SlideThumbnail.vue";
import Toolbar from "@renderer/components/Toolbar.vue";
import { VueDraggableNext } from "vue-draggable-next";

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

export default defineComponent({
  components: {
    Slide,
    draggable: VueDraggableNext,
    SlideThumbnail,
    PrimeButton: Button,
    Toolbar,
    PrimeDialog: Dialog,
  },

  setup() {
    const language = ref({
      name: "javascript",
      grammar: Prism.languages.javascript,
    });

    const color = ref("6366F1");
    const fileName = ref("code.js");
    const codeAreaSize = ref(1);
    const changeLanguageModalVisible = ref(false);

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
      codeAreaSize,
      mode,
      togglePreview,
      changeLanguageModalVisible,
      isPreview,
    };
  },
});
