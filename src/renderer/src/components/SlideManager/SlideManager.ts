import {
  computed,
  defineComponent,
  onMounted,
  reactive,
  ref,
  toRaw,
  watch,
} from "vue";

import _ from "lodash";
import { Mode, ModeOption } from "@renderer/types";

import { useSlides } from "@renderer/hooks";

import {
  Button,
  Dialog,
  Select,
  FloatLabel,
  InputNumber,
  SelectFilterEvent,
  useToast,
} from "primevue";
import Slide from "@renderer/components/Slide/Slide.vue";
import SlideThumbnail from "@renderer/components/SlideThumbnail.vue";
import SlidePreview from "@renderer/components/SlidePreview/SlidePreview.vue";
import Toolbar from "@renderer/components/Toolbar.vue";
import { VueDraggableNext } from "vue-draggable-next";
import { LanguageOption, Save } from "@/types";

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
    const toast = useToast();

    // Required prop
    const codeAreaSize = ref(1);
    const timelineCompleted = ref(true);

    // Language management
    const language = ref<string>(config.default.language.id);
    const shownLanguages = ref<LanguageOption[]>([]);

    const searchLanguage = _.debounce(async (event: SelectFilterEvent) => {
      shownLanguages.value = await window.search.languages(event.value || "");
    }, config.search.languages.delay);

    onMounted(() => {
      window.search
        .languages(language.value)
        .then((items: LanguageOption[]) => {
          shownLanguages.value = items;
        });
    });

    // Indent Management
    const indent = ref<number>(config.default.indent);

    // Modals Bools
    const changeLanguageModalVisible = ref(false);
    const animationSettingsModalVisible = ref(false);

    // Save Management
    const save = ref<Save>({
      slides: toRaw(slidesHook.slides.value),
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
        slidesHook.slides.value = save.value.slides;
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
        console.error(err);
        const message = err.message ? err.message : "Couldn't save file.";

        toast.add({
          severity: "error",
          summary: "Save",
          detail: message,
          life: 6000,
        });
      }
    };

    // Modes
    const mode = ref<Mode>("normal");

    const slidesLength = computed((): number => slidesHook.slides.value.length);

    const modes = reactive<ModeOption[]>([
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
        slidesHook.selectSlide(0);
      }
    });

    watch(slidesLength, (newLength: number) => {
      const previewIdx = modes.findIndex((item) => item.value === "preview");

      if (previewIdx !== -1) {
        modes[previewIdx].disabled = newLength <= 1;
      }
    });

    return {
      ...slidesHook,
      // Required props
      codeAreaSize,
      timelineCompleted,
      // Language management
      language,
      searchLanguage,
      shownLanguages,
      // Indent management
      indent,
      // Modals
      animationSettingsModalVisible,
      changeLanguageModalVisible,
      // Save management
      save,
      saveLocation,
      readSave,
      writeSave,
      // Mode
      mode,
      modes,
      isPreview,
    };
  },
});
