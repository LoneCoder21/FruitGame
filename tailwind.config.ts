import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}"
    ],
    theme: {
        extend: {
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))"
            },
            aspectRatio: {
                "4/5": "4 / 5"
            }
        },
        fontSize: {
            xsm: "1.063rem",
            sm: "1.563rem",
            smmed: "2.063rem",
            base: "2.352rem",
            med: "3.052rem",
            xl: "4.052rem",
            mxl: "5.052rem"
        }
    },
    plugins: [require("@designbycode/tailwindcss-text-stroke")]
};
export default config;
