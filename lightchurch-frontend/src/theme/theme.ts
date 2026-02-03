import { createTheme, alpha } from '@mui/material/styles';
import type { ThemeOptions } from '@mui/material/styles';

// Créer une fonction qui retourne les options de thème en fonction du mode
export const getThemeOptions = (mode: 'light' | 'dark'): ThemeOptions => ({
  palette: {
    mode,
    primary: {
      main: '#4285F4', // Google Blue
      light: mode === 'light' ? '#E8F0FE' : '#172B4D',
      dark: '#3367D6',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#EA4335', // Google Red
      light: mode === 'light' ? '#FCE8E6' : '#3D1D1B',
      dark: '#C5221F',
      contrastText: '#ffffff',
    },
    error: {
      main: '#EA4335', // Google Red
      light: mode === 'light' ? '#FCE8E6' : '#3D1D1B',
      dark: '#C5221F',
    },
    warning: {
      main: '#FBBC04', // Google Yellow
      light: mode === 'light' ? '#FEF7E0' : '#3E3414',
      dark: '#F9AB00',
    },
    success: {
      main: '#34A853', // Google Green
      light: mode === 'light' ? '#E6F4EA' : '#1B3222',
      dark: '#188038',
    },
    background: {
      default: mode === 'light' ? '#F1F5F9' : '#0F172A',
      paper: mode === 'light' ? '#FFFFFF' : '#1E293B',
    },
    text: {
      primary: mode === 'light' ? '#1E293B' : '#FFFFFF',
      secondary: mode === 'light' ? '#64748B' : '#94A3B8',
    },
    divider: mode === 'light' ? '#E2E8F0' : '#334155',
    action: {
      hover: mode === 'light' ? alpha('#4285F4', 0.04) : alpha('#FFFFFF', 0.05),
      selected: mode === 'light' ? alpha('#4285F4', 0.08) : alpha('#FFFFFF', 0.1),
    },
  },
  shadows: [
    'none',
    mode === 'light' ? '0 1px 2px 0 rgba(0,0,0,0.05)' : '0 1px 2px 0 rgba(0,0,0,0.3)',
    mode === 'light' ? '0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px -1px rgba(0,0,0,0.1)' : '0 1px 3px 0 rgba(0,0,0,0.4), 0 1px 2px -1px rgba(0,0,0,0.4)',
    mode === 'light' ? '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)' : '0 4px 6px -1px rgba(0,0,0,0.5), 0 2px 4px -2px rgba(0,0,0,0.5)',
    mode === 'light' ? '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)' : '0 10px 15px -3px rgba(0,0,0,0.6), 0 4px 6px -4px rgba(0,0,0,0.6)',
    ...Array(20).fill('none'), // Fill standard MUI shadows
  ] as any,
  typography: {
    fontFamily: '"Roboto", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 24px',
          fontSize: '0.9375rem',
          fontWeight: 500,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: mode === 'light' ? '0 4px 8px rgba(0, 0, 0, 0.1)' : '0 4px 8px rgba(0, 0, 0, 0.4)',
          },
        },
        contained: {
          '&:hover': {
            boxShadow: mode === 'light' ? '0 4px 12px rgba(66, 133, 244, 0.2)' : '0 4px 12px rgba(0, 0, 0, 0.3)',
          },
        },
        sizeLarge: {
          padding: '12px 32px',
          fontSize: '1rem',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          boxShadow: mode === 'light' 
            ? '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)' 
            : '0 1px 3px 0 rgb(0 0 0 / 0.3), 0 1px 2px -1px rgb(0 0 0 / 0.3)',
          border: mode === 'light' ? '1px solid #E2E8F0' : 'none',
          '&:hover': {
            boxShadow: mode === 'light' 
              ? '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' 
              : '0 4px 6px -1px rgb(0 0 0 / 0.3), 0 2px 4px -2px rgb(0 0 0 / 0.3)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: mode === 'light' ? '#FFFFFF' : '#1E293B',
          borderRight: mode === 'light' ? '1px solid #E2E8F0' : '1px solid #334155',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          boxShadow: mode === 'light' 
            ? '0 1px 3px 0 rgb(0 0 0 / 0.05)' 
            : '0 1px 3px 0 rgb(0 0 0 / 0.3)',
          backgroundColor: mode === 'light' ? '#FFFFFF' : '#1E293B',
          color: mode === 'light' ? '#1E293B' : '#FFFFFF',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: mode === 'light' ? '1px solid #E2E8F0' : '1px solid #334155',
        },
        head: {
          fontWeight: 600,
          backgroundColor: mode === 'light' ? '#F8FAFC' : '#1E293B',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontSize: '0.9375rem',
          fontWeight: 500,
        },
      },
    },
  },
});

// Thème par défaut exporté (optionnel, pour compatibilité si nécessaire)
const theme = createTheme(getThemeOptions('dark'));
export default theme;

