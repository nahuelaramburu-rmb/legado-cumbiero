import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        cumbia: {
          night: "#0B0710",
          purple: "#3B1466",
          magenta: "#E9376F",
          gold: "#F2B807",
          cream: "#FFF6E9",
          // Paleta "neón 90's/2000's" tomada del mockup de marca
          pink: "#FF2E93",
          yellow: "#FFD400",
          cyan: "#22E1E1",
          violet: "#8B2FF2",
        },
      },
      backgroundImage: {
        "cumbia-glow":
          "radial-gradient(circle at 15% 10%, rgba(255,46,147,0.30), transparent 50%), radial-gradient(circle at 85% 0%, rgba(34,225,225,0.18), transparent 45%), radial-gradient(circle at 50% 100%, rgba(139,47,242,0.25), transparent 55%), linear-gradient(180deg, #0B0710 0%, #17091f 100%)",
      },
    },
  },
  plugins: [],
};
export default config;
