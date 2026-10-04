import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import { PieChart } from '@mui/x-charts/PieChart';
import { formatCompactMoney, formatMoney } from '../../i18n/format';
import { CHART_COLORS, chartAxisSx, chartTooltipSlotProps } from './chartTheme';

export type DonutSlice = {
  id: string | number;
  label: string;
  value: number;
};

export type CategoryDonutChartProps = {
  data: DonutSlice[];
  language: string;
  height?: number;
  centerLabel: string;
  maxSlices?: number;
  otherLabel: string;
};

export function CategoryDonutChart({
  data,
  language,
  height = 300,
  centerLabel,
  maxSlices = 6,
  otherLabel,
}: CategoryDonutChartProps) {
  const theme = useTheme();
  const donutSize = Math.min(height, 176);
  const sorted = [...data]
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value);

  const head = sorted.slice(0, maxSlices);
  const rest = sorted.slice(maxSlices);
  const otherTotal = rest.reduce((sum, item) => sum + item.value, 0);
  const slices =
    otherTotal > 0
      ? [...head, { id: 'other', label: otherLabel, value: otherTotal }]
      : head;

  const total = slices.reduce((sum, item) => sum + item.value, 0);
  const chartData = slices.map((item, index) => ({
    id: item.id,
    label: item.label,
    value: item.value,
    color: CHART_COLORS.palette[index % CHART_COLORS.palette.length],
  }));

  return (
    <Box sx={{ containerType: 'inline-size', width: '100%' }}>
      <Stack
      spacing={1.5}
      sx={{
        alignItems: 'stretch',
        '@container (min-width: 520px)': {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 2.5,
        },
      }}
    >
      <Box
        sx={{
          position: 'relative',
          width: donutSize,
          height: donutSize,
          mx: 'auto',
          flexShrink: 0,
          '@container (min-width: 520px)': {
            mx: 0,
          },
        }}
      >
        <PieChart
          width={donutSize}
          height={donutSize}
          series={[
            {
              data: chartData,
              innerRadius: 52,
              outerRadius: 74,
              paddingAngle: 2,
              cornerRadius: 3,
              cx: '50%',
              cy: '50%',
              valueFormatter: (item) => formatMoney(item.value, language),
              highlightScope: { fade: 'global', highlight: 'item' },
              faded: {
                additionalRadius: -4,
                color: alpha(theme.palette.text.primary, 0.08),
              },
            },
          ]}
          slotProps={{
            legend: { sx: { display: 'none' } },
            tooltip: chartTooltipSlotProps(theme, 'item'),
          }}
          margin={{ top: 8, bottom: 8, left: 8, right: 8 }}
          sx={{
            ...chartAxisSx(theme),
            '& .MuiPieArc-root': {
              stroke: theme.palette.background.paper,
              strokeWidth: 2.5,
            },
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'grid',
            placeItems: 'center',
            pointerEvents: 'none',
            textAlign: 'center',
          }}
        >
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                display: 'block',
                fontWeight: 600,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                fontSize: '0.65rem',
              }}
            >
              {centerLabel}
            </Typography>
            <Typography
              variant="h6"
              className="tabular-nums"
              sx={{
                fontWeight: 800,
                letterSpacing: '-0.03em',
                lineHeight: 1.2,
                mt: 0.25,
              }}
            >
              {formatCompactMoney(total, language)}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Stack spacing={0.25} sx={{ flex: 1, width: '100%', minWidth: 0 }}>
        {chartData.map((item) => {
          const pct = total > 0 ? (item.value / total) * 100 : 0;
          return (
            <Box
              key={String(item.id)}
              sx={{
                display: 'grid',
                gridTemplateColumns: '8px minmax(0, 1fr) auto auto',
                columnGap: 1.25,
                alignItems: 'center',
                minWidth: 0,
                px: 1,
                py: 0.7,
                borderRadius: 1.25,
                transition: 'background-color 120ms ease',
                '&:hover': {
                  bgcolor: alpha(item.color, 0.06),
                },
              }}
            >
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: 0.5,
                  bgcolor: item.color,
                }}
              />
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  minWidth: 0,
                  fontSize: '0.8125rem',
                  lineHeight: 1.35,
                  overflowWrap: 'break-word',
                }}
              >
                {item.label}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                className="tabular-nums"
                sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}
              >
                {pct.toFixed(0)}%
              </Typography>
              <Typography
                variant="body2"
                className="tabular-nums"
                sx={{
                  fontWeight: 700,
                  textAlign: 'end',
                  fontSize: '0.8125rem',
                  whiteSpace: 'nowrap',
                }}
              >
                {formatCompactMoney(item.value, language)}
              </Typography>
            </Box>
          );
        })}
      </Stack>
      </Stack>
    </Box>
  );
}
