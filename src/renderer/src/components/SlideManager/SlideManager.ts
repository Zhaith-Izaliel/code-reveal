import { computed, defineComponent, onMounted, reactive, ref } from "vue";

import _ from "lodash";
import { Mode } from "@renderer/types";

import { useSlides } from "@renderer/hooks";

import {
  Button,
  Dialog,
  Select,
  FloatLabel,
  InputNumber,
  SelectFilterEvent,
} from "primevue";
import Slide from "@renderer/components/Slide/Slide.vue";
import SlideThumbnail from "@renderer/components/SlideThumbnail.vue";
import SlidePreview from "@renderer/components/SlidePreview/SlidePreview.vue";
import Toolbar from "@renderer/components/Toolbar.vue";
import { VueDraggableNext } from "vue-draggable-next";
import { Indent, IndentOption, LanguageOption, Save } from "@/types";

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
    PrimeSelect: Select,
    InputNumber,
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
    const slidesHook = useSlides();

    // Required prop
    const codeAreaSize = ref(1);

    // Language management
    const language = ref<LanguageOption>({ ...config.default.language });
    const shownLanguages = ref<LanguageOption[]>([]);

    const searchLanguage = _.debounce(async (event: SelectFilterEvent) => {
      shownLanguages.value = await window.search.languages(event.value || "");
    }, config.search.languages.delay);

    onMounted(() => {
      window.search
        .languages(language.value.id)
        .then((items: LanguageOption[]) => {
          shownLanguages.value = items;
        });
    });

    // Indent Management
    const selectedIndent = ref<IndentOption>(config.default.indentOption);
    const indent = ref<Indent>({
      character: selectedIndent.value.character,
      number: config.default.indent.number,
    });
    const indentOptions = ref<IndentOption[]>(config.indentOptions);

    // Modals Bools
    const changeLanguageModalVisible = ref(false);
    const animationSettingsModalVisible = ref(false);

    // Save Management
    const save = reactive<Save>({
      slides: slidesHook.slides,
      fileName: config.default.fileName,
      color: config.default.color,
      indent: indent.value,
      language: language.value.id,
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
      // Required props
      codeAreaSize,
      // Language management
      language,
      searchLanguage,
      shownLanguages,
      // Indent management
      indent,
      indentOptions,
      selectedIndent,
      // Modals
      animationSettingsModalVisible,
      changeLanguageModalVisible,
      // Save management
      save,
      // Mode
      mode,
      togglePreview,
      isPreview,
    };
  },
});
