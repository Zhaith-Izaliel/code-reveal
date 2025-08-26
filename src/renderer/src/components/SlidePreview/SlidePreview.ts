import { defineComponent, PropType } from "vue";

import { PrismData, SlideData } from "@/types";

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
  setup(props) {},
});
