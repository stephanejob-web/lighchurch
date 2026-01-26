import { createTheme } from '@mui/material/styles';

// Créer un thème Material-UI professionnel et moderne
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#4285F4', // Google Blue
      light: '#E8F0FE',
      dark: '#3367D6',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#EA4335', // Google Red
      light: '#FCE8E6',
      dark: '#C5221F',
      contrastText: '#ffffff',
    },
    error: {
      main: '#EA4335', // Google Red (same as secondary for consistency)
      light: '#FCE8E6',
      dark: '#C5221F',
    },
    warning: {
      main: '#FBBC04', // Google Yellow
      light: '#FEF7E0',
      dark: '#F9AB00',
    },
    success: {
      main: '#34A853', // Google Green
      light: '#E6F4EA',
      dark: '#188038',
    },
    background: {
      default: '#0F172A', // Deep dark blue/slate
      paper: '#1E293B',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#94A3B8',
    },
    divider: '#334155',
  },
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
      textTransform: 'none', // Désactiver le tout en majuscules
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8, // Coins arrondis modernes
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
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
          },
        },
        contained: {
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
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
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.3), 0 1px 2px -1px rgb(0 0 0 / 0.3)',
          '&:hover': {
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.3), 0 2px 4px -2px rgb(0 0 0 / 0.3)',
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
          backgroundColor: '#1E293B',
          borderRight: '1px solid #334155',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.3)',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid #334155',
        },
        head: {
          fontWeight: 600,
          backgroundColor: '#1E293B',
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

export default theme;
