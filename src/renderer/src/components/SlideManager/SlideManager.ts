import { computed, defineComponent, reactive, ref } from "vue";

import Prism from "prismjs";
import { Mode } from "@renderer/types";

import { useSlides } from "@renderer/hooks";

import { Button, Dialog, AutoComplete, FloatLabel } from "primevue";
import Slide from "@renderer/components/Slide/Slide.vue";
import SlideThumbnail from "@renderer/components/SlideThumbnail.vue";
import SlidePreview from "@renderer/components/SlidePreview/SlidePreview.vue";
import Toolbar from "@renderer/components/Toolbar.vue";
import { VueDraggableNext } from "vue-draggable-next";
import { Indent, LanguageSelect, PrismData, Save } from "@/types";

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
    AutoComplete,
    FloatLabel,
    Slide,
    SlidePreview,
    draggable: VueDraggableNext,
    SlideThumbnail,
    PrimeButton: Button,
    Toolbar,
    PrimeDialog: Dialog,
  },

  setup() {
    const { config } = window;

    const selectedLanguage = ref<LanguageSelect>({
      ...config.default.language,
    });

    const language = ref<PrismData>({
      name: selectedLanguage.value.id,
      grammar: Prism.languages[config.default.language],
    });
    const indent = ref<Indent>({ ...config.default.indent });
    const color = ref<string>(config.default.color);
    const fileName = ref<string>(config.default.fileName);
    const codeAreaSize = ref(1);

    const changeLanguageModalVisible = ref(false);
    const animationSettingsModalVisible = ref(false);

    const slidesHook = useSlides();

    const shownLanguages = ref<LanguageSelect[]>([]);

    const searchLanguage = async (query: string) => {
      shownLanguages.value = await window.search.languages(query);
    };

    const save = reactive<Save>({
      slides: slidesHook.slides,
      fileName: fileName.value,
      color: color.value,
      indent: indent.value,
      language: language.value.name,
    });

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
      indent,
      color,
      fileName,
      codeAreaSize,
      mode,
      togglePreview,
      animationSettingsModalVisible,
      changeLanguageModalVisible,
      isPreview,
      searchLanguage,
      selectedLanguage,
      shownLanguages,
    };
  },
});
