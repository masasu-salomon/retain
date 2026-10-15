import { createTheme } from '@mui/material/styles';

// Light and dark schemes; the user's OS preference is used until they pick one in the app bar.
export const theme = createTheme({
  cssVariables: { colorSchemeSelector: 'class' },
  colorSchemes: {
    light: {
      palette: {
        primary: { main: '#0f766e', contrastText: '#ffffff' },
        secondary: { main: '#6366f1' },
        background: { default: '#f5f7f9', paper: '#ffffff' },
      },
    },
    dark: {
      palette: {
        primary: { main: '#2dd4bf', contrastText: '#042f2e' },
        secondary: { main: '#a5b4fc' },
        background: { default: '#0b1215', paper: '#121b1f' },
      },
    },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: '"Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
    h4: { fontWeight: 700, letterSpacing: '-0.02em' },
    h5: { fontWeight: 700, letterSpacing: '-0.01em' },
    h6: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiCard: {
      defaultProps: { variant: 'outlined' },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
    },
    MuiTextField: {
      defaultProps: { size: 'small', fullWidth: true },
    },
    MuiChip: {
      styleOverrides: { root: { fontWeight: 500 } },
    },
    MuiTableCell: {
      styleOverrides: { head: { fontWeight: 600 } },
    },
  },
});
