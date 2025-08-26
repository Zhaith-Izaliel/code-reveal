import { SlideData, Theme } from "@/types";
import { computed, reactive, ref } from "vue";
import {
  setTheme as utilsSetTheme,
  generateHighlightedCode,
} from "@renderer/utils";
import { AnimationPrimitives, CodeDiff } from "@renderer/types";
import Prism from "prismjs";
import diff from "fast-diff";
import ShortUniqueId from "short-unique-id";
import { useToast } from "primevue";

// ---- Theme ----

export function useTheme() {
  const theme = computed((): Theme => {
    const rootClasses = document.documentElement.classList;
    if (rootClasses.contains("app-dark")) {
      return "dark";
    }

    return "light";
  });

  const setTheme = async (theme: Theme) => {
    await utilsSetTheme(theme);
  };

  return {
    theme,
    setTheme,
  };
}

// ---- Highlight Code ----

export function useHighlightCode() {
  return { generateHighlightedCode };
}

// ---- Slides ----

export function useSlides() {
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

// ---- Generate Animation ----

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

function generatePrimitives(item: CodeDiff): AnimationPrimitives[] {
  const { INSERT, DELETE } = diff;
  let intermediates: AnimationPrimitives[] = [];
  const { randomUUID } = new ShortUniqueId({ length: 10 });

  for (let i = 0; i < item.code.length; i++) {
    const [op, formattedStr] = item.highlightedCode[i];
    const id = "A" + randomUUID();
    const el = `<span id="${id}" class="absolute">${formattedStr}</span>`;

    if (i === 0) {
      intermediates.push({
        el,
        id,
        from: {
          top: 0,
          right: 0,
          opacity: op === INSERT ? 0 : 1,
        },
        to: {
          top: 0,
          right: 0,
          opacity: op === DELETE ? 0 : 1,
        },
      });
      continue;
    }

    const [prevOp, prevStr] = item.code[i - 1];
    const split = prevStr.split("\n");
    const prevLastLength = split[split.length - 1].length;
    const prevLines = split.length - 1;

    // Opacity: Insert goes from 0 to 1, Delete goes from 1 to 0 and EQUAL gros from 1 to 1 (no change)
    intermediates.push({
      el,
      id,
      from: {
        top:
          intermediates[i - 1].from.top +
          (prevOp === INSERT ? prevLines : -prevLines),
        right:
          intermediates[i - 1].from.right +
          (prevOp === INSERT ? prevLastLength : -prevLastLength),
        // opacity: op === INSERT ? 0 : 1,
        opacity: 1,
      },
      to: {
        top:
          intermediates[i - 1].to.top +
          (prevOp === INSERT ? prevLines : -prevLines),
        right:
          intermediates[i - 1].to.right +
          (prevOp === INSERT ? prevLastLength : -prevLastLength),
        // opacity: op === DELETE ? 0 : 1,
        opacity: 1,
      },
    });
  }
  return intermediates;
}

const generateAnimations = (
  slides: SlideData[],
  language: string,
  grammar: Prism.Grammar,
): AnimationPrimitives[][] => {
  if (slides.length <= 1 || slides.every((item) => item.code === "")) {
    return [];
  }

  const diffs = generateDiffs(slides, language, grammar);
  return diffs.map(generatePrimitives);
};

// FIXME: animations not running at all, maybe a problem with Vue rendering. Need to try CSS animations to see if they work with electron
// const testGenerateAnimation = () => {
//   const timeline = createTimeline();
//   const primitives = generateAnimations(
//     props.slidesToAnimate,
//     props.language.name,
//     props.language.grammar,
//   );
//   console.log(primitives);

//   const element = primitives[0].reduce(
//     (acc: string, item): string => acc + item.el,
//     "",
//   );
//   currentAnimatedCode.value = element;

//   nextTick(() => {
//     primitives[0].forEach((item) => {
//       timeline.add(`#${item.id}`, {
//         duration: 1000,
//         top: {
//           from: `${item.from.top}rem`,
//           to: `${item.to.top}rem`,
//         },
//         left: {
//           from: `${item.from.left}ch`,
//           to: `${item.to.left}ch`,
//         },
//         opacity: {
//           from: item.from.opacity,
//           to: item.to.opacity,
//         },
//       });
//     });
//     timeline.play();
//   });
// };

export function useCodeAnimation() {
  return { generateAnimations };
}
