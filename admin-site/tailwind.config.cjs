/** @type {import('tailwindcss').Config} */
const withMT = require("@material-tailwind/react/utils/withMT");

/** Arovis brand: navy #002D5A, blue #0070C0, cyan #00D2FF — full scales so `color="blue"` and `text-blue-*` match the product. */
const arovisBlue = {
  50: "#e8f4fc",
  100: "#c5e0f5",
  200: "#9eccec",
  300: "#76b7e3",
  400: "#4a9fd4",
  500: "#0070C0",
  600: "#0062a8",
  700: "#00508a",
  800: "#003d6b",
  900: "#002D5A",
  950: "#001a33",
};

const arovisCyan = {
  50: "#e6fbff",
  100: "#ccf5ff",
  200: "#99ebff",
  300: "#66e0ff",
  400: "#33d6ff",
  500: "#00D2FF",
  600: "#00a8cc",
  700: "#007f99",
  800: "#005566",
  900: "#002b33",
  950: "#001519",
};

module.exports = withMT({
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        arovis: {
          navy: "#002D5A",
          blue: "#0070C0",
          cyan: "#00D2FF",
        },
        blue: arovisBlue,
        cyan: arovisCyan,
      },
    },
  },
  plugins: [],
});
