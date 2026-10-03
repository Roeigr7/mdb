import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import { Gauge, gaugeClasses } from '@mui/x-charts/Gauge';
import { CHART_COLORS } from './chartTheme';

export type MarginGaugeProps = {
  revenue: number;
  expenses: number;
  label: string;
  hint: string;
  height?: number;
};

/** Profit-margin gauge (0–100%, clamped for display). */
export function MarginGauge({
  revenue,
  expenses,
  label,
  hint,
  height = 220,
}: MarginGaugeProps) {
  const theme = useTheme();
  const margin = revenue > 0 ? ((revenue - expenses) / revenue) * 100 : 0;
  const display = Math.max(0, Math.min(100, margin));
  const color =
    margin >= 20
      ? CHART_COLORS.profit
      : margin >= 0
        ? CHART_COLORS.materials
        : CHART_COLORS.expenses;

  return (
    <Stack
      spacing={1}
      sx={{
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        py: 1,
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 220, height }}>
        <Gauge
          value={display}
          startAngle={-110}
          endAngle={110}
          height={height}
          cornerRadius="50%"
          sx={{
            [`& .${gaugeClasses.valueText}`]: {
              fontSize: 28,
              fontWeight: 800,
              letterSpacing: '-0.03em',
              fill: theme.palette.text.primary,
            },
            [`& .${gaugeClasses.valueArc}`]: {
              fill: color,
            },
            [`& .${gaugeClasses.referenceArc}`]: {
              fill: alpha(theme.palette.text.primary, 0.06),
            },
          }}
          text={({ value }) => `${(value ?? 0).toFixed(0)}%`}
        />
      </Box>
      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
        {label}
      </Typography>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ textAlign: 'center', px: 2 }}
      >
        {hint}
      </Typography>
      {margin < 0 && (
        <Typography
          variant="caption"
          sx={{ color: CHART_COLORS.expenses, fontWeight: 700 }}
        >
          {margin.toFixed(1)}%
        </Typography>
      )}
    </Stack>
  );
}
