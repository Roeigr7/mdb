import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import { LineChart } from '@mui/x-charts/LineChart';
import {
  formatCompactMoney,
  formatMoney,
  formatMonthKey,
} from '../../i18n/format';
import { CHART_COLORS, chartAxisSx, chartTooltipSlotProps } from './chartTheme';

export type CashflowPoint = {
  month: string;
  revenue: number;
  expenses: number;
};

export type CashflowAreaChartProps = {
  data: CashflowPoint[];
  language: string;
  height?: number;
  revenueLabel: string;
  expensesLabel: string;
  profitLabel: string;
  showProfit?: boolean;
};

export function CashflowAreaChart({
  data,
  language,
  height = 320,
  revenueLabel,
  expensesLabel,
  profitLabel,
  showProfit = true,
}: CashflowAreaChartProps) {
  const theme = useTheme();
  const labels = data.map((point) => formatMonthKey(point.month, language));
  const revenue = data.map((point) => point.revenue);
  const expenses = data.map((point) => point.expenses);
  const profit = data.map((point) => point.revenue - point.expenses);

  const moneyAxis = (value: number | null) =>
    formatCompactMoney(value ?? 0, language);
  const moneyTooltip = (value: number | null) =>
    formatMoney(value ?? 0, language);

  return (
    <Box sx={{ width: '100%', height, overflow: 'visible' }}>
      <LineChart
        height={height}
        series={[
          {
            id: 'revenue',
            data: revenue,
            label: revenueLabel,
            color: CHART_COLORS.revenue,
            area: true,
            curve: 'monotoneX',
            showMark: false,
            valueFormatter: moneyTooltip,
          },
          {
            id: 'expenses',
            data: expenses,
            label: expensesLabel,
            color: CHART_COLORS.expenses,
            area: true,
            curve: 'monotoneX',
            showMark: false,
            valueFormatter: moneyTooltip,
          },
          ...(showProfit
            ? [
                {
                  id: 'profit',
                  data: profit,
                  label: profitLabel,
                  color: CHART_COLORS.profit,
                  area: false,
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
                // Prefer short month in tooltip — keeps one clean header line
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
        margin={{ left: 4, right: 10, top: 20, bottom: 4 }}
        slotProps={{
          legend: { sx: { display: 'none' } },
          tooltip: chartTooltipSlotProps(theme, 'axis'),
        }}
        sx={{
          ...chartAxisSx(theme),
          '& .MuiAreaElement-series-revenue': {
            fillOpacity: 0.18,
          },
          '& .MuiAreaElement-series-expenses': {
            fillOpacity: 0.14,
          },
          '& .MuiLineElement-series-revenue': {
            strokeWidth: 2.25,
          },
          '& .MuiLineElement-series-expenses': {
            strokeWidth: 2.1,
          },
          '& .MuiLineElement-series-profit': {
            strokeWidth: 2,
            opacity: 0.95,
          },
        }}
      />
    </Box>
  );
}

export function CashflowLegendFooter({
  revenueLabel,
  expensesLabel,
  profitLabel,
  revenueTotal,
  expensesTotal,
  profitTotal,
  language,
}: {
  revenueLabel: string;
  expensesLabel: string;
  profitLabel: string;
  revenueTotal: number;
  expensesTotal: number;
  profitTotal: number;
  language: string;
}) {
  const items = [
    { label: revenueLabel, value: revenueTotal, color: CHART_COLORS.revenue },
    { label: expensesLabel, value: expensesTotal, color: CHART_COLORS.expenses },
    { label: profitLabel, value: profitTotal, color: CHART_COLORS.profit },
  ];

  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={{ xs: 1, sm: 0 }}
      sx={{
        justifyContent: 'space-between',
        gap: { sm: 1.5 },
      }}
    >
      {items.map((item) => (
        <Stack
          key={item.label}
          direction="row"
          spacing={1}
          sx={{
            alignItems: 'center',
            flex: 1,
            px: 1.25,
            py: 0.75,
            borderRadius: 1.5,
            border: '1px solid',
            borderColor: alpha(item.color, 0.12),
            bgcolor: alpha(item.color, 0.04),
          }}
        >
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: 0.5,
              bgcolor: item.color,
              flexShrink: 0,
            }}
          />
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ flex: 1, fontWeight: 500 }}
          >
            {item.label}
          </Typography>
          <Typography
            variant="caption"
            className="tabular-nums"
            sx={{ fontWeight: 700, letterSpacing: '-0.01em' }}
          >
            {formatMoney(item.value, language)}
          </Typography>
        </Stack>
      ))}
    </Stack>
  );
}
