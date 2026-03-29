import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('tailwindcss').Config} */
export default {
  content: [path.join(__dirname, "src/**/*.{astro,html,js,ts}")],
  theme: {
    extend: {
      opacity: {
        6: "0.06",
        8: "0.08",
        14: "0.14",
      },
    },
  },
};
