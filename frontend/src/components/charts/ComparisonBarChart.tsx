import Box from '@mui/material/Box';
import { alpha, useTheme } from '@mui/material/styles';
import { BarChart } from '@mui/x-charts/BarChart';
import { formatCompactMoney, formatMoney } from '../../i18n/format';
import { CHART_COLORS, chartAxisSx, chartTooltipSlotProps } from './chartTheme';

export type ComparisonSeries = {
  id: string;
  label: string;
  data: number[];
  color?: string;
};

export type ComparisonBarChartProps = {
  categories: string[];
  series: ComparisonSeries[];
  language: string;
  height?: number;
  layout?: 'vertical' | 'horizontal';
  onCategoryClick?: (index: number) => void;
};

export function ComparisonBarChart({
  categories,
  series,
  language,
  height = 320,
  layout = 'vertical',
  onCategoryClick,
}: ComparisonBarChartProps) {
  const theme = useTheme();
  const moneyAxis = (value: number | null) =>
    formatCompactMoney(value ?? 0, language);
  const moneyTooltip = (value: number | null) =>
    formatMoney(value ?? 0, language);

  const defaultColors = [
    CHART_COLORS.revenue,
    CHART_COLORS.expenses,
    CHART_COLORS.profit,
    CHART_COLORS.materials,
  ];

  const isHorizontal = layout === 'horizontal';

  return (
    <Box sx={{ width: '100%', maxWidth: '100%', height, minWidth: 0, overflow: 'hidden' }}>
      <BarChart
        height={height}
        layout={isHorizontal ? 'horizontal' : 'vertical'}
        borderRadius={6}
        series={series.map((item, index) => ({
          id: item.id,
          data: item.data,
          label: item.label,
          color: item.color ?? defaultColors[index % defaultColors.length],
          valueFormatter: moneyTooltip,
          highlightScope: { fade: 'global', highlight: 'item' },
        }))}
        {...(isHorizontal
          ? {
              yAxis: [
                {
                  data: categories,
                  scaleType: 'band' as const,
                  width: 112,
                  tickLabelStyle: { fontSize: 11 },
                  disableLine: true,
                  disableTicks: true,
                  categoryGapRatio: 0.4,
                  barGapRatio: 0.2,
                },
              ],
              xAxis: [
                {
                  valueFormatter: moneyAxis,
                  tickLabelStyle: { fontSize: 11 },
                  disableLine: true,
                  disableTicks: true,
                },
              ],
            }
          : {
              xAxis: [
                {
                  data: categories,
                  scaleType: 'band' as const,
                  tickLabelStyle: { fontSize: 11 },
                  disableLine: true,
                  disableTicks: true,
                  categoryGapRatio: 0.45,
                  barGapRatio: 0.25,
                },
              ],
              yAxis: [
                {
                  valueFormatter: moneyAxis,
                  width: 56,
                  tickLabelStyle: { fontSize: 11 },
                  disableLine: true,
                  disableTicks: true,
                },
              ],
            })}
        grid={{ horizontal: !isHorizontal, vertical: isHorizontal }}
        margin={{ left: 8, right: 12, top: 32, bottom: 8 }}
        slotProps={{
          legend: {
            direction: 'horizontal',
            position: { vertical: 'top', horizontal: 'end' },
          },
          tooltip: chartTooltipSlotProps(theme, 'axis'),
        }}
        onItemClick={
          onCategoryClick
            ? (_event, item) => {
                if (typeof item.dataIndex === 'number') {
                  onCategoryClick(item.dataIndex);
                }
              }
            : undefined
        }
        sx={{
          ...chartAxisSx(theme),
          cursor: onCategoryClick ? 'pointer' : 'default',
          '& .MuiBarElement-root': {
            rx: 6,
          },
          '& .MuiChartsLegend-root': {
            transform: 'translateY(-2px)',
          },
          '& .MuiChartsLegend-mark': {
            width: 8,
            height: 8,
            rx: 99,
          },
          '& .MuiChartsGrid-line': {
            stroke: alpha(theme.palette.text.primary, 0.055),
          },
        }}
      />
    </Box>
  );
}
