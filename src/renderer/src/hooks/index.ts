import { SlideData, Theme } from "@/types";
import { computed, reactive, ref } from "vue";
import {
  setTheme as utilsSetTheme,
  generateHighlightedCode,
} from "@renderer/utils";
import { DiffAnimationPrimitive, CodeDiff } from "@renderer/types";
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

  const slides = reactive<SlideData[]>([]);
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
    const { slide } = config.default;
    slides.push({
      ...slide,
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

function generateId() {
  const { randomUUID } = new ShortUniqueId({ length: 10 });
  return `A-${randomUUID()}`;
}

function generateElement(id: string, content: string, style: string): string {
  return `<span id="${id}" class="absolute" style="${style}">${content}</span>`;
}

function generateDiffs(slides: SlideData[], language: string): CodeDiff[][] {
  let entries: CodeDiff[][] = [];

  for (let i = 0; i < slides.length - 1; i++) {
    const codeDiff = diff(slides[i].code, slides[i + 1].code);
    const finalDiff: CodeDiff[] = [];

    codeDiff.forEach((item) => {
      const [op, code] = item;

      if (code.includes("\n")) {
        const splitCode = code.split("\n");
        splitCode.forEach((str, index, array) => {
          finalDiff.push({
            code: str,
            highlightedCode: generateHighlightedCode(str, language),
            op,
            isNewLine: array.length - 1 !== index,
          });
        });
        return;
      }

      finalDiff.push({
        code,
        highlightedCode: generateHighlightedCode(code, language),
        op,
        isNewLine: false,
      });
    });

    entries.push(finalDiff);
  }

  return entries;
}

function generatePrimitivesForDiff(
  items: CodeDiff[],
): DiffAnimationPrimitive[] {
  const primitives: DiffAnimationPrimitive[] = [];

  // Row number before operations
  let fromTop = 0;

  // Row number after operations
  let toTop = 0;

  // Column number after operations
  let toLeft = 0;

  // Column number before operations
  let fromLeft = 0;

  for (let i = 0; i < items.length; i++) {
    const { op, code, highlightedCode, isNewLine } = items[i];

    if (code !== "") {
      const id = generateId();
      const el = (top: number, left: number, opacity = 1): string =>
        generateElement(
          id,
          highlightedCode,
          `top:${top * 1.5}rem; left: ${left}ch; opacity: ${opacity}`,
        );

      if (i === 0) {
        let opacity: { from: number; to: number } | undefined = undefined;
        switch (op) {
          case DELETE:
            opacity = { from: 1, to: 0 };
            break;
          case INSERT:
            opacity = { from: 0, to: 1 };
            break;
        }

        primitives.push({
          el: el(toTop, toLeft),
          id,
          op,
          opacity,
        });
      } else {
        switch (op) {
          case DELETE:
            primitives.push({
              el: el(fromTop, fromLeft),
              id,
              op,
              opacity: { from: 1, to: 0 },
            });
            break;

          case INSERT:
            primitives.push({
              el: el(toTop, toLeft, 0),
              id,
              op,
              opacity: { from: 0, to: 1 },
            });
            break;

          default:
          case EQUAL:
            primitives.push({
              el: el(fromTop, fromLeft),
              id,
              op,
              left: { from: fromLeft, to: toLeft },
              top: { from: fromTop, to: toTop },
            });
            break;
        }
      }
    }

    if (op !== DELETE) {
      toLeft = isNewLine ? 0 : toLeft + code.length;
    }

    if (op !== INSERT) {
      fromLeft = isNewLine ? 0 : fromLeft + code.length;
    }

    if (isNewLine) {
      if (op !== INSERT) {
        fromTop++;
      }
      if (op !== DELETE) {
        toTop++;
      }
    }
  }

  return primitives.map((prim) => {
    if (prim.top) {
      prim.top.to *= 1.5;
      prim.top.from *= 1.5;
    }

    return prim;
  });
}

const generateAnimationsPrimitives = (
  slides: SlideData[],
  language: string,
): DiffAnimationPrimitive[][] => {
  if (slides.length <= 1 || slides.every((item) => item.code === "")) {
    return [];
  }

  const diffs = generateDiffs(slides, language);
  return diffs.map(generatePrimitivesForDiff);
};

const assignTimeline = (
  primitive: DiffAnimationPrimitive,
  timeline: Timeline,
  slide: SlideData,
) => {
  switch (primitive.op) {
    case DELETE:
      if (primitive.opacity) {
        timeline.add(
          `#${primitive.id}`,
          {
            duration: slide.animations.fade.duration,
            ease: slide.animations.fade.ease,
            opacity: primitive.opacity,
          },
          0,
        );
      }
      return;

    case INSERT:
      if (primitive.opacity) {
        timeline.add(
          `#${primitive.id}`,
          {
            duration: slide.animations.fade.duration,
            ease: slide.animations.fade.ease,
            opacity: primitive.opacity,
          },
          slide.animations.move.duration + slide.animations.fade.duration,
        );
      }
      return;

    default:
    case EQUAL:
      if (primitive.left && primitive.top) {
        timeline.add(
          `#${primitive.id}`,
          {
            duration: slide.animations.move.duration,
            ease: slide.animations.move.ease,
            top: {
              from: `${primitive.top.from}em`,
              to: `${primitive.top.to}em`,
            },
            left: {
              from: `${primitive.left.from}ch`,
              to: `${primitive.left.to}ch`,
            },
          },
          slide.animations.move.duration,
        );
      }
      return;
  }
};

export function useCodeAnimation() {
  return { generateAnimationsPrimitives, assignTimeline };
}
