import { heroui } from "@heroui/theme";

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Override default sans to use tenant primary font
        sans: ["var(--font-primary)", "var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-secondary)", "var(--font-mono)", "monospace"],
        serif: ["var(--font-heading)", "var(--font-serif)", "Georgia", "serif"],

        // Explicit font classes for intentional use
        primary: ["var(--font-primary)", "var(--font-sans)", "system-ui", "sans-serif"],
        secondary: ["var(--font-secondary)", "var(--font-mono)", "monospace"],
        heading: ["var(--font-heading)", "var(--font-primary)", "var(--font-sans)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        brand: {
          primary: "rgb(var(--brand-primary) / <alpha-value>)",
          primarydark: "rgb(var(--brand-primary-dark) / <alpha-value>)",
          surface: "rgb(var(--brand-surface) / <alpha-value>)",
          surfacedark: "rgb(var(--brand-surface-dark) / <alpha-value>)",
          muted: "rgb(var(--brand-muted) / <alpha-value>)",
          muteddark: "rgb(var(--brand-muted-dark) / <alpha-value>)",
          // Enhanced brand color variations
          50: "rgb(var(--brand-primary) / 0.05)",
          100: "rgb(var(--brand-primary) / 0.1)",
          200: "rgb(var(--brand-primary) / 0.2)",
          300: "rgb(var(--brand-primary) / 0.3)",
          400: "rgb(var(--brand-primary) / 0.4)",
          500: "rgb(var(--brand-primary) / 0.5)",
          600: "rgb(var(--brand-primary) / 0.6)",
          700: "rgb(var(--brand-primary) / 0.7)",
          800: "rgb(var(--brand-primary) / 0.8)",
          900: "rgb(var(--brand-primary) / 0.9)",
        },
        text: {
          light: "rgb(var(--text-light) / <alpha-value>)",
          subtle: "rgb(var(--text-subtle) / <alpha-value>)",
          lightdark: "rgb(var(--text-light-dark) / <alpha-value>)",
          subtledark: "rgb(var(--text-subtle-dark) / <alpha-value>)",
        },
        // Industry-specific color palettes
        tech: {
          electric: "#00D4FF",
          neon: "#39FF14",
          plasma: "#FF073A",
          cyber: "#A020F0",
        },
        fashion: {
          rose: "#E91E63",
          gold: "#FFD700",
          pearl: "#F8F8FF",
          charcoal: "#36454F",
        },
        beauty: {
          bloom: "#FF69B4",
          natural: "#8FBC8F",
          luxury: "#DAA520",
          spa: "#20B2AA",
        },
        food: {
          fresh: "#32CD32",
          organic: "#228B22",
          premium: "#8B4513",
          vibrant: "#FF6347",
        },
        home: {
          warm: "#DEB887",
          modern: "#2F4F4F",
          comfort: "#F5DEB3",
          elegant: "#696969",
        },
        b2b: {
          professional: "#4682B4",
          corporate: "#2F4F4F",
          efficient: "#008080",
          reliable: "#708090",
        },
        cleaning: {
          fresh: "#0ea5e9", // sky-500 - fresh, clean blue
          sparkle: "#38bdf8", // sky-400 - lighter blue for highlights
          pure: "#f0f9ff", // sky-50 - pure white-blue
          trust: "#0284c7", // sky-600 - trustworthy deeper blue
          eco: "#22c55e", // green-500 - eco-friendly green
          natural: "#16a34a", // green-600 - natural products
          sanitize: "#a855f7", // purple-500 - sanitizing/disinfectant
          foam: "#e0f2fe", // sky-100 - foam/bubble effect
        },
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
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
          1: "hsl(var(--chart-1))",
          2: "hsl(var(--chart-2))",
          3: "hsl(var(--chart-3))",
          4: "hsl(var(--chart-4))",
          5: "hsl(var(--chart-5))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "float": {
          "0%, 100%": {
            transform: "translateY(0px)",
          },
          "50%": {
            transform: "translateY(-20px)",
          },
        },
        "parallax": {
          "0%, 100%": {
            transform: "translateX(0px) translateY(0px)",
          },
          "33%": {
            transform: "translateX(-10px) translateY(-10px)",
          },
          "66%": {
            transform: "translateX(10px) translateY(-5px)",
          },
        },
        "rotate-3d": {
          "0%": {
            transform: "rotate3d(1, 1, 0, 0deg)",
          },
          "25%": {
            transform: "rotate3d(1, 1, 0, 90deg)",
          },
          "50%": {
            transform: "rotate3d(1, 1, 0, 180deg)",
          },
          "75%": {
            transform: "rotate3d(1, 1, 0, 270deg)",
          },
          "100%": {
            transform: "rotate3d(1, 1, 0, 360deg)",
          },
        },
        "fade-in-up": {
          "0%": {
            opacity: "0",
            transform: "translateY(30px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        "fade-in-down": {
          "0%": {
            opacity: "0",
            transform: "translateY(-30px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        "fade-in-left": {
          "0%": {
            opacity: "0",
            transform: "translateX(-30px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateX(0)",
          },
        },
        "fade-in-right": {
          "0%": {
            opacity: "0",
            transform: "translateX(30px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateX(0)",
          },
        },
        "scale-in": {
          "0%": {
            opacity: "0",
            transform: "scale(0.9)",
          },
          "100%": {
            opacity: "1",
            transform: "scale(1)",
          },
        },
        "scale-up": {
          "0%": {
            transform: "scale(1)",
          },
          "100%": {
            transform: "scale(1.05)",
          },
        },
        "tech-glow": {
          "0%, 100%": {
            boxShadow: "0 0 20px rgba(0, 212, 255, 0.3), 0 0 40px rgba(160, 32, 240, 0.2)",
          },
          "50%": {
            boxShadow: "0 0 40px rgba(0, 212, 255, 0.6), 0 0 60px rgba(160, 32, 240, 0.4)",
          },
        },
        "gradient-x": {
          "0%, 100%": {
            backgroundPosition: "0% 50%",
          },
          "50%": {
            backgroundPosition: "100% 50%",
          },
        },
        "gradient-y": {
          "0%, 100%": {
            backgroundPosition: "50% 0%",
          },
          "50%": {
            backgroundPosition: "50% 100%",
          },
        },
        "gradient-xy": {
          "0%, 100%": {
            backgroundPosition: "0% 0%",
          },
          "25%": {
            backgroundPosition: "100% 0%",
          },
          "50%": {
            backgroundPosition: "100% 100%",
          },
          "75%": {
            backgroundPosition: "0% 100%",
          },
        },
        "fashion-shimmer": {
          "0%": {
            transform: "translateX(-100%)",
          },
          "100%": {
            transform: "translateX(100%)",
          },
        },
        "beauty-pulse": {
          "0%, 100%": {
            transform: "scale(1)",
            opacity: "1",
          },
          "50%": {
            transform: "scale(1.05)",
            opacity: "0.85",
          },
        },
        "home-sway": {
          "0%, 100%": {
            transform: "translateX(0px) rotate(0deg)",
          },
          "25%": {
            transform: "translateX(-5px) rotate(-1deg)",
          },
          "75%": {
            transform: "translateX(5px) rotate(1deg)",
          },
        },
        "b2b-slide": {
          "0%": {
            transform: "translateX(-20px)",
            opacity: "0",
          },
          "100%": {
            transform: "translateX(0)",
            opacity: "1",
          },
        },
        "cleaning-sparkle": {
          "0%, 100%": {
            transform: "scale(1) rotate(0deg)",
            opacity: "1",
          },
          "25%": {
            transform: "scale(1.1) rotate(90deg)",
            opacity: "0.8",
          },
          "50%": {
            transform: "scale(1.2) rotate(180deg)",
            opacity: "0.6",
          },
          "75%": {
            transform: "scale(1.1) rotate(270deg)",
            opacity: "0.8",
          },
        },
        "cleaning-bubble": {
          "0%": {
            transform: "translateY(0px) scale(1)",
            opacity: "0.7",
          },
          "50%": {
            transform: "translateY(-10px) scale(1.1)",
            opacity: "1",
          },
          "100%": {
            transform: "translateY(-20px) scale(0.9)",
            opacity: "0",
          },
        },
        "magnetic-hover": {
          "0%, 100%": {
            transform: "translate(0, 0)",
          },
          "25%": {
            transform: "translate(-2px, -2px)",
          },
          "50%": {
            transform: "translate(2px, 2px)",
          },
          "75%": {
            transform: "translate(-2px, 2px)",
          },
        },
        "bounce-subtle": {
          "0%, 100%": {
            transform: "translateY(0)",
          },
          "50%": {
            transform: "translateY(-10px)",
          },
        },
        "scroll": {
          "0%": {
            transform: "translateX(0)",
          },
          "100%": {
            transform: "translateX(-50%)",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "float": "float 6s ease-in-out infinite",
        "parallax": "parallax 8s ease-in-out infinite",
        "rotate-3d": "rotate-3d 10s linear infinite",
        "fade-in-up": "fade-in-up 0.6s ease-out",
        "fade-in-down": "fade-in-down 0.6s ease-out",
        "fade-in-left": "fade-in-left 0.6s ease-out",
        "fade-in-right": "fade-in-right 0.6s ease-out",
        "scale-in": "scale-in 0.5s ease-out",
        "scale-up": "scale-up 0.3s ease-out",
        "tech-glow": "tech-glow 2s ease-in-out infinite",
        "gradient-x": "gradient-x 3s ease infinite",
        "gradient-y": "gradient-y 3s ease infinite",
        "gradient-xy": "gradient-xy 4s ease infinite",
        "fashion-shimmer": "fashion-shimmer 1.5s ease-in-out infinite",
        "beauty-pulse": "beauty-pulse 3s ease-in-out infinite",
        "home-sway": "home-sway 4s ease-in-out infinite",
        "b2b-slide": "b2b-slide 0.8s ease-out",
        "cleaning-sparkle": "cleaning-sparkle 2.5s ease-in-out infinite",
        "cleaning-bubble": "cleaning-bubble 3s ease-in-out infinite",
        "magnetic-hover": "magnetic-hover 0.3s ease-in-out",
        "bounce-subtle": "bounce-subtle 2s ease-in-out infinite",
        "scroll": "scroll 30s linear infinite",
      },
      perspective: {
        '1000': '1000px',
        '1500': '1500px',
        '2000': '2000px',
      },
      transform: {
        '3d': 'preserve-3d',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  darkMode: ["class"],
  plugins: [heroui(), require("tailwindcss-animate")],
};
