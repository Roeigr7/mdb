import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import { BarChart } from '@mui/x-charts/BarChart';
import { formatCompactMoney, formatMoney } from '../../i18n/format';
import { CHART_COLORS, chartAxisSx, chartTooltipSlotProps } from './chartTheme';

export type StackedCashflowChartProps = {
  categories: string[];
  revenue: number[];
  expenses: number[];
  revenueLabel: string;
  expensesLabel: string;
  language: string;
  height?: number;
};

/** Stacked monthly volume — revenue + expenses as total money movement. */
export function StackedCashflowChart({
  categories,
  revenue,
  expenses,
  revenueLabel,
  expensesLabel,
  language,
  height = 300,
}: StackedCashflowChartProps) {
  const theme = useTheme();
  const moneyAxis = (value: number | null) =>
    formatCompactMoney(value ?? 0, language);
  const moneyTooltip = (value: number | null) =>
    formatMoney(value ?? 0, language);

  return (
    <Box sx={{ width: '100%', maxWidth: '100%', height, minWidth: 0, overflow: 'hidden' }}>
      <BarChart
        height={height}
        borderRadius={4}
        series={[
          {
            id: 'revenue',
            data: revenue,
            label: revenueLabel,
            color: CHART_COLORS.revenue,
            stack: 'volume',
            valueFormatter: moneyTooltip,
          },
          {
            id: 'expenses',
            data: expenses,
            label: expensesLabel,
            color: CHART_COLORS.expenses,
            stack: 'volume',
            valueFormatter: moneyTooltip,
          },
        ]}
        xAxis={[
          {
            data: categories,
            scaleType: 'band',
            tickLabelStyle: { fontSize: 11 },
            disableLine: true,
            disableTicks: true,
            categoryGapRatio: 0.4,
          },
        ]}
        yAxis={[
          {
            valueFormatter: moneyAxis,
            width: 56,
            tickLabelStyle: { fontSize: 11 },
            disableLine: true,
            disableTicks: true,
          },
        ]}
        grid={{ horizontal: true, vertical: false }}
        margin={{ left: 8, right: 12, top: 32, bottom: 8 }}
        slotProps={{
          legend: {
            direction: 'horizontal',
            position: { vertical: 'top', horizontal: 'end' },
          },
          tooltip: chartTooltipSlotProps(theme, 'axis'),
        }}
        sx={{
          ...chartAxisSx(theme),
          '& .MuiChartsLegend-mark': {
            width: 8,
            height: 8,
            rx: 99,
          },
        }}
      />
    </Box>
  );
}
