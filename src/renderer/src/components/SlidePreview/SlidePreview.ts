import { computed, defineComponent, onBeforeMount, ref, watch } from "vue";

import {
  useCodeAnimation,
  useHighlightCode,
  useSave,
  useSlides,
} from "@renderer/hooks";
import { DiffAnimationPrimitive } from "@renderer/types";
import { createTimeline } from "animejs";

import { Button } from "primevue";
import CodeWindow from "@renderer/components/CodeWindow.vue";

export default defineComponent({
  components: {
    CodeWindow,
    PrimeButton: Button,
  },

  props: {
    codeAreaSize: { type: Number, required: true },
  },

  emits: ["playing", "completed"],

  setup(_props, { emit }) {
    const { generateHighlightedCode } = useHighlightCode();
    const { generateAnimationsPrimitives, assignTimeline } = useCodeAnimation();
    const slidesStore = useSlides();
    const saveStore = useSave();

    const completed = ref(true);
    const playing = ref<boolean>(false);

    let primitives: DiffAnimationPrimitive[][] = [];

    const timeline = createTimeline({
      onBegin: () => {
        playing.value = true;
        completed.value = false;
      },
      onComplete: () => {
        completed.value = true;
        playing.value = true;
      },
    });

    onBeforeMount(() => {
      primitives = generateAnimationsPrimitives(
        slidesStore.slides,
        saveStore.save.language,
      );
    });

    const animationId = computed(() =>
      Math.max(0, slidesStore.selectedIndex - 1),
    );
    const slideId = computed(() => slidesStore.selectedIndex);
    const codeToDisplay = computed(() => {
      if (
        slidesStore.selectedIndex === 0 ||
        completed.value ||
        primitives.length === 0
      ) {
        return generateHighlightedCode(
          slidesStore.slides[slidesStore.selectedIndex].code,
          saveStore.save.language,
        );
      }

      return primitives[animationId.value].reduce(
        (acc, item) => acc + item.el,
        "",
      );
    });

    const generateAndPlayAnimation = () => {
      if (
        slidesStore.selectedIndex === 0 ||
        completed.value ||
        primitives.length === 0
      ) {
        return;
      }

      primitives[animationId.value].forEach((item) => {
        assignTimeline(
          item,
          timeline,
          slidesStore.slides[slidesStore.selectedIndex],
        );
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
        completed.value = false;
      },
      { immediate: true },
    );

    return {
      save: saveStore.save,
      slidesStore,
      codeToDisplay,
      generateAndPlayAnimation,
      playing,
      completed,
    };
  },
});
