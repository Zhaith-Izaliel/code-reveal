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
import { SlideData, Theme } from "@/types";
import Prism from "prismjs";
import { PrismData } from "@/types";
import { useTheme } from "@renderer/hooks";
import { Textarea, ColorPicker } from "primevue";
import { indent } from "@renderer/utils";
import { AppThumbnailConfig } from "@/config";
import diff from "fast-diff";
import { CodeDiff } from "@renderer/types";

function generateHighlightedCode(
  code: string,
  language: string,
  grammar: Prism.Grammar,
): string {
  if (code === "") {
    return "";
  }

  return Prism.highlight(code, grammar, language);
}

async function generateThumbnail(
  el: HTMLElement | null,
  theme: Theme,
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
      backgroundColor: thumbnailConfig.backgroundColor(theme),
      cacheBust: thumbnailConfig.cacheBust,
    });
  } catch (err) {
    console.error(err);
    return "";
  }
}

function generateDiffs(
  slides: SlideData[],
  language: string,
  grammar: Prism.Grammar,
): CodeDiff[] {
  let entries: CodeDiff[] = [];
  const highlightedCodeDiff: string[] = slides.map((item): string =>
    generateHighlightedCode(item.code, language, grammar),
  );

  for (let i = 0; i < slides.length - 1; i++) {
    const code = diff(slides[i].code, slides[i + 1].code);
    const highlightedCode = diff(
      highlightedCodeDiff[i],
      highlightedCodeDiff[i + 1],
    );
    entries.push({ code, highlightedCode });
  }

  return entries;
}

function generateAnimations(
  slides: SlideData[],
  language: string,
  grammar: Prism.Grammar,
) {
  if (slides.length <= 1 || slides.every((item) => item.code === "")) {
    return;
  }

  const diffs = generateDiffs(slides, language, grammar);

  // const { INSERT, EQUAL, DELETE } = diff;
  console.log(diffs);
}

export default defineComponent({
  components: {
    PrimeTextarea: Textarea,
    ColorPicker,
  },

  emits: [
    "update:code",
    "update:color",
    "update:fileName",
    "update:thumbnail",
    "generateAnimation",
    "animationGenerated",
  ],

  props: {
    generateThumbnail: { type: Boolean, default: true },
    language: { type: Object as PropType<PrismData>, required: true },
    code: { type: String, required: true },
    color: { type: String, required: true },
    fileName: { type: String, required: true },
    thumbnail: { type: String, required: true },
    isPreview: { Type: Boolean, required: true, default: false },
    slidesToAnimate: { type: Array as PropType<SlideData[]>, default: [] },
  },

  setup(props, { emit }) {
    const { config } = window;
    const { theme } = useTheme();

    // const codeDOMElement = useTemplateRef<HTMLElement>("code");

    const updateFileName = (event: Event) => {
      emit("update:fileName", (event.target as HTMLInputElement).value);
    };

    const highlightedCode = computed((): string =>
      generateHighlightedCode(
        props.code,
        props.language.name,
        props.language.grammar,
      ),
    );

    const fileNameInputSize = computed(() => {
      return props.fileName.length;
    });

    const thumbnailDOMElement = useTemplateRef<HTMLElement>("thumbnail");

    const updateThumbnail = async () => {
      if (props.generateThumbnail) {
        emit(
          "update:thumbnail",
          await generateThumbnail(
            thumbnailDOMElement.value,
            theme.value,
            config.thumbnail,
          ),
        );
      }
    };

    const testGenerateAnimation = () =>
      generateAnimations(
        props.slidesToAnimate,
        props.language.name,
        props.language.grammar,
      );

    onMounted(updateThumbnail);

    watch(theme, async (newTheme, oldTheme) => {
      if (newTheme === oldTheme) {
        return;
      }

      await updateThumbnail();
    });

    watch(
      highlightedCode,
      _.debounce(async (newCode, oldCode) => {
        if (newCode === oldCode) {
          return;
        }

        await updateThumbnail();
      }, config.thumbnail.delay),
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
      testGenerateAnimation,
    };
  },
});
