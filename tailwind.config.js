/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary palette
        primary: {
          DEFAULT: '#8B5CF6',
          hover: '#7C3AED',
          active: '#6D28D9',
        },
        secondary: {
          DEFAULT: '#EC4899',
          hover: '#DB2777',
        },
        accent: {
          DEFAULT: '#06B6D4',
          hover: '#0891B2',
        },
        // Semantic
        success: {
          DEFAULT: '#10B981',
          bg: 'rgba(16, 185, 129, 0.15)',
        },
        warning: {
          DEFAULT: '#F59E0B',
          bg: 'rgba(245, 158, 11, 0.15)',
        },
        error: {
          DEFAULT: '#EF4444',
          bg: 'rgba(239, 68, 68, 0.15)',
        },
        info: {
          DEFAULT: '#3B82F6',
          bg: 'rgba(59, 130, 246, 0.15)',
        },
        // Dark mode backgrounds (deep indigo)
        dark: {
          page: '#0F0F23',
          card: '#1A1A2E',
          subtle: '#16213E',
          elevated: '#1E1E3F',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 8px -2px rgba(0, 0, 0, 0.08), 0 4px 16px -4px rgba(0, 0, 0, 0.06)',
        'card': '0 1px 3px rgba(0, 0, 0, 0.06), 0 4px 12px rgba(0, 0, 0, 0.04)',
        'glow': '0 0 20px rgba(139, 92, 246, 0.3)',
        'glow-pink': '0 0 20px rgba(236, 72, 153, 0.3)',
      },
      borderRadius: {
        'xl': '0.875rem',
        '2xl': '1rem',
      },
      backgroundImage: {
        'gradient-creative': 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 50%, #06B6D4 100%)',
        'gradient-button': 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
        'gradient-glow': 'radial-gradient(ellipse at top, rgba(139, 92, 246, 0.15) 0%, transparent 50%)',
      },
    },
  },
  plugins: [],
}
