import TrendingDownRoundedIcon from '@mui/icons-material/TrendingDownRounded';
import TrendingFlatRoundedIcon from '@mui/icons-material/TrendingFlatRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import { SparkLineChart } from '@mui/x-charts/SparkLineChart';
import type { ReactNode } from 'react';
import { tokens } from '../../app/theme';

export type StatCardProps = {
  title: string;
  value: string;
  hint?: string;
  icon?: ReactNode;
  trend?: {
    value: number;
    label: string;
  } | null;
  sparkline?: number[];
  accent?: string;
  /** Semantic tone for icon well — prefer over ad-hoc accent on the number */
  tone?: 'default' | 'revenue' | 'expenses' | 'profit' | 'neutral';
};

const TONE_COLORS = {
  default: tokens.teal[600],
  revenue: tokens.chart.revenue,
  expenses: tokens.chart.expenses,
  profit: tokens.chart.profit,
  neutral: tokens.ink[700],
} as const;

export function StatCard({
  title,
  value,
  hint,
  icon,
  trend,
  sparkline,
  accent,
  tone = 'default',
}: StatCardProps) {
  const theme = useTheme();
  const toneColor = accent ?? TONE_COLORS[tone];
  const trendPositive = trend != null && trend.value > 0;
  const trendNegative = trend != null && trend.value < 0;
  const trendFlat = trend != null && trend.value === 0;
  const sparkColor =
    accent ??
    (trend == null
      ? toneColor
      : trendPositive
        ? theme.palette.success.main
        : trendNegative
          ? theme.palette.error.main
          : theme.palette.text.secondary);
  const hasSpark = Array.isArray(sparkline) && sparkline.length >= 2;

  const TrendIcon = trendPositive
    ? TrendingUpRoundedIcon
    : trendNegative
      ? TrendingDownRoundedIcon
      : TrendingFlatRoundedIcon;

  return (
    <Card
      sx={{
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          insetInlineStart: 0,
          top: 0,
          bottom: 0,
          width: 3,
          bgcolor: alpha(toneColor, 0.85),
          opacity: 0,
          transition: 'opacity 160ms ease',
        },
        '&:hover': {
          borderColor: alpha(toneColor, 0.22),
          boxShadow: `0 4px 16px ${alpha(tokens.ink[900], 0.06)}`,
          '&::before': { opacity: 1 },
        },
      }}
    >
      <CardContent sx={{ p: 2.25, '&:last-child': { pb: 2.25 } }}>
        <Stack spacing={1.75}>
          <Stack
            direction="row"
            spacing={1.5}
            sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}
          >
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  fontSize: '0.6875rem',
                  display: 'block',
                  mb: 0.85,
                }}
              >
                {title}
              </Typography>
              <Typography
                variant="h4"
                className="tabular-nums"
                sx={{
                  fontWeight: 800,
                  letterSpacing: '-0.035em',
                  color: 'text.primary',
                  lineHeight: 1.1,
                  fontSize: { xs: '1.375rem', sm: '1.5rem' },
                }}
              >
                {value}
              </Typography>
            </Box>
            {icon && (
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  display: 'grid',
                  placeItems: 'center',
                  bgcolor: alpha(toneColor, 0.09),
                  color: toneColor,
                  flexShrink: 0,
                  '& .MuiSvgIcon-root': { fontSize: 20 },
                }}
              >
                {icon}
              </Box>
            )}
          </Stack>

          {(trend || hint || hasSpark) && (
            <Stack
              direction="row"
              spacing={1.5}
              sx={{
                alignItems: 'flex-end',
                justifyContent: 'space-between',
                minHeight: 32,
              }}
            >
              <Stack spacing={0.35} sx={{ minWidth: 0 }}>
                {trend && (
                  <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
                    <Box
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 0.35,
                        px: 0.65,
                        py: 0.2,
                        borderRadius: 1,
                        bgcolor: trendFlat
                          ? alpha(theme.palette.text.secondary, 0.08)
                          : trendPositive
                            ? theme.palette.success.light
                            : theme.palette.error.light,
                        color: trendFlat
                          ? 'text.secondary'
                          : trendPositive
                            ? 'success.main'
                            : 'error.main',
                      }}
                    >
                      <TrendIcon sx={{ fontSize: 14 }} />
                      <Typography
                        variant="caption"
                        className="tabular-nums"
                        sx={{ fontWeight: 700, lineHeight: 1 }}
                      >
                        {trendPositive ? '+' : ''}
                        {trend.value.toFixed(1)}%
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {trend.label}
                    </Typography>
                  </Stack>
                )}
                {!trend && hint && (
                  <Typography variant="caption" color="text.secondary">
                    {hint}
                  </Typography>
                )}
              </Stack>

              {hasSpark && (
                <Box sx={{ width: 88, height: 32, flexShrink: 0, opacity: 0.9 }}>
                  <SparkLineChart
                    data={sparkline}
                    height={32}
                    color={sparkColor}
                    curve="natural"
                    area
                    margin={{ top: 2, bottom: 2, left: 0, right: 0 }}
                    sx={{
                      '.MuiAreaElement-root': {
                        fillOpacity: 0.14,
                      },
                      '.MuiLineElement-root': {
                        strokeWidth: 1.75,
                      },
                    }}
                  />
                </Box>
              )}
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
