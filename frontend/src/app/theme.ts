import { createTheme, alpha, type Direction } from '@mui/material/styles';

/**
 * M.B.D. Dashboard theme — SaaS admin look inspired by MUI Dashboard templates.
 * Direction is applied at runtime for Hebrew (RTL) / English (LTR).
 */
export function createAppTheme(direction: Direction) {
  const primaryMain = '#1e3a5f';

  return createTheme({
    direction,
    cssVariables: true,
    palette: {
      mode: 'light',
      primary: {
        main: primaryMain,
        light: '#2d5a8e',
        dark: '#132740',
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#5c6b7a',
        light: '#8494a3',
        dark: '#3d4854',
      },
      background: {
        default: '#f0f4f8',
        paper: '#ffffff',
      },
      divider: alpha('#0f172a', 0.08),
      text: {
        primary: '#0f172a',
        secondary: '#64748b',
      },
      success: { main: '#2e7d4f', light: '#e8f5ee' },
      warning: { main: '#b45309', light: '#fff7ed' },
      error: { main: '#b91c1c', light: '#fef2f2' },
      info: { main: '#1d4ed8', light: '#eff6ff' },
    },
    typography: {
      fontFamily:
        '"IBM Plex Sans", "IBM Plex Sans Hebrew", "Segoe UI", "Arial Hebrew", Arial, sans-serif',
      h1: { fontWeight: 700, letterSpacing: '-0.025em', fontSize: '2rem' },
      h2: { fontWeight: 700, letterSpacing: '-0.02em', fontSize: '1.75rem' },
      h3: { fontWeight: 700, letterSpacing: '-0.02em', fontSize: '1.5rem' },
      h4: { fontWeight: 700, letterSpacing: '-0.02em', fontSize: '1.375rem' },
      h5: { fontWeight: 650, fontSize: '1.125rem' },
      h6: { fontWeight: 650, fontSize: '1rem' },
      subtitle1: { fontWeight: 600 },
      subtitle2: { fontWeight: 600, fontSize: '0.875rem' },
      body1: { fontSize: '0.9375rem', lineHeight: 1.55 },
      body2: { fontSize: '0.875rem', lineHeight: 1.5 },
      caption: { fontSize: '0.75rem', lineHeight: 1.4 },
      button: { textTransform: 'none', fontWeight: 600 },
    },
    shape: {
      borderRadius: 10,
    },
    shadows: [
      'none',
      '0 1px 2px rgba(15, 23, 42, 0.04)',
      '0 1px 3px rgba(15, 23, 42, 0.06), 0 1px 2px rgba(15, 23, 42, 0.04)',
      '0 4px 12px rgba(15, 23, 42, 0.06)',
      '0 8px 24px rgba(15, 23, 42, 0.08)',
      '0 8px 24px rgba(15, 23, 42, 0.08)',
      '0 8px 24px rgba(15, 23, 42, 0.08)',
      '0 8px 24px rgba(15, 23, 42, 0.08)',
      '0 8px 24px rgba(15, 23, 42, 0.08)',
      '0 8px 24px rgba(15, 23, 42, 0.08)',
      '0 8px 24px rgba(15, 23, 42, 0.08)',
      '0 8px 24px rgba(15, 23, 42, 0.08)',
      '0 8px 24px rgba(15, 23, 42, 0.08)',
      '0 8px 24px rgba(15, 23, 42, 0.08)',
      '0 8px 24px rgba(15, 23, 42, 0.08)',
      '0 8px 24px rgba(15, 23, 42, 0.08)',
      '0 8px 24px rgba(15, 23, 42, 0.08)',
      '0 8px 24px rgba(15, 23, 42, 0.08)',
      '0 8px 24px rgba(15, 23, 42, 0.08)',
      '0 8px 24px rgba(15, 23, 42, 0.08)',
      '0 8px 24px rgba(15, 23, 42, 0.08)',
      '0 8px 24px rgba(15, 23, 42, 0.08)',
      '0 8px 24px rgba(15, 23, 42, 0.08)',
      '0 8px 24px rgba(15, 23, 42, 0.08)',
      '0 8px 24px rgba(15, 23, 42, 0.08)',
    ],
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: '#f0f4f8',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: 'none',
            borderBottom: `1px solid ${alpha('#0f172a', 0.08)}`,
            backgroundImage: 'none',
            backdropFilter: 'blur(8px)',
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            borderInlineEnd: `1px solid ${alpha('#0f172a', 0.08)}`,
            backgroundImage: 'none',
            backgroundColor: '#ffffff',
          },
        },
      },
      MuiCard: {
        defaultProps: {
          elevation: 0,
        },
        styleOverrides: {
          root: {
            border: `1px solid ${alpha('#0f172a', 0.08)}`,
            boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
            transition: 'box-shadow 160ms ease, border-color 160ms ease',
            '&:hover': {
              boxShadow: '0 4px 12px rgba(15, 23, 42, 0.06)',
            },
          },
        },
      },
      MuiPaper: {
        defaultProps: {
          elevation: 0,
        },
      },
      MuiButton: {
        defaultProps: {
          disableElevation: true,
        },
        styleOverrides: {
          root: {
            borderRadius: 8,
            transition: 'background-color 120ms ease, box-shadow 120ms ease',
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
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
            },
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            transition: 'background-color 120ms ease',
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderColor: alpha('#0f172a', 0.06),
            paddingTop: 12,
            paddingBottom: 12,
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            marginInline: 8,
            minHeight: 42,
            transition: 'background-color 120ms ease, color 120ms ease',
            '&.Mui-selected': {
              backgroundColor: alpha(primaryMain, 0.1),
              color: primaryMain,
              '& .MuiListItemIcon-root': {
                color: primaryMain,
              },
              '&:hover': {
                backgroundColor: alpha(primaryMain, 0.14),
              },
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 600,
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            fontSize: '0.75rem',
          },
        },
      },
      MuiSkeleton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
          },
        },
      },
    },
  });
}

export const DRAWER_WIDTH = 260;
export const DRAWER_WIDTH_COLLAPSED = 72;
