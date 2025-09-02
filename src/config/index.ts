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
      id: "typescript",
      label: "TypeScript",
    },

    indent: 2,
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

  animations: {
    move: {
      minDuration: 200,
      maxDuration: 2000,
    },
    fade: {
      minDuration: 200,
      maxDuration: 2000,
    },
  },

  search: {
    languages: {
      limit: 10,
      delay: 200,
    },
  },
};
