/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}","./node_modules/@shadcn/ui/**/*.js",],
  theme: {
    extend: {
      colors: {
        // Configure your color palette here
        navcolor1: "#1F2428",
        navcolor2: "#181B1E",
        footercolor: "#1F2428",
        textprimarycolor1: "#E0E0E0",
        mainbgcolor: "#24292E",
        textColorGreen: "#A6DA95",
        textColorRed: "#ED8796",
        bgColorLightRed: "#F9826C"
      },
    },
  },
  plugins: [],
};
