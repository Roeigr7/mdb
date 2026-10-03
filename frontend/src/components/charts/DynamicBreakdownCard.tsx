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
import { CategoryDonutChart } from './CategoryDonutChart';
import { ComparisonBarChart } from './ComparisonBarChart';
import { CHART_COLORS } from './chartTheme';

export type BreakdownItem = {
  id: string;
  label: string;
  value: number;
};

export type DynamicBreakdownCardProps = {
  title: string;
  subtitle: string;
  data: BreakdownItem[];
  language: string;
  chartTypeLabel: string;
  sortLabel: string;
  donutLabel: string;
  barsLabel: string;
  sortHighLabel: string;
  sortLowLabel: string;
  emptyLabel: string;
  centerLabel: string;
  otherLabel: string;
  seriesLabel: string;
  height?: number;
};

type ChartType = 'donut' | 'bars';
type SortMode = 'high' | 'low';

/** Interactive category/materials breakdown — toggle chart type + sort. */
export function DynamicBreakdownCard({
  title,
  subtitle,
  data,
  language,
  chartTypeLabel,
  sortLabel,
  donutLabel,
  barsLabel,
  sortHighLabel,
  sortLowLabel,
  emptyLabel,
  centerLabel,
  otherLabel,
  seriesLabel,
  height = 300,
}: DynamicBreakdownCardProps) {
  const [chartType, setChartType] = useState<ChartType>('donut');
  const [sortMode, setSortMode] = useState<SortMode>('high');

  const sorted = useMemo(() => {
    const next = [...data].filter((item) => item.value > 0);
    next.sort((a, b) =>
      sortMode === 'high' ? b.value - a.value : a.value - b.value,
    );
    return next;
  }, [data, sortMode]);

  const empty = sorted.length === 0;

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
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel id="breakdown-type-label">{chartTypeLabel}</InputLabel>
              <Select
                labelId="breakdown-type-label"
                label={chartTypeLabel}
                value={chartType}
                onChange={(event) =>
                  setChartType(event.target.value as ChartType)
                }
              >
                <MenuItem value="donut">{donutLabel}</MenuItem>
                <MenuItem value="bars">{barsLabel}</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel id="breakdown-sort-label">{sortLabel}</InputLabel>
              <Select
                labelId="breakdown-sort-label"
                label={sortLabel}
                value={sortMode}
                onChange={(event) =>
                  setSortMode(event.target.value as SortMode)
                }
              >
                <MenuItem value="high">{sortHighLabel}</MenuItem>
                <MenuItem value="low">{sortLowLabel}</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Stack>

        <Box sx={{ flex: 1, minHeight: height }}>
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
          ) : chartType === 'donut' ? (
            <CategoryDonutChart
              data={sorted}
              language={language}
              height={height - 8}
              centerLabel={centerLabel}
              otherLabel={otherLabel}
            />
          ) : (
            <ComparisonBarChart
              categories={sorted.map((item) => item.label)}
              series={[
                {
                  id: 'amount',
                  label: seriesLabel,
                  data: sorted.map((item) => item.value),
                  color: CHART_COLORS.revenue,
                },
              ]}
              language={language}
              height={Math.max(height, sorted.length * 36)}
              layout="horizontal"
            />
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
