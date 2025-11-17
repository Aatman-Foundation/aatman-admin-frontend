import { extendTheme, withDefaultColorScheme } from '@chakra-ui/react';

const brandGradient = {
  50: '#f0f7ff',
  100: '#d6e4ff',
  200: '#adc8ff',
  300: '#84a9ff',
  400: '#6688ff',
  500: '#4c6fff',
  600: '#3654db',
  700: '#273bb7',
  800: '#1a248c',
  900: '#0d1457'
};

const components = {
  Button: {
    baseStyle: {
      borderRadius: 'xl',
      fontWeight: 'semibold'
    },
    variants: {
      solid: ({ colorMode }) => ({
        bgGradient:
          colorMode === 'light'
            ? 'linear(to-r, brand.500, purple.500)'
            : 'linear(to-r, brand.300, purple.300)',
        color: 'white',
        _hover: {
          opacity: 0.95,
          boxShadow: 'lg'
        },
        _active: { opacity: 0.85 }
      })
    }
  },
  Card: {
    baseStyle: {
      container: {
        borderRadius: '2xl',
        boxShadow: 'lg',
        borderWidth: '1px',
        borderColor: 'blackAlpha.100',
        _dark: {
          borderColor: 'whiteAlpha.200'
        }
      }
    }
  },
  Input: {
    baseStyle: {
      field: {
        borderRadius: 'xl'
      }
    }
  }
};

const focusRing = {
  borderRadius: 'xl',
  boxShadow: '0 0 0 3px rgba(76, 111, 255, 0.4)'
};

const theme = extendTheme(
  {
    config: {
      initialColorMode: 'light',
      useSystemColorMode: false
    },
    colors: {
      brand: brandGradient
    },
    styles: {
      global: ({ colorMode }) => ({
        body: {
          bg: colorMode === 'light' ? 'gray.50' : 'gray.900',
          color: colorMode === 'light' ? 'gray.800' : 'gray.100'
        },
        '*:focus-visible': focusRing
      })
    },
    semanticTokens: {
      colors: {
        'status.pending': { default: 'orange.500', _dark: 'orange.300' },
        'status.under_review': { default: 'yellow.500', _dark: 'yellow.300' },
        'status.verified': { default: 'green.500', _dark: 'green.300' },
        'status.rejected': { default: 'red.500', _dark: 'red.300' }
      },
      radii: {
        xl: '1rem',
        '2xl': '1.5rem'
      }
    },
    fonts: {
      heading: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      body: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    },
    shadows: {
      subtle: '0 10px 30px -15px rgba(76, 111, 255, 0.35)'
    }
  },
  withDefaultColorScheme({ colorScheme: 'brand' })
);

export default theme;
