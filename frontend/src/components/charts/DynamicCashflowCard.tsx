import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import ButtonBase from '@mui/material/ButtonBase';
import { alpha, useTheme } from '@mui/material/styles';
import { LineChart } from '@mui/x-charts/LineChart';
import { useMemo, useState } from 'react';
import {
  formatCompactMoney,
  formatMoney,
  formatMonthKey,
} from '../../i18n/format';
import { tokens } from '../../app/theme';
import type { CashflowPoint } from './CashflowAreaChart';
import {
  CHART_COLORS,
  chartAxisSx,
  chartTooltipSlotProps,
  sliceLastMonths,
  type CashflowRange,
} from './chartTheme';

export type DynamicViewMode = 'overview' | 'revenue' | 'expenses' | 'net';

export type DynamicCashflowCardProps = {
  data: CashflowPoint[];
  language: string;
  title: string;
  subtitle: string;
  revenueLabel: string;
  expensesLabel: string;
  profitLabel: string;
  viewLabel: string;
  periodLabel: string;
  showProfitLabel: string;
  overviewLabel: string;
  revenueOnlyLabel: string;
  expensesOnlyLabel: string;
  netOnlyLabel: string;
  emptyLabel: string;
  rangeLabels: { value: CashflowRange; label: string }[];
  height?: number;
};

export function DynamicCashflowCard({
  data,
  language,
  title,
  subtitle,
  revenueLabel,
  expensesLabel,
  profitLabel,
  viewLabel,
  periodLabel,
  showProfitLabel,
  overviewLabel,
  revenueOnlyLabel,
  expensesOnlyLabel,
  netOnlyLabel,
  emptyLabel,
  rangeLabels,
  height = 320,
}: DynamicCashflowCardProps) {
  const theme = useTheme();
  const [range, setRange] = useState<CashflowRange>(12);
  const [viewMode, setViewMode] = useState<DynamicViewMode>('overview');
  const [showProfit, setShowProfit] = useState(true);
  const [hidden, setHidden] = useState<Record<string, boolean>>({});

  const sliced = useMemo(() => sliceLastMonths(data, range), [data, range]);

  const labels = sliced.map((point) => formatMonthKey(point.month, language));
  const revenue = sliced.map((point) => point.revenue);
  const expenses = sliced.map((point) => point.expenses);
  const profit = sliced.map((point) => point.revenue - point.expenses);

  const hasData =
    revenue.some((value) => value > 0) || expenses.some((value) => value > 0);

  const moneyAxis = (value: number | null) =>
    formatCompactMoney(value ?? 0, language);
  const moneyTooltip = (value: number | null) =>
    formatMoney(value ?? 0, language);

  const showRevenue =
    (viewMode === 'overview' || viewMode === 'revenue') && !hidden.revenue;
  const showExpenses =
    (viewMode === 'overview' || viewMode === 'expenses') && !hidden.expenses;
  const showNet =
    (viewMode === 'net' ||
      (viewMode === 'overview' && showProfit && !hidden.profit)) &&
    !hidden.profit;

  const kpiTotal = useMemo(() => {
    if (viewMode === 'expenses') {
      return expenses.reduce((sum, value) => sum + value, 0);
    }
    if (viewMode === 'net') {
      return profit.reduce((sum, value) => sum + value, 0);
    }
    return revenue.reduce((sum, value) => sum + value, 0);
  }, [viewMode, revenue, expenses, profit]);

  const kpiColor =
    viewMode === 'expenses'
      ? CHART_COLORS.expenses
      : viewMode === 'net'
        ? CHART_COLORS.profit
        : CHART_COLORS.revenue;

  const legendItems = [
    {
      id: 'revenue',
      label: revenueLabel,
      color: CHART_COLORS.revenue,
      visible: viewMode === 'overview' || viewMode === 'revenue',
    },
    {
      id: 'expenses',
      label: expensesLabel,
      color: CHART_COLORS.expenses,
      visible: viewMode === 'overview' || viewMode === 'expenses',
    },
    {
      id: 'profit',
      label: profitLabel,
      color: CHART_COLORS.profit,
      visible:
        viewMode === 'net' || (viewMode === 'overview' && showProfit),
    },
  ].filter((item) => item.visible);

  const toggleSeries = (id: string) => {
    if (viewMode !== 'overview') return;
    setHidden((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'box-shadow 160ms ease, border-color 160ms ease',
        '&:hover': {
          borderColor: alpha(tokens.ink[900], 0.1),
          boxShadow: `0 4px 20px ${alpha(tokens.ink[900], 0.06)}`,
        },
      }}
    >
      <CardContent
        sx={{
          p: 2.5,
          pb: 2,
          '&:last-child': { pb: 2.5 },
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={1.5}
          sx={{
            justifyContent: 'space-between',
            alignItems: { xs: 'stretch', md: 'flex-start' },
            mb: 2,
            gap: 1.5,
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="h6"
              component="h2"
              sx={{ letterSpacing: '-0.015em', fontWeight: 700 }}
            >
              {title}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.35, lineHeight: 1.45 }}
            >
              {subtitle}
            </Typography>
            {hasData && (
              <Typography
                variant="h4"
                className="tabular-nums"
                sx={{
                  mt: 1.35,
                  fontWeight: 800,
                  letterSpacing: '-0.035em',
                  lineHeight: 1,
                  fontSize: '1.5rem',
                  color: kpiColor,
                }}
              >
                {formatMoney(kpiTotal, language)}
              </Typography>
            )}
          </Box>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            sx={{ alignItems: { xs: 'stretch', sm: 'center' }, flexWrap: 'wrap' }}
          >
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel id="dynamic-view-label">{viewLabel}</InputLabel>
              <Select
                labelId="dynamic-view-label"
                label={viewLabel}
                value={viewMode}
                onChange={(event) => {
                  setViewMode(event.target.value as DynamicViewMode);
                  setHidden({});
                }}
              >
                <MenuItem value="overview">{overviewLabel}</MenuItem>
                <MenuItem value="revenue">{revenueOnlyLabel}</MenuItem>
                <MenuItem value="expenses">{expensesOnlyLabel}</MenuItem>
                <MenuItem value="net">{netOnlyLabel}</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 110 }}>
              <InputLabel id="dynamic-period-label">{periodLabel}</InputLabel>
              <Select
                labelId="dynamic-period-label"
                label={periodLabel}
                value={range}
                onChange={(event) =>
                  setRange(Number(event.target.value) as CashflowRange)
                }
              >
                {rangeLabels.map((item) => (
                  <MenuItem key={item.value} value={item.value}>
                    {item.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {viewMode === 'overview' && (
              <FormControlLabel
                control={
                  <Switch
                    size="small"
                    checked={showProfit}
                    onChange={(_, checked) => setShowProfit(checked)}
                  />
                }
                label={
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    {showProfitLabel}
                  </Typography>
                }
                sx={{ m: 0, ml: { sm: 0.5 } }}
              />
            )}
          </Stack>
        </Stack>

        <Box sx={{ flex: 1, minHeight: height, overflow: 'visible' }}>
          {!hasData ? (
            <Box
              sx={{
                height,
                display: 'grid',
                placeItems: 'center',
                borderRadius: 2,
                bgcolor: alpha(tokens.ink[900], 0.02),
                border: '1px dashed',
                borderColor: alpha(tokens.ink[900], 0.1),
              }}
            >
              <Typography variant="body2" color="text.secondary">
                {emptyLabel}
              </Typography>
            </Box>
          ) : (
            <Box sx={{ width: '100%', height, overflow: 'visible' }}>
              <LineChart
                height={height}
                series={[
                  ...(showRevenue
                    ? [
                        {
                          id: 'revenue',
                          data: revenue,
                          label: revenueLabel,
                          color: CHART_COLORS.revenue,
                          area: true,
                          curve: 'monotoneX' as const,
                          showMark: false,
                          valueFormatter: moneyTooltip,
                        },
                      ]
                    : []),
                  ...(showExpenses
                    ? [
                        {
                          id: 'expenses',
                          data: expenses,
                          label: expensesLabel,
                          color: CHART_COLORS.expenses,
                          area: true,
                          curve: 'monotoneX' as const,
                          showMark: false,
                          valueFormatter: moneyTooltip,
                        },
                      ]
                    : []),
                  ...(showNet
                    ? [
                        {
                          id: 'profit',
                          data: profit,
                          label: profitLabel,
                          color: CHART_COLORS.profit,
                          area: viewMode === 'net',
                          curve: 'monotoneX' as const,
                          showMark: false,
                          valueFormatter: moneyTooltip,
                        },
                      ]
                    : []),
                ]}
                xAxis={[
                  {
                    data: labels,
                    scaleType: 'point',
                    tickLabelStyle: { fontSize: 11 },
                    disableLine: true,
                    disableTicks: true,
                    valueFormatter: (value, context) => {
                      if (context?.location === 'tooltip') {
                        const index = labels.indexOf(String(value));
                        return index >= 0 ? labels[index] : String(value);
                      }
                      return String(value);
                    },
                  },
                ]}
                yAxis={[
                  {
                    valueFormatter: moneyAxis,
                    tickLabelStyle: { fontSize: 11 },
                    width: 56,
                    disableLine: true,
                    disableTicks: true,
                  },
                ]}
                grid={{ horizontal: true, vertical: false }}
                margin={{ left: 4, right: 10, top: 16, bottom: 4 }}
                slotProps={{
                  legend: { sx: { display: 'none' } },
                  tooltip: chartTooltipSlotProps(theme, 'axis'),
                }}
                sx={{
                  ...chartAxisSx(theme),
                  '& .MuiAreaElement-series-revenue': {
                    fillOpacity: 0.16,
                  },
                  '& .MuiAreaElement-series-expenses': {
                    fillOpacity: 0.12,
                  },
                  '& .MuiAreaElement-series-profit': {
                    fillOpacity: 0.11,
                  },
                  '& .MuiLineElement-series-revenue': {
                    strokeWidth: 2.15,
                  },
                  '& .MuiLineElement-series-expenses': {
                    strokeWidth: 2,
                  },
                  '& .MuiLineElement-series-profit': {
                    strokeWidth: viewMode === 'net' ? 2.15 : 1.9,
                  },
                }}
              />
            </Box>
          )}
        </Box>

        {hasData && legendItems.length > 0 && (
          <Stack
            direction="row"
            spacing={2}
            sx={{
              mt: 1.75,
              pt: 1.5,
              borderTop: '1px solid',
              borderColor: 'divider',
              flexWrap: 'wrap',
              gap: 1,
            }}
          >
            {legendItems.map((item) => {
              const isOff = Boolean(hidden[item.id]);
              const clickable = viewMode === 'overview';
              return (
                <ButtonBase
                  key={item.id}
                  disabled={!clickable}
                  onClick={() => toggleSeries(item.id)}
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.75,
                    borderRadius: 1,
                    px: 0.5,
                    py: 0.25,
                    opacity: isOff ? 0.35 : 1,
                    cursor: clickable ? 'pointer' : 'default',
                  }}
                >
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: item.color,
                      flexShrink: 0,
                    }}
                  />
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 600,
                      color: 'text.secondary',
                      textDecoration: isOff ? 'line-through' : 'none',
                    }}
                  >
                    {item.label}
                  </Typography>
                </ButtonBase>
              );
            })}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}
