import { createTheme, alpha, type Direction } from '@mui/material/styles';

/**
 * MBD design tokens — industrial finance SaaS.
 * Deep ink + teal accent. Soft surfaces. Precise elevation.
 */
export const tokens = {
  ink: {
    950: '#060D16',
    900: '#0A1628',
    800: '#102033',
    700: '#1A3048',
    600: '#2A4460',
  },
  teal: {
    700: '#0A5C68',
    600: '#0C6B78',
    500: '#0E7C8A',
    100: '#E6F4F6',
    50: '#F0F9FA',
  },
  slate: {
    50: '#F5F7FA',
    100: '#EBEFF4',
    200: '#D8E0EA',
    300: '#B8C4D4',
    400: '#8B9CB0',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
  },
  semantic: {
    success: '#0D7A6F',
    successSoft: '#E6F5F3',
    warning: '#B86E1A',
    warningSoft: '#FEF3E6',
    error: '#C23B3B',
    errorSoft: '#FCECEC',
    info: '#2B6CB0',
    infoSoft: '#E8F1F8',
  },
  /**
   * Data-viz palette — premium SaaS, low visual fatigue.
   * Soft cobalt / dusty rose / teal. Distinguishable, not neon.
   */
  chart: {
    /** Inflows — soft cobalt */
    revenue: '#4F7CEC',
    /** Outflows — dusty rose (warm, not alert) */
    expenses: '#C97B84',
    /** Net — calm teal */
    profit: '#3A9E8F',
    /** Materials / single series — muted gold */
    materials: '#C9A66B',
    /** Multi-category — soft categorical set */
    palette: [
      '#4F7CEC',
      '#3A9E8F',
      '#C97B84',
      '#C9A66B',
      '#7B6DB0',
      '#5B9BB5',
      '#B8956E',
      '#8B97A8',
    ],
  },
  radius: {
    xs: 6,
    sm: 8,
    md: 10,
    lg: 12,
    xl: 16,
  },
} as const;

export const DRAWER_WIDTH = 260;
export const DRAWER_WIDTH_COLLAPSED = 72;
export const SIDEBAR_BG = tokens.ink[900];
export const SIDEBAR_BG_ELEVATED = tokens.ink[800];
export const HEADER_HEIGHT = 64;

const surfaceBorder = alpha(tokens.ink[900], 0.07);
const primaryMain = tokens.teal[600];

export function createAppTheme(direction: Direction) {
  return createTheme({
    direction,
    cssVariables: true,
    palette: {
      mode: 'light',
      primary: {
        main: primaryMain,
        light: tokens.teal[500],
        dark: tokens.teal[700],
        contrastText: '#ffffff',
      },
      secondary: {
        main: tokens.slate[500],
        light: tokens.slate[400],
        dark: tokens.slate[600],
        contrastText: '#ffffff',
      },
      background: {
        default: tokens.slate[50],
        paper: '#ffffff',
      },
      divider: surfaceBorder,
      text: {
        primary: tokens.ink[900],
        secondary: tokens.slate[500],
        disabled: tokens.slate[400],
      },
      success: {
        main: tokens.semantic.success,
        light: tokens.semantic.successSoft,
        dark: '#0A5F56',
        contrastText: '#ffffff',
      },
      warning: {
        main: tokens.semantic.warning,
        light: tokens.semantic.warningSoft,
        dark: '#8F5514',
        contrastText: '#ffffff',
      },
      error: {
        main: tokens.semantic.error,
        light: tokens.semantic.errorSoft,
        dark: '#9E2F2F',
        contrastText: '#ffffff',
      },
      info: {
        main: tokens.semantic.info,
        light: tokens.semantic.infoSoft,
        dark: '#1E4E85',
        contrastText: '#ffffff',
      },
      action: {
        hover: alpha(tokens.ink[900], 0.035),
        selected: alpha(primaryMain, 0.08),
        disabled: alpha(tokens.ink[900], 0.26),
        disabledBackground: alpha(tokens.ink[900], 0.06),
        focus: alpha(primaryMain, 0.14),
      },
    },
    typography: {
      fontFamily:
        '"Plus Jakarta Sans", "IBM Plex Sans Hebrew", "Segoe UI", "Arial Hebrew", Arial, sans-serif',
      fontWeightLight: 400,
      fontWeightRegular: 400,
      fontWeightMedium: 500,
      fontWeightBold: 700,
      h1: {
        fontWeight: 700,
        letterSpacing: '-0.035em',
        fontSize: '2rem',
        lineHeight: 1.2,
      },
      h2: {
        fontWeight: 700,
        letterSpacing: '-0.03em',
        fontSize: '1.625rem',
        lineHeight: 1.25,
      },
      h3: {
        fontWeight: 700,
        letterSpacing: '-0.025em',
        fontSize: '1.375rem',
        lineHeight: 1.3,
      },
      h4: {
        fontWeight: 700,
        letterSpacing: '-0.025em',
        fontSize: '1.25rem',
        lineHeight: 1.3,
      },
      h5: {
        fontWeight: 650,
        fontSize: '1.0625rem',
        letterSpacing: '-0.015em',
        lineHeight: 1.35,
      },
      h6: {
        fontWeight: 650,
        fontSize: '0.9375rem',
        letterSpacing: '-0.01em',
        lineHeight: 1.4,
      },
      subtitle1: {
        fontWeight: 600,
        fontSize: '0.9375rem',
        letterSpacing: '-0.01em',
      },
      subtitle2: {
        fontWeight: 600,
        fontSize: '0.8125rem',
        letterSpacing: '-0.005em',
      },
      body1: {
        fontSize: '0.9375rem',
        lineHeight: 1.55,
        letterSpacing: '-0.005em',
      },
      body2: {
        fontSize: '0.8125rem',
        lineHeight: 1.5,
        letterSpacing: '-0.005em',
      },
      caption: {
        fontSize: '0.75rem',
        lineHeight: 1.4,
        letterSpacing: '0.01em',
        fontWeight: 500,
      },
      overline: {
        fontWeight: 700,
        letterSpacing: '0.08em',
        fontSize: '0.6875rem',
        textTransform: 'uppercase',
        lineHeight: 1.5,
      },
      button: {
        textTransform: 'none',
        fontWeight: 600,
        letterSpacing: '-0.01em',
      },
    },
    shape: {
      borderRadius: tokens.radius.md,
    },
    shadows: [
      'none',
      '0 1px 2px rgba(10, 22, 40, 0.04)',
      '0 1px 3px rgba(10, 22, 40, 0.05), 0 1px 2px rgba(10, 22, 40, 0.03)',
      '0 4px 12px rgba(10, 22, 40, 0.05)',
      '0 8px 24px rgba(10, 22, 40, 0.07)',
      '0 12px 32px rgba(10, 22, 40, 0.09)',
      '0 16px 40px rgba(10, 22, 40, 0.1)',
      '0 16px 40px rgba(10, 22, 40, 0.1)',
      '0 16px 40px rgba(10, 22, 40, 0.1)',
      '0 16px 40px rgba(10, 22, 40, 0.1)',
      '0 16px 40px rgba(10, 22, 40, 0.1)',
      '0 16px 40px rgba(10, 22, 40, 0.1)',
      '0 16px 40px rgba(10, 22, 40, 0.1)',
      '0 16px 40px rgba(10, 22, 40, 0.1)',
      '0 16px 40px rgba(10, 22, 40, 0.1)',
      '0 16px 40px rgba(10, 22, 40, 0.1)',
      '0 16px 40px rgba(10, 22, 40, 0.1)',
      '0 16px 40px rgba(10, 22, 40, 0.1)',
      '0 16px 40px rgba(10, 22, 40, 0.1)',
      '0 16px 40px rgba(10, 22, 40, 0.1)',
      '0 16px 40px rgba(10, 22, 40, 0.1)',
      '0 16px 40px rgba(10, 22, 40, 0.1)',
      '0 16px 40px rgba(10, 22, 40, 0.1)',
      '0 16px 40px rgba(10, 22, 40, 0.1)',
      '0 24px 48px rgba(10, 22, 40, 0.14)',
    ],
    transitions: {
      duration: {
        shortest: 100,
        shorter: 140,
        short: 180,
        standard: 220,
        complex: 280,
        enteringScreen: 200,
        leavingScreen: 160,
      },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: tokens.slate[50],
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
          },
          '::selection': {
            backgroundColor: alpha(primaryMain, 0.18),
          },
          '*::-webkit-scrollbar': {
            width: 8,
            height: 8,
          },
          '*::-webkit-scrollbar-thumb': {
            backgroundColor: alpha(tokens.ink[900], 0.14),
            borderRadius: 8,
          },
          '*::-webkit-scrollbar-thumb:hover': {
            backgroundColor: alpha(tokens.ink[900], 0.22),
          },
        },
      },
      MuiAppBar: {
        defaultProps: {
          elevation: 0,
          color: 'inherit',
        },
        styleOverrides: {
          root: {
            boxShadow: 'none',
            borderBottom: `1px solid ${surfaceBorder}`,
            backgroundImage: 'none',
            backdropFilter: 'saturate(180%) blur(12px)',
            backgroundColor: alpha('#ffffff', 0.85),
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
            boxShadow: '0 1px 2px rgba(10, 22, 40, 0.03)',
            borderRadius: tokens.radius.lg,
            backgroundImage: 'none',
            transition:
              'box-shadow 160ms ease, border-color 160ms ease, transform 160ms ease',
          },
        },
      },
      MuiPaper: {
        defaultProps: {
          elevation: 0,
        },
        styleOverrides: {
          rounded: {
            borderRadius: tokens.radius.lg,
          },
          outlined: {
            borderColor: surfaceBorder,
          },
        },
      },
      MuiButton: {
        defaultProps: {
          disableElevation: true,
        },
        styleOverrides: {
          root: {
            borderRadius: tokens.radius.sm,
            fontWeight: 600,
            fontSize: '0.8125rem',
            paddingInline: 14,
            paddingBlock: 7,
            minHeight: 36,
            transition:
              'background-color 120ms ease, box-shadow 120ms ease, border-color 120ms ease, color 120ms ease, transform 100ms ease',
            '&:active': {
              transform: 'translateY(0.5px)',
            },
          },
          sizeSmall: {
            minHeight: 30,
            fontSize: '0.75rem',
            paddingInline: 10,
            paddingBlock: 4,
            borderRadius: tokens.radius.xs,
          },
          sizeLarge: {
            minHeight: 44,
            fontSize: '0.875rem',
            paddingInline: 20,
            borderRadius: tokens.radius.md,
          },
          contained: {
            boxShadow: '0 1px 2px rgba(10, 22, 40, 0.06)',
            '&:hover': {
              boxShadow: `0 4px 12px ${alpha(primaryMain, 0.28)}`,
            },
            '&.MuiButton-containedPrimary': {
              background: `linear-gradient(180deg, ${tokens.teal[500]} 0%, ${primaryMain} 100%)`,
              '&:hover': {
                background: `linear-gradient(180deg, ${tokens.teal[500]} 0%, ${tokens.teal[700]} 100%)`,
              },
            },
          },
          outlined: {
            borderColor: alpha(tokens.ink[900], 0.12),
            '&:hover': {
              borderColor: alpha(tokens.ink[900], 0.22),
              backgroundColor: alpha(tokens.ink[900], 0.03),
            },
          },
          text: {
            '&:hover': {
              backgroundColor: alpha(tokens.ink[900], 0.04),
            },
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            borderRadius: tokens.radius.sm,
            transition: 'background-color 120ms ease, color 120ms ease',
          },
          sizeSmall: {
            borderRadius: tokens.radius.xs,
          },
        },
      },
      MuiTextField: {
        defaultProps: {
          size: 'small',
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: tokens.radius.sm,
            backgroundColor: '#fff',
            transition: 'box-shadow 120ms ease, background-color 120ms ease',
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: alpha(tokens.ink[900], 0.2),
            },
            '&.Mui-focused': {
              boxShadow: `0 0 0 3px ${alpha(primaryMain, 0.14)}`,
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderWidth: 1,
            },
          },
          notchedOutline: {
            borderColor: alpha(tokens.ink[900], 0.1),
            transition: 'border-color 120ms ease',
          },
          input: {
            fontSize: '0.875rem',
          },
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: {
            fontSize: '0.875rem',
            fontWeight: 500,
          },
        },
      },
      MuiSelect: {
        defaultProps: {
          size: 'small',
        },
      },
      MuiTableHead: {
        styleOverrides: {
          root: {
            '& .MuiTableCell-head': {
              fontWeight: 600,
              fontSize: '0.75rem',
              letterSpacing: '0.02em',
              textTransform: 'uppercase',
              backgroundColor: alpha(tokens.slate[50], 0.85),
              color: tokens.slate[500],
              whiteSpace: 'nowrap',
              borderBottom: `1px solid ${surfaceBorder}`,
              paddingTop: 10,
              paddingBottom: 10,
            },
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            transition: 'background-color 100ms ease',
            '&:hover': {
              backgroundColor: alpha(primaryMain, 0.028),
            },
            '&:last-child .MuiTableCell-root': {
              borderBottom: 'none',
            },
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderColor: alpha(tokens.ink[900], 0.055),
            paddingTop: 12,
            paddingBottom: 12,
            fontSize: '0.8125rem',
            fontVariantNumeric: 'tabular-nums',
          },
          sizeSmall: {
            paddingTop: 8,
            paddingBottom: 8,
          },
        },
      },
      MuiTableContainer: {
        styleOverrides: {
          root: {
            borderRadius: tokens.radius.lg,
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: tokens.radius.sm,
            marginInline: 8,
            minHeight: 40,
            transition:
              'background-color 120ms ease, color 120ms ease, box-shadow 120ms ease',
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 600,
            borderRadius: tokens.radius.xs,
            fontSize: '0.75rem',
            height: 26,
          },
          sizeSmall: {
            height: 22,
            fontSize: '0.6875rem',
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: tokens.radius.xl,
            border: `1px solid ${surfaceBorder}`,
            boxShadow: '0 16px 48px rgba(10, 22, 40, 0.14)',
            backgroundImage: 'none',
          },
        },
      },
      MuiDialogTitle: {
        styleOverrides: {
          root: {
            fontWeight: 700,
            fontSize: '1.0625rem',
            letterSpacing: '-0.015em',
            paddingBottom: 8,
          },
        },
      },
      MuiDialogActions: {
        styleOverrides: {
          root: {
            padding: '12px 24px 20px',
            gap: 8,
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: tokens.radius.sm,
            border: `1px solid ${surfaceBorder}`,
            alignItems: 'center',
            '&.MuiAlert-standardError': {
              backgroundColor: tokens.semantic.errorSoft,
              borderColor: alpha(tokens.semantic.error, 0.16),
            },
            '&.MuiAlert-standardSuccess': {
              backgroundColor: tokens.semantic.successSoft,
              borderColor: alpha(tokens.semantic.success, 0.16),
            },
            '&.MuiAlert-standardWarning': {
              backgroundColor: tokens.semantic.warningSoft,
              borderColor: alpha(tokens.semantic.warning, 0.16),
            },
            '&.MuiAlert-standardInfo': {
              backgroundColor: tokens.semantic.infoSoft,
              borderColor: alpha(tokens.semantic.info, 0.16),
            },
          },
        },
      },
      MuiTooltip: {
        defaultProps: {
          arrow: true,
          enterDelay: 400,
        },
        styleOverrides: {
          tooltip: {
            fontSize: '0.75rem',
            fontWeight: 500,
            borderRadius: tokens.radius.xs,
            backgroundColor: tokens.ink[900],
            padding: '6px 10px',
            boxShadow: '0 4px 12px rgba(10, 22, 40, 0.18)',
          },
          arrow: {
            color: tokens.ink[900],
          },
        },
      },
      MuiSkeleton: {
        styleOverrides: {
          root: {
            borderRadius: tokens.radius.sm,
            backgroundColor: alpha(tokens.ink[900], 0.06),
          },
        },
      },
      MuiAvatar: {
        styleOverrides: {
          root: {
            fontWeight: 700,
            fontSize: '0.75rem',
            letterSpacing: '0.02em',
          },
        },
      },
      MuiMenu: {
        styleOverrides: {
          paper: {
            borderRadius: tokens.radius.md,
            border: `1px solid ${surfaceBorder}`,
            boxShadow: '0 8px 28px rgba(10, 22, 40, 0.12)',
            backgroundImage: 'none',
            marginTop: 6,
          },
          list: {
            padding: 6,
          },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            borderRadius: tokens.radius.xs,
            fontSize: '0.8125rem',
            minHeight: 36,
            marginInline: 2,
            transition: 'background-color 100ms ease',
          },
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: {
            borderColor: surfaceBorder,
          },
        },
      },
      MuiToggleButton: {
        styleOverrides: {
          root: {
            borderRadius: `${tokens.radius.xs}px !important`,
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.75rem',
            paddingInline: 10,
            paddingBlock: 4,
            border: `1px solid ${surfaceBorder}`,
            '&.Mui-selected': {
              backgroundColor: alpha(primaryMain, 0.1),
              color: tokens.teal[700],
              borderColor: alpha(primaryMain, 0.24),
              '&:hover': {
                backgroundColor: alpha(primaryMain, 0.14),
              },
            },
          },
        },
      },
      MuiToggleButtonGroup: {
        styleOverrides: {
          root: {
            backgroundColor: alpha(tokens.ink[900], 0.03),
            borderRadius: tokens.radius.sm,
            padding: 2,
            gap: 2,
            '& .MuiToggleButtonGroup-grouped': {
              border: 0,
              margin: 0,
            },
          },
        },
      },
      MuiBreadcrumbs: {
        styleOverrides: {
          separator: {
            color: tokens.slate[400],
            marginInline: 6,
          },
        },
      },
      MuiLink: {
        styleOverrides: {
          root: {
            transition: 'color 120ms ease',
          },
        },
      },
      MuiLinearProgress: {
        styleOverrides: {
          root: {
            borderRadius: 99,
            height: 4,
            backgroundColor: alpha(primaryMain, 0.1),
          },
          bar: {
            borderRadius: 99,
          },
        },
      },
      MuiBadge: {
        styleOverrides: {
          badge: {
            fontWeight: 700,
            fontSize: '0.625rem',
          },
        },
      },
      MuiTabs: {
        styleOverrides: {
          indicator: {
            height: 2,
            borderRadius: 2,
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.8125rem',
            minHeight: 42,
          },
        },
      },
      MuiCheckbox: {
        styleOverrides: {
          root: {
            borderRadius: 4,
          },
        },
      },
      MuiSwitch: {
        styleOverrides: {
          root: {
            padding: 8,
          },
          switchBase: {
            '&.Mui-checked': {
              color: '#fff',
              '& + .MuiSwitch-track': {
                opacity: 1,
                backgroundColor: primaryMain,
              },
            },
          },
          track: {
            borderRadius: 12,
            backgroundColor: tokens.slate[300],
            opacity: 1,
          },
          thumb: {
            boxShadow: '0 1px 2px rgba(10, 22, 40, 0.16)',
          },
        },
      },
      MuiFormHelperText: {
        styleOverrides: {
          root: {
            fontSize: '0.75rem',
            marginInlineStart: 2,
          },
        },
      },
      MuiSnackbarContent: {
        styleOverrides: {
          root: {
            borderRadius: tokens.radius.md,
            boxShadow: '0 8px 28px rgba(10, 22, 40, 0.14)',
          },
        },
      },
    },
  });
}
