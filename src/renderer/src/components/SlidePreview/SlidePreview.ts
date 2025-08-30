import {
  computed,
  defineComponent,
  onBeforeMount,
  PropType,
  ref,
  watch,
} from "vue";

import { PrismData, SlideData } from "@/types";

import { useCodeAnimation, useHighlightCode } from "@renderer/hooks";
import { DiffAnimationPrimitive } from "@renderer/types";
import { createTimeline } from "animejs";

import CodeWindow from "@renderer/components/CodeWindow.vue";

export default defineComponent({
  components: {
    CodeWindow,
  },

  props: {
    language: { type: Object as PropType<PrismData>, required: true },
    slides: { type: Array as PropType<SlideData[]>, required: true },
    selectedSlide: { type: Number, required: true },
    fileName: { type: String, required: true },
    color: { type: String, required: true },
    codeAreaSize: { type: Number, required: true },
  },
  setup(props) {
    const { generateHighlightedCode } = useHighlightCode();
    const { generateAnimationsPrimitives, assignTimeline } = useCodeAnimation();

    let primitives: DiffAnimationPrimitive[][] = [];

    const timelineCompleted = ref(false);

    onBeforeMount(() => {
      primitives = generateAnimationsPrimitives(
        props.slides,
        props.language.name,
        props.language.grammar,
      );
    });

    const animationId = computed(() => Math.max(0, props.selectedSlide - 1));
    const slideId = computed(() => props.selectedSlide);
    const codeToDisplay = computed(() => {
      if (props.selectedSlide === 0 || timelineCompleted.value) {
        return generateHighlightedCode(
          props.slides[props.selectedSlide].code,
          props.language.name,
          props.language.grammar,
        );
      }

      return primitives[animationId.value].reduce(
        (acc, item) => acc + item.el,
        "",
      );
    });

    const generateAndPlayAnimation = () => {
      if (props.selectedSlide === 0 || timelineCompleted.value) {
        return;
      }

      const timeline = createTimeline();
      primitives[animationId.value].forEach((item) => {
        assignTimeline(item, timeline);
      });

      timeline.play().then(() => {
        timelineCompleted.value = true;
      });
    };

    watch(
      slideId,
      () => {
        timelineCompleted.value = false;
      },
      { immediate: true },
    );

    return { codeToDisplay, generateAndPlayAnimation };
  },
});
