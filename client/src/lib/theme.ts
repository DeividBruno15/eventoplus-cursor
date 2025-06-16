// Evento+ Design System Theme Configuration
export const theme = {
  colors: {
    // Brand Colors
    primary: '#3C5BFA',      // Primary blue
    secondary: '#FFA94D',    // Orange accent
    
    // Text Colors
    text: {
      primary: '#000000',    // Black for main text
      secondary: '#4B5563',  // Gray-700 for subtitles/secondary text
      muted: '#6B7280',      // Gray-500 for muted text
      white: '#FFFFFF',      // White text
    },
    
    // Background Colors
    background: {
      primary: '#FFFFFF',    // White background
      secondary: '#F9FAFB',  // Gray-50 for sections
      muted: '#F3F4F6',      // Gray-100 for cards
    },
    
    // Status Colors
    success: '#10B981',      // Green-500
    warning: '#F59E0B',      // Amber-500
    error: '#EF4444',        // Red-500
    info: '#3B82F6',         // Blue-500
  },
  
  // CSS Custom Properties for Tailwind
  cssVariables: {
    light: {
      '--primary': '60 91 250',           // #3C5BFA in RGB
      '--primary-foreground': '255 255 255',
      '--secondary': '255 169 77',        // #FFA94D in RGB
      '--secondary-foreground': '0 0 0',
      '--background': '255 255 255',
      '--foreground': '0 0 0',
      '--muted': '249 250 251',
      '--muted-foreground': '75 85 99',
    },
    dark: {
      '--primary': '60 91 250',
      '--primary-foreground': '255 255 255',
      '--secondary': '255 169 77',
      '--secondary-foreground': '0 0 0',
      '--background': '15 23 42',
      '--foreground': '255 255 255',
      '--muted': '30 41 59',
      '--muted-foreground': '148 163 184',
    }
  },
  
  // Gradients
  gradients: {
    hero: 'linear-gradient(135deg, #3C5BFA 0%, #4C6AFF 50%, #FFA94D 100%)',
    primary: 'linear-gradient(135deg, #3C5BFA 0%, #4C6AFF 100%)',
    secondary: 'linear-gradient(135deg, #FFA94D 0%, #FFB366 100%)',
  },
  
  // Typography Scale
  typography: {
    fontFamily: {
      sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
    },
    fontSize: {
      xs: '0.75rem',     // 12px
      sm: '0.875rem',    // 14px
      base: '1rem',      // 16px
      lg: '1.125rem',    // 18px
      xl: '1.25rem',     // 20px
      '2xl': '1.5rem',   // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem',  // 36px
      '5xl': '3rem',     // 48px
      '6xl': '3.75rem',  // 60px
    }
  },
  
  // Spacing Scale
  spacing: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',   // 48px
    '3xl': '4rem',   // 64px
  },
  
  // Border Radius
  borderRadius: {
    none: '0',
    sm: '0.125rem',    // 2px
    md: '0.375rem',    // 6px
    lg: '0.5rem',      // 8px
    xl: '0.75rem',     // 12px
    '2xl': '1rem',     // 16px
    full: '9999px',
  },
  
  // Shadows
  boxShadow: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  },
  
  // Breakpoints
  screens: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  }
} as const;

export type Theme = typeof theme;