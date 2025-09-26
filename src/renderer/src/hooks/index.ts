import { SlideData, Theme } from "@/types";
import { computed } from "vue";
import {
  setTheme as utilsSetTheme,
  generateHighlightedCode,
} from "@renderer/utils";
import {
  DiffAnimationPrimitive,
  CodeDiff,
  SlideDiff,
  INSERT,
  EQUAL,
  DELETE,
  FINAL,
  FINAL_CODE,
} from "@renderer/types";
import diff from "fast-diff";
import ShortUniqueId from "short-unique-id";
import { Timeline } from "animejs";

export * from "./stores";

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

// ---- Generate Animation ----

function generateId() {
  const { randomUUID } = new ShortUniqueId({ length: 10 });
  return `A-${randomUUID()}`;
}

function generateElement(id: string, content: string, style: string): string {
  return `<span id="${id}" class="absolute" style="${style}">${content}</span>`;
}

function generateDiffs(slides: SlideData[], language: string): SlideDiff[] {
  let entries: SlideDiff[] = [];

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

    entries.push({
      diffs: finalDiff,
      finalCode: generateHighlightedCode(slides[i + 1].code, language),
    });
  }

  return entries;
}

function generatePrimitivesForDiff(
  slideDiff: SlideDiff,
): DiffAnimationPrimitive[] {
  const items = slideDiff.diffs;

  let primitives: DiffAnimationPrimitive[] = [];

  const finalPrimitives: DiffAnimationPrimitive[] = [];

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
      // Fade out the primitive at the end of the animation for the current slide
      if (op === EQUAL || op === INSERT) {
        finalPrimitives.push({
          id,
          op: FINAL,
          opacity: { from: 1, to: 0 },
        });
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

  primitives = primitives.concat(finalPrimitives);

  // Push the last primitive, i.e. the final code of the slide
  const id = generateId();
  primitives.push({
    id,
    el: generateElement(
      id,
      slideDiff.finalCode,
      `top: 0rem; left: 0ch; opacity: 0`,
    ),
    op: FINAL_CODE,
    opacity: { from: 0, to: 1 },
  });

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

    case FINAL:
      if (primitive.opacity) {
        timeline.add(
          `#${primitive.id}`,
          {
            duration: slide.animations.fade.duration,
            ease: slide.animations.fade.ease,
            opacity: primitive.opacity,
          },
          slide.animations.move.duration + slide.animations.fade.duration * 2.5,
        );
      }
      return;

    case FINAL_CODE:
      if (primitive.opacity) {
        timeline.add(
          `#${primitive.id}`,
          {
            duration: slide.animations.fade.duration,
            ease: slide.animations.fade.ease,
            opacity: primitive.opacity,
          },
          slide.animations.move.duration + slide.animations.fade.duration * 2,
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
