import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import { RadarChart } from '@mui/x-charts/RadarChart';
import { CHART_COLORS, chartTooltipSlotProps } from './chartTheme';

export type RadarProject = {
  id: number;
  label: string;
  revenue: number;
  expenses: number;
  materialsCost: number;
};

export type ProjectRadarChartProps = {
  data: RadarProject[];
  revenueLabel: string;
  expensesLabel: string;
  materialsLabel: string;
  height?: number;
  maxProjects?: number;
};

/** Normalized radar for top projects across revenue / expenses / materials. */
export function ProjectRadarChart({
  data,
  revenueLabel,
  expensesLabel,
  materialsLabel,
  height = 300,
  maxProjects = 4,
}: ProjectRadarChartProps) {
  const theme = useTheme();
  const top = [...data]
    .sort(
      (a, b) =>
        b.revenue + b.expenses + b.materialsCost -
        (a.revenue + a.expenses + a.materialsCost),
    )
    .slice(0, maxProjects);

  const maxRevenue = Math.max(...top.map((item) => item.revenue), 1);
  const maxExpenses = Math.max(...top.map((item) => item.expenses), 1);
  const maxMaterials = Math.max(...top.map((item) => item.materialsCost), 1);

  const projectColors = [
    CHART_COLORS.profit,
    ...CHART_COLORS.palette.filter(
      (color) => color !== CHART_COLORS.revenue && color !== CHART_COLORS.profit,
    ),
  ];

  const series = top.map((item, index) => ({
    id: String(item.id),
    label: item.label,
    data: [
      (item.revenue / maxRevenue) * 100,
      (item.expenses / maxExpenses) * 100,
      (item.materialsCost / maxMaterials) * 100,
    ],
    color: projectColors[index % projectColors.length],
    fillArea: true,
    hideMark: false,
  }));

  if (series.length === 0) {
    return <Box sx={{ height }} />;
  }

  return (
    <Box sx={{ width: '100%', height, overflow: 'visible' }}>
      <RadarChart
        height={height}
        series={series}
        radar={{
          metrics: [revenueLabel, expensesLabel, materialsLabel],
          max: 100,
        }}
        shape="circular"
        hideLegend={false}
        slotProps={{
          tooltip: chartTooltipSlotProps(theme, 'item'),
          legend: {
            direction: 'horizontal',
            position: { vertical: 'bottom', horizontal: 'center' },
          },
        }}
        margin={{ top: 24, bottom: 48, left: 40, right: 40 }}
        sx={{
          '& .MuiChartsLegend-series text': {
            fill: theme.palette.text.secondary,
            fontSize: 11,
            fontWeight: 500,
          },
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
