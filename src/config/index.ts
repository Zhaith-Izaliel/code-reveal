import Prism from "prismjs";
import { Theme, AppConfig } from "../types";

export const config: AppConfig = {
  default: {
    fileName: "example.ts",
    color: "6366F1",
    slide: {
      code: "",
      thumbnail: "",
      animations: {
        move: {
          duration: 1000,
          ease: "inOut",
        },
        fade: {
          duration: 1000,
          ease: "inOut",
        },
      },
    },

    language: {
      name: "typescript",
      grammar: Prism.languages.typescript,
    },

    indent: {
      number: 2,
      character: " ",
    },
  },

  thumbnail: {
    width: 800,
    height: 500,
    skipAutoScale: true,
    cacheBust: true,
    backgroundColor: (theme: Theme) =>
      theme === "dark" ? "#050505" : "#FEFEFE",

    delay: 200,
  },
};
