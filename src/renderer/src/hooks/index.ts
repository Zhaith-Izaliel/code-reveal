import { SlideData, Theme } from "@/types";
import { computed } from "vue";
import { setTheme as utilsSetTheme } from "@renderer/utils";
import { AnimationPrimitives, CodeDiff } from "@renderer/types";
import Prism from "prismjs";
import diff from "fast-diff";
import ShortUniqueId from "short-unique-id";

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

const generateHighlightedCode = (
  code: string,
  language: string,
  grammar: Prism.Grammar,
): string => {
  if (code === "") {
    return "";
  }

  return Prism.highlight(code, grammar, language);
};

export function useHighlightCode() {
  return { generateHighlightedCode };
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
