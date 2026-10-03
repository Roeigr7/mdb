import { alpha } from '@mui/material/styles';
import { chartsTooltipClasses } from '@mui/x-charts/ChartsTooltip';
import type { SxProps, Theme } from '@mui/material/styles';
import { tokens } from '../../app/theme';

/**
 * Chart colors — luminous periwinkle / peach / aqua.
 * Soft fills read as layered and polished on white surfaces.
 */
export const CHART_COLORS = {
  revenue: tokens.chart.revenue,
  expenses: tokens.chart.expenses,
  profit: tokens.chart.profit,
  materials: tokens.chart.materials,
  secondary: '#A8B5C4',
  palette: [...tokens.chart.palette],
} as const;

/**
 * Monthly windows only — `/analytics` returns month buckets.
 */
export type CashflowRange = 3 | 6 | 12;

export const CASHFLOW_RANGES: CashflowRange[] = [3, 6, 12];

export function sliceLastMonths<T>(items: T[], months: CashflowRange): T[] {
  if (items.length <= months) return items;
  return items.slice(-months);
}

/** Tooltip paper styles — applied via slotProps so portaled content is styled. */
export function chartTooltipPaperSx(theme: Theme): SxProps<Theme> {
  const ink = theme.palette.text.primary;

  return {
    borderRadius: '10px !important',
    border: `1px solid ${alpha(ink, 0.08)}`,
    boxShadow:
      '0 2px 6px rgba(15, 23, 42, 0.05), 0 12px 28px rgba(15, 23, 42, 0.1)',
    backgroundImage: 'none',
    bgcolor: theme.palette.background.paper,
    // Grow with content — never force wrap / split LTR-RTL money strings
    width: 'max-content',
    maxWidth: 'none',
    minWidth: 0,
    overflow: 'hidden',
    padding: '4px 0',
    // Keep tooltip chrome in page direction; isolate values separately
    direction: theme.direction,

    [`& .${chartsTooltipClasses.table}`]: {
      borderSpacing: 0,
      borderCollapse: 'collapse',
      width: 'max-content',
      tableLayout: 'auto',
      margin: 0,
    },

    [`& .${chartsTooltipClasses.markContainer}`]: {
      display: 'table-cell !important',
      width: '18px !important',
      minWidth: '18px !important',
      maxWidth: '18px !important',
      paddingTop: '0 !important',
      paddingBottom: '0 !important',
      paddingInlineStart: '10px !important',
      paddingInlineEnd: '0 !important',
      verticalAlign: 'middle',
      lineHeight: 0,
    },

    [`& .${chartsTooltipClasses.mark}`]: {
      display: 'inline-block',
      width: 8,
      height: 8,
      borderRadius: '50%',
      flexShrink: 0,
      boxSizing: 'border-box',
    },

    [`& .${chartsTooltipClasses.cell}`]: {
      fontFamily: `${theme.typography.fontFamily} !important`,
      fontSize: '12px !important',
      lineHeight: '1.3 !important',
      verticalAlign: 'middle',
      whiteSpace: 'nowrap !important',
      overflow: 'visible',
      paddingTop: '5px !important',
      paddingBottom: '5px !important',
      paddingLeft: '8px !important',
      paddingRight: '8px !important',
    },

    [`& .${chartsTooltipClasses.labelCell}`]: {
      color: `${theme.palette.text.secondary} !important`,
      fontWeight: '500 !important',
      textAlign: 'start !important',
      whiteSpace: 'nowrap !important',
      paddingInlineEnd: '20px !important',
    },

    [`& .${chartsTooltipClasses.valueCell}`]: {
      color: `${theme.palette.text.primary} !important`,
      fontWeight: '700 !important',
      fontVariantNumeric: 'tabular-nums',
      letterSpacing: '-0.01em',
      // Currency/numbers stay LTR so ₪ amounts never split across lines/sides
      direction: 'ltr',
      unicodeBidi: 'isolate',
      textAlign: 'right !important',
      whiteSpace: 'nowrap !important',
      paddingInlineStart: '4px !important',
      paddingInlineEnd: '12px !important',
    },

    [`& .${chartsTooltipClasses.axisValueCell}`]: {
      color: `${theme.palette.text.primary} !important`,
      fontWeight: '700 !important',
      fontSize: '12.5px !important',
      letterSpacing: '-0.01em',
      textAlign: 'start !important',
      whiteSpace: 'nowrap !important',
      padding: '8px 12px !important',
      borderBottom: `1px solid ${theme.palette.divider}`,
    },

    [`& caption`]: {
      captionSide: 'top',
      fontFamily: theme.typography.fontFamily,
      fontWeight: 700,
      fontSize: 12.5,
      letterSpacing: '-0.01em',
      color: theme.palette.text.primary,
      textAlign: 'start',
      whiteSpace: 'nowrap',
      padding: '8px 12px',
      borderBottom: `1px solid ${theme.palette.divider}`,
      '& span': {
        marginInlineEnd: 8,
        marginRight: 'unset',
      },
    },

    // Override MUI first/last physical padding so RTL stays even
    [`& td:first-of-type, & th:first-of-type`]: {
      paddingInlineStart: '10px !important',
    },
    [`& td:last-of-type, & th:last-of-type`]: {
      paddingInlineEnd: '12px !important',
    },
  };
}

export function chartTooltipSlotProps(
  theme: Theme,
  trigger: 'axis',
): {
  trigger: 'axis';
  container: HTMLElement | undefined;
  sx: SxProps<Theme>;
};
export function chartTooltipSlotProps(
  theme: Theme,
  trigger: 'item',
): {
  trigger: 'item';
  container: HTMLElement | undefined;
  sx: SxProps<Theme>;
};
export function chartTooltipSlotProps(
  theme: Theme,
  trigger: 'axis' | 'item' = 'axis',
) {
  return {
    trigger,
    container: typeof document !== 'undefined' ? document.body : undefined,
    sx: chartTooltipPaperSx(theme),
  };
}

export function chartAxisSx(theme: Theme): SxProps<Theme> {
  const ink = theme.palette.text.primary;

  return {
    '& .MuiChartsAxis-line': {
      stroke: 'transparent',
    },
    '& .MuiChartsAxis-tick': {
      stroke: 'transparent',
    },
    '& .MuiChartsAxis-tickLabel': {
      fill: alpha(ink, 0.45),
      fontSize: 11,
      fontFamily: theme.typography.fontFamily,
      fontWeight: 500,
      letterSpacing: '-0.01em',
    },
    '& .MuiChartsGrid-line': {
      stroke: alpha(ink, 0.045),
      strokeDasharray: '0',
    },
    '& .MuiLineElement-root': {
      strokeWidth: 2,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
    },
    '& .MuiAreaElement-root': {
      fillOpacity: 0.12,
    },
    '& .MuiBarElement-root': {
      opacity: 0.92,
      transition: 'opacity 120ms ease',
      '&:hover': {
        opacity: 1,
      },
    },
    '& .MuiPieArc-root': {
      stroke: theme.palette.background.paper,
      strokeWidth: 2.5,
      transition: 'opacity 120ms ease',
    },
    '& .MuiChartsLegend-series text': {
      fill: alpha(ink, 0.58),
      fontSize: 11.5,
      fontFamily: theme.typography.fontFamily,
      fontWeight: 500,
    },
    '& .MuiChartsLegend-mark': {
      rx: 99,
    },
  };
}
