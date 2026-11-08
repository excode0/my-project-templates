import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/templates/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // KOREX Brand Colors (from logo)
        background: {
          DEFAULT: "hsl(var(--background))",
          dark: "#12141C", // Slate Dark (main dark bg)
          darker: "#0F1117", // Obsidian (deeper sections)
        },
        foreground: {
          DEFAULT: "hsl(var(--foreground))",
          light: "#FDFBF7", // Cream Light (main text)
          secondary: "#94A3B8", // Gray Light (secondary text)
        },
        // Fire/Flame colors from logo
        fire: {
          50: "#FFF7ED",
          100: "#FFEDD5",
          200: "#FED7AA",
          300: "#FDBA74",
          400: "#FB923C",
          500: "#F97316", // Primary Orange Glow
          600: "#EA580C", // Deep Orange
          700: "#C2410C",
          800: "#9A3412",
          900: "#7C2D12",
        },
        // Accent red-orange gradient
        flame: {
          start: "#F97316", // Orange
          middle: "#EA580C", // Deep Orange
          end: "#DC2626", // Red
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
      },
      fontFamily: {
        // Display/Heading (Serif - elegant)
        display: ["var(--font-playfair)", "Playfair Display", "serif"],
        heading: ["var(--font-playfair)", "Merriweather", "serif"],
        // Body (Sans-Serif - clean)
        sans: ["var(--font-inter)", "Inter", "Plus Jakarta Sans", "system-ui", "sans-serif"],
        body: ["var(--font-inter)", "Inter", "sans-serif"],
      },
      backgroundImage: {
        // Fire gradients
        "gradient-fire": "linear-gradient(135deg, #F97316 0%, #EA580C 50%, #DC2626 100%)",
        "gradient-fire-radial": "radial-gradient(circle, #F97316 0%, #EA580C 50%, #DC2626 100%)",
        "gradient-dark": "linear-gradient(135deg, #12141C 0%, #0F1117 100%)",
      },
      boxShadow: {
        // Fire glow effects
        "glow-fire": "0 0 20px rgba(249, 115, 22, 0.3), 0 0 40px rgba(234, 88, 12, 0.2)",
        "glow-fire-lg": "0 0 30px rgba(249, 115, 22, 0.4), 0 0 60px rgba(234, 88, 12, 0.3)",
        "glow-fire-xl": "0 0 40px rgba(249, 115, 22, 0.5), 0 0 80px rgba(234, 88, 12, 0.4)",
      },
      animation: {
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
        "fire-flicker": "fire-flicker 3s ease-in-out infinite",
        float: "float 7s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-14px)" },
        },
        "glow-pulse": {
          "0%, 100%": { 
            boxShadow: "0 0 20px rgba(249, 115, 22, 0.3), 0 0 40px rgba(234, 88, 12, 0.2)" 
          },
          "50%": { 
            boxShadow: "0 0 30px rgba(249, 115, 22, 0.5), 0 0 60px rgba(234, 88, 12, 0.4)" 
          },
        },
        "fire-flicker": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.8" },
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
