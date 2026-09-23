import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                bg: {
                    main: "var(--bg-main)",
                    panel: "var(--bg-panel)",
                    soft: "var(--bg-panel-soft)",
                },
                text: {
                    main: "var(--text-main)",
                    muted: "var(--text-muted)",
                },
                border: {
                    soft: "var(--border-soft)",
                },
                coalition: {
                    gold: "var(--coalition-gold)",
                },
                angel: "var(--angel)",
                ghost: "var(--ghost)",
                demon: "var(--demon)",
            },
            fontFamily: {
                sans: ["var(--font-inter)", "system-ui", "sans-serif"],
                mono: ["var(--font-mono)", "monospace"],
            },
            boxShadow: {
                gold: "0 0 24px var(--coalition-glow)",
                ghost: "0 0 24px var(--ghost-glow)",
                demon: "0 0 24px var(--demon-glow)",
                angel: "0 0 24px var(--angel-glow)",
            },
        },
    },
    plugins: [],
};
export default config;
