import { defineComponent, computed, ref, onMounted, onUnmounted } from "vue";

import { AppThumbnailConfig, LanguageOption } from "@/types";

import _ from "lodash";
import { toPng } from "html-to-image";
import { useHighlightCode, useSave, useSlides } from "@renderer/hooks";
import { indent } from "@renderer/utils";
import easingOptions from "@/config/easing_params";

import {
  ColorPicker,
  SelectChangeEvent,
  SelectFilterEvent,
  Button,
  Dialog,
  Select,
  FloatLabel,
  InputNumber,
  Slider,
  useConfirm,
} from "primevue";
import CodeWindow from "@renderer/components/CodeWindow.vue";

async function generateThumbnail(
  el: HTMLElement | null,
  thumbnailConfig: AppThumbnailConfig,
): Promise<string> {
  if (!el) {
    return "";
  }

  try {
    return await toPng(el, {
      width: thumbnailConfig.width,
      height: thumbnailConfig.height,
      skipAutoScale: thumbnailConfig.skipAutoScale,
      cacheBust: thumbnailConfig.cacheBust,
    });
  } catch (err) {
    console.error(err);
    return "";
  }
}

export default defineComponent({
  components: {
    ColorPicker,
    CodeWindow,
    PrimeButton: Button,
    PrimeSelect: Select,
    PrimeDialog: Dialog,
    FloatLabel,
    InputNumber,
    Slider,
  },

  emits: ["update:codeAreaSize"],

  props: {
    codeAreaSize: { type: Number, required: true },
  },

  setup(_props, { emit }) {
    const { config } = window;
    const slidesStore = useSlides();
    const saveStore = useSave();
    const confirm = useConfirm();
    const { generateHighlightedCode } = useHighlightCode();

    const updateFileName = (event: Event) => {
      saveStore.save.fileName = (event.target as HTMLInputElement).value;
    };

    const updateCode = (event: Event) => {
      const el = event.target as HTMLTextAreaElement;
      if (!el) {
        return;
      }

      slidesStore.slides[slidesStore.selectedIndex].code = el.value;
      emit("update:codeAreaSize", el.scrollHeight);
    };

    const highlightedCode = computed((): string =>
      generateHighlightedCode(
        slidesStore.slides[slidesStore.selectedIndex].code,
        saveStore.save.language,
      ),
    );

    const fileNameInputSize = computed(() => saveStore.save.fileName.length);

    const updateThumbnail = _.debounce(async (el) => {
      slidesStore.slides[slidesStore.selectedIndex].thumbnail =
        await generateThumbnail(el, config.thumbnail);
    }, config.thumbnail.delay);

    onUnmounted(() => {
      updateThumbnail.cancel();
    });

    const handleTab = (event: KeyboardEvent) => {
      const el = event.target as HTMLTextAreaElement;
      if (event.key == "Tab" && el) {
        event.preventDefault();

        const start = el.selectionStart;
        const end = el.selectionEnd;

        el.value =
          el.value.substring(0, start) +
          indent(" ", saveStore.save.indent) +
          el.value.substring(end);

        el.selectionStart = el.selectionEnd = start + saveStore.save.indent;

        el.dispatchEvent(new Event("input"));

        return;
      }
    };

    // Language management
    const shownLanguages = ref<LanguageOption[]>([]);

    const searchLanguage = _.debounce(
      async (event: SelectFilterEvent | SelectChangeEvent) => {
        shownLanguages.value = await window.search.languages(
          event.value || "",
          saveStore.language,
        );
      },
      config.search.languages.delay,
    );

    onMounted(() => {
      window.search
        .languages(saveStore.language, saveStore.language)
        .then((items: LanguageOption[]) => {
          shownLanguages.value = items;
        });
    });

    // Modals Bools
    const changeLanguageModalVisible = ref(false);
    const animationSettingsModalVisible = ref(false);

    // Confirm
    const confirmClear = () => {
      confirm.require({
        message: "This action will delete all the slides in the presentation.",
        header: "Confirmation",
        icon: "pi pi-exclamation-triangle",
        rejectProps: {
          label: "Cancel",
          severity: "secondary",
          outlined: true,
        },
        acceptProps: {
          label: "Delete",
          severity: "danger",
        },
        accept: () => slidesStore.clearSlides,
      });
    };

    return {
      config,
      // Slides
      slidesStore,
      // Inputs
      fileNameInputSize,
      highlightedCode,
      updateFileName,
      updateThumbnail,
      updateCode,
      handleTab,
      // Required props
      easingOptions,
      // Language management
      searchLanguage,
      shownLanguages,
      // Modals
      animationSettingsModalVisible,
      changeLanguageModalVisible,
      confirmClear,
      // Save management
      save: saveStore.save,
      saveLocation: saveStore.saveLocation,
      readSave: saveStore.readSave,
      writeSave: saveStore.writeSave,
    };
  },
});
