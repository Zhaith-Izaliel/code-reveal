import _ from "lodash";
import { toPng } from "html-to-image";
import { Theme } from "@/types";

export function usePreviewGeneration() {
  const { config } = window;

  const generatePreview = async (el: HTMLElement | null, theme: Theme) => {
    if (!el) {
      return "";
    }

    try {
      return await toPng(el, {
        width: config.preview.width,
        height: config.preview.height,
        skipAutoScale: config.preview.skipAutoScale,
        backgroundColor: config.preview.backgroundColor(theme),
        cacheBust: config.preview.cacheBust,
      });
    } catch (err) {
      console.error(err);
      return "";
    }
  };

  return {
    generatePreview,
  };
}
