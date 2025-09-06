import {
  computed,
  defineComponent,
  onBeforeMount,
  PropType,
  ref,
  watch,
} from "vue";

import { SlideData } from "@/types";

import { useCodeAnimation, useHighlightCode } from "@renderer/hooks";
import { DiffAnimationPrimitive } from "@renderer/types";
import { createTimeline } from "animejs";

import CodeWindow from "@renderer/components/CodeWindow.vue";

export default defineComponent({
  components: {
    CodeWindow,
  },

  props: {
    language: { type: String, required: true },
    slides: { type: Array as PropType<SlideData[]>, required: true },
    selectedSlide: { type: Number, required: true },
    fileName: { type: String, required: true },
    color: { type: String, required: true },
    codeAreaSize: { type: Number, required: true },
  },

  emits: ["playing", "completed"],

  setup(props, { emit }) {
    const { generateHighlightedCode } = useHighlightCode();
    const { generateAnimationsPrimitives, assignTimeline } = useCodeAnimation();

    let primitives: DiffAnimationPrimitive[][] = [];
    const timelineCompleted = ref(false);

    const timeline = createTimeline({
      onBegin: () => {
        emit("playing", true);
        emit("completed", false);
      },
      onComplete: () => {
        timelineCompleted.value = true;
        emit("playing", false);
        emit("completed", true);
      },
    });

    onBeforeMount(() => {
      primitives = generateAnimationsPrimitives(props.slides, props.language);
    });

    const animationId = computed(() => Math.max(0, props.selectedSlide - 1));
    const slideId = computed(() => props.selectedSlide);
    const codeToDisplay = computed(() => {
      if (
        props.selectedSlide === 0 ||
        timelineCompleted.value ||
        primitives.length === 0
      ) {
        return generateHighlightedCode(
          props.slides[props.selectedSlide].code,
          props.language,
        );
      }

      return primitives[animationId.value].reduce(
        (acc, item) => acc + item.el,
        "",
      );
    });

    const generateAndPlayAnimation = () => {
      if (
        props.selectedSlide === 0 ||
        timelineCompleted.value ||
        primitives.length === 0
      ) {
        return;
      }

      primitives[animationId.value].forEach((item) => {
        assignTimeline(item, timeline, props.slides[props.selectedSlide]);
      });

      timeline.play();
    };

    watch(
      slideId,
      (newId) => {
        if (newId === 0) {
          return;
        }

        emit("completed", false);
        timelineCompleted.value = false;
      },
      { immediate: true },
    );

    return { codeToDisplay, generateAndPlayAnimation };
  },
});
