import { defineComponent, computed, PropType, ref } from "vue";

import { AppThumbnailConfig } from "@/types";
import { PrismData } from "@/types";

import _ from "lodash";
import { toPng } from "html-to-image";
import { useHighlightCode } from "@renderer/hooks";
import { indent } from "@renderer/utils";

import { ColorPicker } from "primevue";
import CodeWindow from "@renderer/components/CodeWindow.vue";

async function generateThumbnail(
  el: HTMLElement | null,
  thumbnailConfig: AppThumbnailConfig,
) {
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
  },

  emits: ["update:code", "update:color", "update:fileName", "update:thumbnail"],

  props: {
    language: { type: Object as PropType<PrismData>, required: true },
    code: { type: String, required: true },
    color: { type: String, required: true },
    fileName: { type: String, required: true },
    thumbnail: { type: String, required: true },
  },

  setup(props, { emit }) {
    const { config } = window;
    const { generateHighlightedCode } = useHighlightCode();

    const textAreaSize = ref(1);

    const updateFileName = (event: Event) => {
      emit("update:fileName", (event.target as HTMLInputElement).value);
    };

    const updateCode = (event: Event) => {
      const el = event.target as HTMLTextAreaElement;
      if (!el) {
        return;
      }

      emit("update:code", el.value);
      textAreaSize.value = el.scrollHeight;
    };

    const highlightedCode = computed((): string =>
      generateHighlightedCode(
        props.code,
        props.language.name,
        props.language.grammar,
      ),
    );

    const fileNameInputSize = computed(() => props.fileName.length);

    const updateThumbnail = _.debounce(async (el) => {
      emit("update:thumbnail", await generateThumbnail(el, config.thumbnail));
    }, config.thumbnail.delay);

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
      updateThumbnail,
      updateCode,
      textAreaSize,
      handleTab,
    };
  },
});
