import { createTheme, alpha, type Direction } from '@mui/material/styles';

/**
 * M.B.D. Premium admin theme — inspired by MUI Store dashboard templates
 * (Flat 2.0 surfaces, soft elevation, clear hierarchy). Not a 1:1 copy.
 */
export function createAppTheme(direction: Direction) {
  const primaryMain = '#1a365d';
  const primaryLight = '#2b4c7e';
  const surfaceBorder = alpha('#0f172a', 0.08);

  return createTheme({
    direction,
    cssVariables: true,
    palette: {
      mode: 'light',
      primary: {
        main: primaryMain,
        light: primaryLight,
        dark: '#0f2440',
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#64748b',
        light: '#94a3b8',
        dark: '#475569',
      },
      background: {
        default: '#f3f6fb',
        paper: '#ffffff',
      },
      divider: surfaceBorder,
      text: {
        primary: '#0f172a',
        secondary: '#64748b',
      },
      success: { main: '#16a34a', light: '#dcfce7', dark: '#15803d' },
      warning: { main: '#d97706', light: '#ffedd5', dark: '#b45309' },
      error: { main: '#dc2626', light: '#fee2e2', dark: '#b91c1c' },
      info: { main: '#2563eb', light: '#dbeafe', dark: '#1d4ed8' },
    },
    typography: {
      fontFamily:
        '"IBM Plex Sans", "IBM Plex Sans Hebrew", "Segoe UI", "Arial Hebrew", Arial, sans-serif',
      h1: { fontWeight: 700, letterSpacing: '-0.03em', fontSize: '2rem' },
      h2: { fontWeight: 700, letterSpacing: '-0.025em', fontSize: '1.75rem' },
      h3: { fontWeight: 700, letterSpacing: '-0.02em', fontSize: '1.5rem' },
      h4: { fontWeight: 700, letterSpacing: '-0.02em', fontSize: '1.375rem' },
      h5: { fontWeight: 650, fontSize: '1.125rem', letterSpacing: '-0.01em' },
      h6: { fontWeight: 650, fontSize: '1rem', letterSpacing: '-0.01em' },
      subtitle1: { fontWeight: 600 },
      subtitle2: { fontWeight: 600, fontSize: '0.875rem' },
      body1: { fontSize: '0.9375rem', lineHeight: 1.55 },
      body2: { fontSize: '0.875rem', lineHeight: 1.5 },
      caption: { fontSize: '0.75rem', lineHeight: 1.4, letterSpacing: '0.01em' },
      overline: {
        fontWeight: 700,
        letterSpacing: '0.08em',
        fontSize: '0.7rem',
      },
      button: { textTransform: 'none', fontWeight: 600 },
    },
    shape: {
      borderRadius: 12,
    },
    shadows: [
      'none',
      '0 1px 2px rgba(15, 23, 42, 0.04)',
      '0 1px 3px rgba(15, 23, 42, 0.06), 0 1px 2px rgba(15, 23, 42, 0.04)',
      '0 4px 16px rgba(15, 23, 42, 0.06)',
      '0 8px 28px rgba(15, 23, 42, 0.08)',
      '0 12px 36px rgba(15, 23, 42, 0.1)',
      '0 12px 36px rgba(15, 23, 42, 0.1)',
      '0 12px 36px rgba(15, 23, 42, 0.1)',
      '0 12px 36px rgba(15, 23, 42, 0.1)',
      '0 12px 36px rgba(15, 23, 42, 0.1)',
      '0 12px 36px rgba(15, 23, 42, 0.1)',
      '0 12px 36px rgba(15, 23, 42, 0.1)',
      '0 12px 36px rgba(15, 23, 42, 0.1)',
      '0 12px 36px rgba(15, 23, 42, 0.1)',
      '0 12px 36px rgba(15, 23, 42, 0.1)',
      '0 12px 36px rgba(15, 23, 42, 0.1)',
      '0 12px 36px rgba(15, 23, 42, 0.1)',
      '0 12px 36px rgba(15, 23, 42, 0.1)',
      '0 12px 36px rgba(15, 23, 42, 0.1)',
      '0 12px 36px rgba(15, 23, 42, 0.1)',
      '0 12px 36px rgba(15, 23, 42, 0.1)',
      '0 12px 36px rgba(15, 23, 42, 0.1)',
      '0 12px 36px rgba(15, 23, 42, 0.1)',
      '0 12px 36px rgba(15, 23, 42, 0.1)',
      '0 12px 36px rgba(15, 23, 42, 0.1)',
    ],
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: '#f3f6fb',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: 'none',
            borderBottom: `1px solid ${surfaceBorder}`,
            backgroundImage: 'none',
            backdropFilter: 'blur(10px)',
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            borderInlineEnd: 'none',
            backgroundImage: 'none',
          },
        },
      },
      MuiCard: {
        defaultProps: {
          elevation: 0,
        },
        styleOverrides: {
          root: {
            border: `1px solid ${surfaceBorder}`,
            boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
            borderRadius: 12,
            transition:
              'box-shadow 180ms ease, border-color 180ms ease, transform 180ms ease',
            '&:hover': {
              boxShadow: '0 4px 16px rgba(15, 23, 42, 0.06)',
              borderColor: alpha(primaryMain, 0.16),
            },
          },
        },
      },
      MuiPaper: {
        defaultProps: {
          elevation: 0,
        },
        styleOverrides: {
          rounded: {
            borderRadius: 12,
          },
        },
      },
      MuiButton: {
        defaultProps: {
          disableElevation: true,
        },
        styleOverrides: {
          root: {
            borderRadius: 10,
            fontWeight: 600,
            transition:
              'background-color 140ms ease, box-shadow 140ms ease, border-color 140ms ease',
          },
          contained: {
            boxShadow: '0 1px 2px rgba(15, 23, 42, 0.08)',
            '&:hover': {
              boxShadow: '0 4px 12px rgba(26, 54, 93, 0.22)',
            },
          },
          sizeLarge: {
            minHeight: 46,
            paddingInline: 20,
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
          },
        },
      },
      MuiTextField: {
        defaultProps: {
          size: 'medium',
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            backgroundColor: '#fff',
            transition: 'box-shadow 140ms ease',
            '&.Mui-focused': {
              boxShadow: `0 0 0 3px ${alpha(primaryMain, 0.12)}`,
            },
          },
        },
      },
      MuiTableHead: {
        styleOverrides: {
          root: {
            '& .MuiTableCell-head': {
              fontWeight: 650,
              backgroundColor: '#f8fafc',
              color: '#475569',
              whiteSpace: 'nowrap',
              borderBottom: `1px solid ${surfaceBorder}`,
            },
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            transition: 'background-color 120ms ease',
            '&:hover': {
              backgroundColor: alpha(primaryMain, 0.03),
            },
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderColor: alpha('#0f172a', 0.06),
            paddingTop: 14,
            paddingBottom: 14,
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            marginInline: 10,
            minHeight: 42,
            transition: 'background-color 140ms ease, color 140ms ease',
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 600,
            borderRadius: 8,
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 16,
            border: `1px solid ${surfaceBorder}`,
            boxShadow: '0 12px 36px rgba(15, 23, 42, 0.12)',
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: 10,
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            fontSize: '0.75rem',
            borderRadius: 8,
          },
        },
      },
      MuiSkeleton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
          },
        },
      },
      MuiAvatar: {
        styleOverrides: {
          root: {
            fontWeight: 700,
          },
        },
      },
    },
  });
}

export const DRAWER_WIDTH = 272;
export const DRAWER_WIDTH_COLLAPSED = 80;
export const SIDEBAR_BG = '#0b1f3a';
export const SIDEBAR_BG_ELEVATED = '#102848';
