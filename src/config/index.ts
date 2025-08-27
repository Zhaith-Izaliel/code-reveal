import { Theme, AppConfig } from "../types";

export const config: AppConfig = {
  slides: {
    defaultSlide: {
      code: "",
      thumbnail: "",
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
  animations: {
    reveal: {
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
};
