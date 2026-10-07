import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import type { ReactNode } from 'react';
import { tokens } from '../../app/theme';
import { useAppTranslation } from '../../i18n/useAppTranslation';
import type { CashflowRange } from './chartTheme';

export type ChartRangeOption = {
  value: CashflowRange;
  label: string;
};

export type ProfessionalChartCardProps = {
  title: string;
  subtitle?: string;
  kpiValue?: string;
  kpiTrend?: { value: number; label: string } | null;
  ranges?: ChartRangeOption[];
  activeRange?: CashflowRange;
  onRangeChange?: (range: CashflowRange) => void;
  actions?: ReactNode;
  footer?: ReactNode;
  loading?: boolean;
  empty?: boolean;
  emptyLabel?: string;
  error?: boolean;
  errorLabel?: string;
  retryLabel?: string;
  onRetry?: () => void;
  height?: number;
  children: ReactNode;
};

export function ProfessionalChartCard({
  title,
  subtitle,
  kpiValue,
  kpiTrend,
  ranges,
  activeRange,
  onRangeChange,
  actions,
  footer,
  loading,
  empty,
  emptyLabel,
  error,
  errorLabel,
  retryLabel,
  onRetry,
  height = 320,
  children,
}: ProfessionalChartCardProps) {
  const { t } = useAppTranslation();
  const trendPositive = kpiTrend != null && kpiTrend.value >= 0;

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'box-shadow 160ms ease, border-color 160ms ease',
        '&:hover': {
          borderColor: alpha(tokens.teal[600], 0.16),
          boxShadow: `0 4px 20px ${alpha(tokens.ink[900], 0.06)}`,
        },
      }}
    >
      <CardContent
        sx={{
          p: 2.5,
          pb: 2,
          '&:last-child': { pb: footer ? 1.5 : 2.5 },
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
        }}
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.5}
          sx={{
            justifyContent: 'space-between',
            alignItems: { xs: 'stretch', sm: 'flex-start' },
            mb: 2,
            gap: 1.5,
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="h6"
              component="h2"
              sx={{ letterSpacing: '-0.015em', fontWeight: 700 }}
            >
              {title}
            </Typography>
            {subtitle && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.35, lineHeight: 1.45 }}
              >
                {subtitle}
              </Typography>
            )}
            {kpiValue && (
              <Stack
                direction="row"
                spacing={1.25}
                sx={{ alignItems: 'baseline', mt: 1.35, flexWrap: 'wrap' }}
              >
                <Typography
                  variant="h4"
                  className="tabular-nums"
                  sx={{
                    fontWeight: 800,
                    letterSpacing: '-0.035em',
                    lineHeight: 1,
                    fontSize: '1.5rem',
                  }}
                >
                  {kpiValue}
                </Typography>
                {kpiTrend && (
                  <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
                    <Typography
                      variant="caption"
                      className="tabular-nums"
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
                      {kpiTrend.value.toFixed(1)}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {kpiTrend.label}
                    </Typography>
                  </Stack>
                )}
              </Stack>
            )}
          </Box>

          <Stack
            direction="row"
            spacing={1}
            sx={{ alignItems: 'center', flexShrink: 0, flexWrap: 'wrap' }}
          >
            {ranges && ranges.length > 0 && onRangeChange && (
              <Box
                role="group"
                aria-label={title}
                sx={{
                  display: 'inline-flex',
                  p: 0.4,
                  borderRadius: 2,
                  bgcolor: alpha(tokens.ink[900], 0.035),
                  border: `1px solid ${alpha(tokens.ink[900], 0.05)}`,
                  gap: 0.25,
                }}
              >
                {ranges.map((range) => {
                  const selected = range.value === activeRange;
                  return (
                    <ButtonBase
                      key={range.value}
                      onClick={() => onRangeChange(range.value)}
                      sx={{
                        px: 1.25,
                        py: 0.55,
                        borderRadius: 1.25,
                        typography: 'caption',
                        fontWeight: 700,
                        minWidth: 40,
                        color: selected ? tokens.teal[700] : 'text.secondary',
                        bgcolor: selected ? 'background.paper' : 'transparent',
                        boxShadow: selected
                          ? `0 1px 3px ${alpha(tokens.ink[900], 0.08)}`
                          : 'none',
                        transition:
                          'background-color 120ms ease, color 120ms ease, box-shadow 120ms ease',
                      }}
                    >
                      {range.label}
                    </ButtonBase>
                  );
                })}
              </Box>
            )}
            {actions}
          </Stack>
        </Stack>

        <Box sx={{ flex: 1, minHeight: height, minWidth: 0, maxWidth: '100%', overflow: 'hidden' }}>
          {loading ? (
            <Skeleton variant="rounded" height={height} />
          ) : error ? (
            <Box
              sx={{
                height,
                display: 'grid',
                placeItems: 'center',
                borderRadius: 2,
                bgcolor: tokens.semantic.errorSoft,
                border: `1px solid ${alpha(tokens.semantic.error, 0.12)}`,
                px: 2,
                textAlign: 'center',
              }}
            >
              <Stack spacing={1} sx={{ alignItems: 'center' }}>
                <Typography variant="body2" color="error.dark">
                  {errorLabel}
                </Typography>
                {onRetry && (
                  <ButtonBase
                    onClick={onRetry}
                    sx={{
                      typography: 'caption',
                      fontWeight: 700,
                      color: 'error.dark',
                      textDecoration: 'underline',
                    }}
                  >
                    {retryLabel ?? t('common.retry')}
                  </ButtonBase>
                )}
              </Stack>
            </Box>
          ) : empty ? (
            <Box
              sx={{
                height,
                display: 'grid',
                placeItems: 'center',
                borderRadius: 2,
                bgcolor: alpha(tokens.teal[600], 0.025),
                border: '1px dashed',
                borderColor: alpha(tokens.ink[900], 0.1),
              }}
            >
              <Typography variant="body2" color="text.secondary">
                {emptyLabel}
              </Typography>
            </Box>
          ) : (
            children
          )}
        </Box>

        {footer && !loading && !empty && !error && (
          <Box
            sx={{
              mt: 1.5,
              pt: 1.5,
              borderTop: '1px solid',
              borderColor: 'divider',
            }}
          >
            {footer}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
