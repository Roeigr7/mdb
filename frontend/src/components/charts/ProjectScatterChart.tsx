import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import { ScatterChart } from '@mui/x-charts/ScatterChart';
import { formatCompactMoney, formatMoney } from '../../i18n/format';
import { CHART_COLORS, chartAxisSx } from './chartTheme';

export type ScatterProjectPoint = {
  id: number;
  label: string;
  expenses: number;
  revenue: number;
};

export type ProjectScatterChartProps = {
  data: ScatterProjectPoint[];
  language: string;
  expensesAxisLabel: string;
  revenueAxisLabel: string;
  height?: number;
  onPointClick?: (projectId: number) => void;
};

/** Expenses (X) vs revenue (Y) — efficiency / scale scatter. */
export function ProjectScatterChart({
  data,
  language,
  expensesAxisLabel,
  revenueAxisLabel,
  height = 300,
  onPointClick,
}: ProjectScatterChartProps) {
  const theme = useTheme();

  const points = data.map((item) => ({
    id: item.id,
    x: item.expenses,
    y: item.revenue,
    label: item.label,
  }));

  return (
    <Box sx={{ width: '100%', maxWidth: '100%', height, minWidth: 0, overflow: 'hidden' }}>
      <ScatterChart
        height={height}
        series={[
          {
            id: 'projects',
            data: points,
            label: revenueAxisLabel,
            color: CHART_COLORS.revenue,
            markerSize: 8,
            valueFormatter: (value) => {
              if (!value) return '';
              return `${formatMoney(value.y, language)}`;
            },
          },
        ]}
        xAxis={[
          {
            label: expensesAxisLabel,
            valueFormatter: (value: number | null) =>
              formatCompactMoney(value ?? 0, language),
            tickLabelStyle: { fontSize: 11 },
            disableLine: true,
            disableTicks: true,
          },
        ]}
        yAxis={[
          {
            label: revenueAxisLabel,
            width: 56,
            valueFormatter: (value: number | null) =>
              formatCompactMoney(value ?? 0, language),
            tickLabelStyle: { fontSize: 11 },
            disableLine: true,
            disableTicks: true,
          },
        ]}
        grid={{ horizontal: true, vertical: true }}
        margin={{ left: 8, right: 16, top: 16, bottom: 28 }}
        slotProps={{
          legend: { sx: { display: 'none' } },
          tooltip: { trigger: 'item' },
        }}
        onItemClick={
          onPointClick
            ? (
                _event: unknown,
                item: { dataIndex?: number },
              ) => {
                if (typeof item.dataIndex === 'number') {
                  const point = points[item.dataIndex];
                  if (point) onPointClick(Number(point.id));
                }
              }
            : undefined
        }
        sx={{
          ...chartAxisSx(theme),
          cursor: onPointClick ? 'pointer' : 'default',
          '& .MuiChartsAxis-label': {
            fill: theme.palette.text.secondary,
            fontSize: 11,
            fontWeight: 600,
          },
        }}
      />
    </Box>
  );
}
