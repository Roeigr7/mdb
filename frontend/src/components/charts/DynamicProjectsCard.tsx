import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import { useMemo, useState } from 'react';
import { tokens } from '../../app/theme';
import { ComparisonBarChart } from './ComparisonBarChart';
import { ProjectRadarChart } from './ProjectRadarChart';
import { ProjectScatterChart } from './ProjectScatterChart';
import { CHART_COLORS } from './chartTheme';

export type DynamicProjectRow = {
  projectId: number;
  projectName: string;
  expenses: number;
  revenue: number;
  materialsCost: number;
};

export type DynamicProjectsCardProps = {
  title: string;
  subtitle: string;
  data: DynamicProjectRow[];
  language: string;
  metricLabel: string;
  chartTypeLabel: string;
  revenueLabel: string;
  expensesLabel: string;
  profitLabel: string;
  materialsLabel: string;
  barsLabel: string;
  radarLabel: string;
  scatterLabel: string;
  emptyLabel: string;
  onProjectClick?: (projectId: number) => void;
  height?: number;
};

type Metric = 'revenue' | 'expenses' | 'profit' | 'materials';
type ChartKind = 'bars' | 'radar' | 'scatter';

export function DynamicProjectsCard({
  title,
  subtitle,
  data,
  language,
  metricLabel,
  chartTypeLabel,
  revenueLabel,
  expensesLabel,
  profitLabel,
  materialsLabel,
  barsLabel,
  radarLabel,
  scatterLabel,
  emptyLabel,
  onProjectClick,
  height = 320,
}: DynamicProjectsCardProps) {
  const [metric, setMetric] = useState<Metric>('revenue');
  const [chartKind, setChartKind] = useState<ChartKind>('bars');

  const withProfit = useMemo(
    () =>
      data.map((item) => ({
        ...item,
        profit: item.revenue - item.expenses,
      })),
    [data],
  );

  const ranked = useMemo(() => {
    const key =
      metric === 'materials'
        ? 'materialsCost'
        : metric === 'profit'
          ? 'profit'
          : metric;
    return [...withProfit].sort((a, b) => b[key] - a[key]);
  }, [withProfit, metric]);

  const metricColor =
    metric === 'expenses'
      ? CHART_COLORS.expenses
      : metric === 'profit'
        ? CHART_COLORS.profit
        : metric === 'materials'
          ? CHART_COLORS.materials
          : CHART_COLORS.profit;

  const metricSeriesLabel =
    metric === 'expenses'
      ? expensesLabel
      : metric === 'profit'
        ? profitLabel
        : metric === 'materials'
          ? materialsLabel
          : revenueLabel;

  const empty = data.length === 0;
  const chartHeight = Math.max(
    height,
    chartKind === 'bars' ? ranked.length * 40 : height,
  );

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        '&:hover': {
          borderColor: alpha(tokens.ink[900], 0.1),
          boxShadow: `0 4px 20px ${alpha(tokens.ink[900], 0.06)}`,
        },
      }}
    >
      <CardContent
        sx={{
          p: 2.5,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          '&:last-child': { pb: 2.5 },
        }}
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.5}
          sx={{
            justifyContent: 'space-between',
            alignItems: { xs: 'stretch', sm: 'flex-start' },
            mb: 2,
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.35 }}>
              {subtitle}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
            <FormControl size="small" sx={{ minWidth: 130 }}>
              <InputLabel id="projects-chart-label">{chartTypeLabel}</InputLabel>
              <Select
                labelId="projects-chart-label"
                label={chartTypeLabel}
                value={chartKind}
                onChange={(event) =>
                  setChartKind(event.target.value as ChartKind)
                }
              >
                <MenuItem value="bars">{barsLabel}</MenuItem>
                <MenuItem value="radar">{radarLabel}</MenuItem>
                <MenuItem value="scatter">{scatterLabel}</MenuItem>
              </Select>
            </FormControl>
            {chartKind === 'bars' && (
              <FormControl size="small" sx={{ minWidth: 130 }}>
                <InputLabel id="projects-metric-label">{metricLabel}</InputLabel>
                <Select
                  labelId="projects-metric-label"
                  label={metricLabel}
                  value={metric}
                  onChange={(event) =>
                    setMetric(event.target.value as Metric)
                  }
                >
                  <MenuItem value="revenue">{revenueLabel}</MenuItem>
                  <MenuItem value="expenses">{expensesLabel}</MenuItem>
                  <MenuItem value="profit">{profitLabel}</MenuItem>
                  <MenuItem value="materials">{materialsLabel}</MenuItem>
                </Select>
              </FormControl>
            )}
          </Stack>
        </Stack>

        <Box sx={{ flex: 1, minHeight: chartHeight }}>
          {empty ? (
            <Box
              sx={{
                height,
                display: 'grid',
                placeItems: 'center',
                borderRadius: 2,
                border: '1px dashed',
                borderColor: 'divider',
              }}
            >
              <Typography variant="body2" color="text.secondary">
                {emptyLabel}
              </Typography>
            </Box>
          ) : chartKind === 'radar' ? (
            <ProjectRadarChart
              data={ranked.map((item) => ({
                id: item.projectId,
                label: item.projectName,
                revenue: item.revenue,
                expenses: item.expenses,
                materialsCost: item.materialsCost,
              }))}
              revenueLabel={revenueLabel}
              expensesLabel={expensesLabel}
              materialsLabel={materialsLabel}
              height={height}
            />
          ) : chartKind === 'scatter' ? (
            <ProjectScatterChart
              data={ranked.map((item) => ({
                id: item.projectId,
                label: item.projectName,
                expenses: item.expenses,
                revenue: item.revenue,
              }))}
              language={language}
              expensesAxisLabel={expensesLabel}
              revenueAxisLabel={revenueLabel}
              height={height}
              onPointClick={onProjectClick}
            />
          ) : (
            <ComparisonBarChart
              categories={ranked.map((item) => item.projectName)}
              series={[
                {
                  id: metric,
                  label: metricSeriesLabel,
                  data: ranked.map((item) =>
                    metric === 'materials'
                      ? item.materialsCost
                      : metric === 'profit'
                        ? item.profit
                        : item[metric],
                  ),
                  color: metricColor,
                },
              ]}
              language={language}
              height={chartHeight}
              layout={ranked.length > 4 ? 'horizontal' : 'vertical'}
              onCategoryClick={
                onProjectClick
                  ? (index) => {
                      const row = ranked[index];
                      if (row) onProjectClick(row.projectId);
                    }
                  : undefined
              }
            />
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
