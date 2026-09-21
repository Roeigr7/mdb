import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import { SparkLineChart } from '@mui/x-charts/SparkLineChart';
import type { ReactNode } from 'react';

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
};

export function StatCard({
  title,
  value,
  hint,
  icon,
  trend,
  sparkline,
  accent,
}: StatCardProps) {
  const theme = useTheme();
  const trendPositive = trend != null && trend.value >= 0;
  const sparkColor =
    accent ??
    (trend == null
      ? theme.palette.primary.main
      : trendPositive
        ? theme.palette.success.main
        : theme.palette.error.main);
  const hasSpark =
    Array.isArray(sparkline) && sparkline.length >= 2;

  return (
    <Card
      sx={{
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        '&:hover': {
          borderColor: 'rgba(26, 54, 93, 0.2)',
        },
      }}
    >
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <Stack spacing={1.5}>
          <Stack
            direction="row"
            spacing={1.5}
            sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}
          >
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontWeight: 500, mb: 0.75 }}
              >
                {title}
              </Typography>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  letterSpacing: '-0.03em',
                  color: accent ?? 'text.primary',
                  lineHeight: 1.15,
                }}
              >
                {value}
              </Typography>
            </Box>
            {icon && (
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 2.5,
                  display: 'grid',
                  placeItems: 'center',
                  bgcolor: 'rgba(26, 54, 93, 0.08)',
                  color: 'primary.main',
                  flexShrink: 0,
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
                minHeight: 36,
              }}
            >
              <Stack spacing={0.5} sx={{ minWidth: 0 }}>
                {trend && (
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 700,
                        color: trendPositive ? 'success.main' : 'error.main',
                        bgcolor: trendPositive ? 'success.light' : 'error.light',
                        px: 0.75,
                        py: 0.25,
                        borderRadius: 1,
                      }}
                    >
                      {trendPositive ? '+' : ''}
                      {trend.value.toFixed(1)}%
                    </Typography>
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
                <Box sx={{ width: 96, height: 36, flexShrink: 0 }}>
                  <SparkLineChart
                    data={sparkline}
                    height={36}
                    color={sparkColor}
                    curve="natural"
                    area
                    margin={{ top: 4, bottom: 4, left: 0, right: 0 }}
                    sx={{
                      '.MuiAreaElement-root': {
                        fillOpacity: 0.18,
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
