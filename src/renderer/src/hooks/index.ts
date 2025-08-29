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

function generateId() {
  const { randomUUID } = new ShortUniqueId({ length: 10 });
  return `A-${randomUUID()}`;
}

function generateElement(id: string, content: string, style: string): string {
  return `<span id="${id}" class="absolute" style="${style}">${content}</span>`;
}

function generateDiffs(
  slides: SlideData[],
  language: string,
  grammar: Prism.Grammar,
): CodeDiff[][] {
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
            highlightedCode: generateHighlightedCode(str, language, grammar),
            op,
            isNewLine: array.length - 1 !== index,
            lastOfSplit: array.length - 1 === index,
          });
        });
        return;
      }

      finalDiff.push({
        code,
        highlightedCode: generateHighlightedCode(code, language, grammar),
        op,
        isNewLine: false,
        lastOfSplit: false,
      });
    });

    entries.push(finalDiff);
  }

  return entries;
}

function generatePrimitivesForDiff(items: CodeDiff[]): AnimationPrimitives[] {
  const primitives: AnimationPrimitives[] = [];
  console.log(items);

  // Row number
  let top = 0;

  // Row number excluding insertions
  let topNoInsert = 0;

  // Row number excluding deletions
  let topNoDelete = 0;

  // Column number
  let left = 0;

  let lastEqualOrAdd = "";

  for (let i = 0; i < items.length; i++) {
    const { op, code, highlightedCode, isNewLine, lastOfSplit } = items[i];

    if (code !== "") {
      const id = generateId();
      const el = (top: number, left: number, opacity = 1): string =>
        generateElement(
          id,
          highlightedCode,
          `top:${top * 1.5}rem; left: ${left}ch; opacity: ${opacity}`,
        );

      if (i === 0) {
        primitives.push({
          el: el(top, left),
          id,
          op,
        });
      } else {
        const {
          op: prevOp,
          code: prevCode,
          lastOfSplit: prevLastOfSplit,
          isNewLine: prevIsNewLine,
        } = items[i - 1];

        switch (op) {
          case DELETE:
            primitives.push({
              el: el(top, left),
              id,
              op,
              opacity: { from: 1, to: 0 },
            });
            break;

          case INSERT:
            const newLeft =
              prevOp !== DELETE
                ? isNewLine
                  ? 0
                  : left
                : left - prevCode.length;

            primitives.push({
              el: el(top, newLeft, 0),
              id,
              op,
              opacity: { from: 0, to: 1 },
            });
            break;

          default:
          case EQUAL:
            const toLeft =
              prevOp === DELETE
                ? lastEqualOrAdd.length
                : prevLastOfSplit || prevIsNewLine
                  ? 0
                  : Math.max(0, left - prevCode.length);

            const fromTop = prevOp === INSERT ? topNoInsert : top;
            const toTop = prevOp === DELETE ? topNoDelete : top;

            primitives.push({
              el: el(fromTop, left),
              id,
              op,
              left: { from: left, to: toLeft },
              top: { from: fromTop, to: toTop },
            });
            break;
        }
      }
    }

    if (op !== DELETE) {
      lastEqualOrAdd = code;
    }

    if (op !== INSERT) {
      left = isNewLine || lastOfSplit ? 0 : left + code.length;
    }

    if (isNewLine) {
      top++;

      if (op !== INSERT) {
        topNoInsert++;
      }
      if (op !== DELETE) {
        topNoDelete++;
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
      if (primitive.opacity) {
        timeline.add(
          `#${primitive.id}`,
          {
            duration: config.animations.reveal.fade.duration,
            ease: config.animations.reveal.fade.ease,
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
            duration: config.animations.reveal.fade.duration,
            ease: config.animations.reveal.fade.ease,
            opacity: primitive.opacity,
          },
          config.animations.reveal.move.duration +
            config.animations.reveal.fade.duration,
        );
      }
      return;

    default:
    case EQUAL:
      if (primitive.left && primitive.top) {
        timeline.add(
          `#${primitive.id}`,
          {
            duration: config.animations.reveal.move.duration,
            ease: config.animations.reveal.move.ease,
            top: {
              from: `${primitive.top.from}em`,
              to: `${primitive.top.to}em`,
            },
            left: {
              from: `${primitive.left.from}ch`,
              to: `${primitive.left.to}ch`,
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
