import {
  defineComponent,
  computed,
  onMounted,
  useTemplateRef,
  watch,
  PropType,
} from "vue";
import _ from "lodash";
import { toPng } from "html-to-image";
import { Theme } from "@/types";
import Prism from "prismjs";
import { PrismData } from "@/types";
import { useTheme } from "@renderer/hooks";
import { Textarea, ColorPicker } from "primevue";
import { indent } from "@renderer/utils";

export default defineComponent({
  components: {
    PrimeTextarea: Textarea,
    ColorPicker,
  },

  emits: ["update:code", "update:color", "update:fileName", "update:preview"],

  props: {
    generatePreview: { type: Boolean, default: true },
    language: { type: Object as PropType<PrismData>, required: true },
    code: { type: String, required: true },
    color: { type: String, required: true },
    fileName: { type: String, required: true },
    preview: { type: String, required: true },
  },

  setup(props, { emit }) {
    const { config } = window;
    const { theme } = useTheme();

    const previewDOMElement = useTemplateRef<HTMLElement>("preview");

    const updateFileName = (event: Event) => {
      emit("update:fileName", (event.target as HTMLInputElement).value);
    };

    const highlightedCode = computed((): string => {
      if (props.code === "") {
        return "";
      }

      return Prism.highlight(
        props.code,
        props.language.grammar,
        props.language.name,
      );
    });

    const fileNameInputSize = computed(() => {
      return props.fileName.length;
    });

    const generatePreview = (el: HTMLElement | null, theme: Theme) => {
      if (!el) {
        return;
      }

      toPng(el, {
        width: config.preview.width,
        height: config.preview.height,
        skipAutoScale: config.preview.skipAutoScale,
        backgroundColor: config.preview.backgroundColor(theme),
        cacheBust: config.preview.cacheBust,
      })
        .then((dataUrl) => {
          emit("update:preview", dataUrl);
        })
        .catch((err) => {
          console.error(err);
        });
    };

    const updatePreviewImage = () => {
      if (props.generatePreview) {
        generatePreview(previewDOMElement.value, theme.value);
      }
    };

    onMounted(updatePreviewImage);

    watch(theme, (newTheme, oldTheme) => {
      if (newTheme === oldTheme) {
        return;
      }

      updatePreviewImage();
    });

    watch(
      highlightedCode,
      _.debounce(async (newCode, oldCode) => {
        if (newCode === oldCode) {
          return;
        }

        updatePreviewImage();
      }, config.preview.delay),
    );

    const handleTab = (event: KeyboardEvent) => {
      const el = event.target as HTMLTextAreaElement;
      if (event.key == "Tab" && el) {
        event.preventDefault();

        const start = el.selectionStart;
        const end = el.selectionEnd;

        el.value =
          el.value.substring(0, start) +
          indent(config.slides.indent.character, config.slides.indent.number) +
          el.value.substring(end);

        el.selectionStart = el.selectionEnd =
          start + config.slides.indent.number;

        el.dispatchEvent(new Event("input"));

        return;
      }
    };

    return {
      fileNameInputSize,
      highlightedCode,
      updateFileName,
      handleTab,
    };
  },
});
