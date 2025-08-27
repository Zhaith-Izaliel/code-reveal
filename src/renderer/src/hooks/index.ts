import { SlideData, Theme } from "@/types";
import { computed, reactive, ref } from "vue";
import {
  setTheme as utilsSetTheme,
  generateHighlightedCode,
} from "@renderer/utils";
import { AnimationPrimitives, CodeDiff } from "@renderer/types";
import Prism from "prismjs";
import diff, { DELETE, INSERT, EQUAL } from "fast-diff";
import ShortUniqueId from "short-unique-id";
import { useToast } from "primevue";
import { Timeline } from "animejs";

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

function generatePrimitivesForDiff(item: CodeDiff): AnimationPrimitives[] {
  let intermediates: AnimationPrimitives[] = [];
  const { randomUUID } = new ShortUniqueId({ length: 10 });
  console.log(item);

  let lastEqual = "";

  for (let i = 0; i < item.code.length; i++) {
    const [_, str] = item.code[i];
    const [op, formattedStr] = item.highlightedCode[i];
    const id = `A-${randomUUID()}`;
    const el = (top: number, left: number, opacity = 1): string =>
      `<span id="${id}" class="absolute" style="top: ${top}rem; left: ${left}ch; opacity: ${opacity};">${formattedStr}</span>`;

    if (i === 0) {
      intermediates.push({
        el: el(0, 0, op === INSERT ? 0 : 1),
        id,
        op,
        top: 0,
        left: 0,
      });

      if (op === EQUAL) {
        lastEqual = str;
      }
      continue;
    }

    const [prevOp, prevStr] = item.code[i - 1];
    const prevSplit = prevStr.split("\n");
    const prevLastLength = prevSplit[prevSplit.length - 1].length;
    const prevLines = prevSplit.length - 1;

    const { top, left } = intermediates[i - 1];

    switch (op) {
      case INSERT:
        const currSplit = str.split("\n");
        const newTop = prevOp === DELETE ? top - prevLines : top + prevLines;
        const newLeft =
          currSplit[0].length === 0
            ? 0
            : prevOp === DELETE
              ? left - prevLastLength
              : left + prevLastLength;
        intermediates.push({
          el: el(newTop, newLeft, 0),
          id,
          op,
          top: newTop,
          left: newLeft,
        });
        continue;
      case DELETE:
        const newTop2 = top;
        const newLeft2 = left + prevLastLength;
        intermediates.push({
          el: el(newTop2, newLeft2),
          id,
          op,
          top: newTop2,
          left: newLeft2,
        });
        continue;

      default:
      case EQUAL:
        const newTop3 = prevOp === DELETE ? top + prevLines : top;
        const newLeft3 =
          prevOp === DELETE
            ? left + prevLastLength
            : left === 0
              ? lastEqual.length
              : left;
        intermediates.push({
          el: el(newTop3, newLeft3),
          id,
          op,
          top: newTop3,
          left: newLeft3,
          to: {
            top: prevOp === DELETE ? top : top + prevLines,
            left: prevOp === DELETE ? left : left + prevLastLength,
          },
        });
        lastEqual = str;
        continue;
    }
  }

  return intermediates.map((inter) => {
    if (inter.to) {
      inter.to.top *= 1.5;
    }

    inter.top *= 1.5;

    return inter;
  });
}

const generateAnimationsPrimitives = (
  slides: SlideData[],
  language: string,
  grammar: Prism.Grammar,
): AnimationPrimitives[][] => {
  if (slides.length <= 1 || slides.every((item) => item.code === "")) {
    return [];
  }

  const diffs = generateDiffs(slides, language, grammar);
  return diffs.map(generatePrimitivesForDiff);
};

const assignTimeline = (primitive: AnimationPrimitives, timeline: Timeline) => {
  const { config } = window;
  switch (primitive.op) {
    case DELETE:
      timeline.add(
        `#${primitive.id}`,
        {
          duration: config.animations.reveal.fade.duration,
          ease: config.animations.reveal.fade.ease,
          opacity: {
            from: 1,
            to: 0,
          },
        },
        0,
      );
      return;
    case INSERT:
      timeline.add(
        `#${primitive.id}`,
        {
          duration: config.animations.reveal.fade.duration,
          ease: config.animations.reveal.fade.ease,
          opacity: {
            from: 0,
            to: 1,
          },
        },
        config.animations.reveal.move.duration +
          config.animations.reveal.fade.duration,
      );
      return;

    default:
    case EQUAL:
      if (primitive.to) {
        timeline.add(
          `#${primitive.id}`,
          {
            duration: config.animations.reveal.move.duration,
            ease: config.animations.reveal.move.ease,
            top: {
              from: `${primitive.top}rem`,
              to: `${primitive.to.top}rem`,
            },
            left: {
              from: `${primitive.left}ch`,
              to: `${primitive.to.left}ch`,
            },
          },
          config.animations.reveal.move.duration,
        );
      }
      return;
  }
};

export function useCodeAnimation() {
  return { generateAnimationsPrimitives, assignTimeline };
}
