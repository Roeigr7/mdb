import AccountBalanceRoundedIcon from '@mui/icons-material/AccountBalanceRounded';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import { BarChart } from '@mui/x-charts/BarChart';
import { LineChart } from '@mui/x-charts/LineChart';
import { PieChart } from '@mui/x-charts/PieChart';
import { useMemo, useState, type ReactNode } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { getErrorMessage } from '../../app/api/apiError';
import { useGetAnalyticsQuery } from '../../app/features/analytics/analyticsApi';
import { useGetProjectsQuery } from '../../app/features/projects/projectsApi';
import { formatMoney } from '../../i18n/format';
import { useAppTranslation } from '../../i18n/useAppTranslation';

const CHART_HEIGHT = 300;

type KpiCardProps = {
  title: string;
  value: string;
  hint: string;
  icon: ReactNode;
  accent?: string;
};

function KpiCard({ title, value, hint, icon, accent }: KpiCardProps) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Stack
          direction="row"
          spacing={1.5}
          sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                letterSpacing: '-0.02em',
                color: accent ?? 'text.primary',
              }}
            >
              {value}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {hint}
            </Typography>
          </Box>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2,
              display: 'grid',
              placeItems: 'center',
              bgcolor: 'rgba(30, 58, 95, 0.08)',
              color: 'primary.main',
              flexShrink: 0,
            }}
          >
            {icon}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

type ChartCardProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  empty?: boolean;
  emptyLabel: string;
};

function ChartCard({
  title,
  subtitle,
  children,
  empty,
  emptyLabel,
}: ChartCardProps) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ height: '100%' }}>
        <Stack spacing={0.5} sx={{ mb: 2 }}>
          <Typography variant="h6" component="h2">
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        </Stack>
        {empty ? (
          <Box
            sx={{
              height: CHART_HEIGHT,
              display: 'grid',
              placeItems: 'center',
              borderRadius: 2,
              bgcolor: 'action.hover',
            }}
          >
            <Typography variant="body2" color="text.secondary">
              {emptyLabel}
            </Typography>
          </Box>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}

function formatMonthLabel(month: string, locale: string) {
  const [year, monthPart] = month.split('-').map(Number);
  const date = new Date(year, monthPart - 1, 1);
  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    year: '2-digit',
  }).format(date);
}

const ALL_PROJECTS = 'all';

export function AnalyticsPage() {
  const { t, i18n } = useAppTranslation();
  const theme = useTheme();
  const {
    data: projectsData,
    isLoading: projectsLoading,
    isError: projectsError,
    error: projectsErr,
    refetch: refetchProjects,
  } = useGetProjectsQuery({ limit: 100 });

  const projects = projectsData?.data ?? [];
  const [selected, setSelected] = useState<string>(ALL_PROJECTS);
  const projectId =
    selected === ALL_PROJECTS ? undefined : Number(selected);

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useGetAnalyticsQuery(
    projectId != null ? { projectId } : undefined,
    { skip: projectsLoading || projects.length === 0 },
  );

  const monthLabels = useMemo(
    () =>
      (data?.monthlyCashflow ?? []).map((point) =>
        formatMonthLabel(point.month, i18n.language),
      ),
    [data?.monthlyCashflow, i18n.language],
  );

  const expenseSeries = useMemo(
    () => (data?.monthlyCashflow ?? []).map((point) => point.expenses),
    [data?.monthlyCashflow],
  );
  const revenueSeries = useMemo(
    () => (data?.monthlyCashflow ?? []).map((point) => point.revenue),
    [data?.monthlyCashflow],
  );

  const categoryPie = useMemo(
    () =>
      (data?.expensesByCategory ?? []).map((item, index) => ({
        id: index,
        value: item.amount,
        label: item.label === 'Uncategorized' ? t('analytics.uncategorized') : item.label,
      })),
    [data?.expensesByCategory, t],
  );

  const statusPie = useMemo(
    () =>
      (data?.revenueByStatus ?? []).map((item, index) => {
        const status = item.label;
        const label =
          status === 'PAID' || status === 'PENDING' || status === 'CANCELLED'
            ? t(`revenue.statuses.${status}`)
            : status;
        return {
          id: index,
          value: item.amount,
          label,
        };
      }),
    [data?.revenueByStatus, t],
  );

  const materialLabels = useMemo(
    () => (data?.topMaterials ?? []).map((item) => item.label),
    [data?.topMaterials],
  );
  const materialValues = useMemo(
    () => (data?.topMaterials ?? []).map((item) => item.amount),
    [data?.topMaterials],
  );

  const projectLabels = useMemo(
    () => (data?.projectBreakdown ?? []).map((item) => item.projectName),
    [data?.projectBreakdown],
  );
  const projectExpenseValues = useMemo(
    () => (data?.projectBreakdown ?? []).map((item) => item.expenses),
    [data?.projectBreakdown],
  );
  const projectRevenueValues = useMemo(
    () => (data?.projectBreakdown ?? []).map((item) => item.revenue),
    [data?.projectBreakdown],
  );

  const hasCashflow = expenseSeries.some((v) => v > 0) || revenueSeries.some((v) => v > 0);
  const showProjectChart =
    selected === ALL_PROJECTS && (data?.projectBreakdown.length ?? 0) > 1;

  const currencyValueFormatter = (value: number | null) =>
    formatMoney(value ?? 0, i18n.language);

  const axisValueFormatter = (value: number | null) =>
    new Intl.NumberFormat(i18n.language.startsWith('en') ? 'en-US' : 'he-IL', {
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value ?? 0);

  if (projectsLoading) {
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', py: 10 }}>
        <CircularProgress size={36} />
      </Box>
    );
  }

  return (
    <Stack spacing={3}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        sx={{
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', md: 'flex-end' },
        }}
      >
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            {t('analytics.title')}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t('analytics.subtitle')}
          </Typography>
        </Box>
        <FormControl sx={{ minWidth: { xs: '100%', md: 280 } }}>
          <InputLabel id="analytics-project-label">
            {t('analytics.scope')}
          </InputLabel>
          <Select
            labelId="analytics-project-label"
            label={t('analytics.scope')}
            value={selected}
            onChange={(event) => setSelected(String(event.target.value))}
          >
            <MenuItem value={ALL_PROJECTS}>{t('analytics.allProjects')}</MenuItem>
            {projects.map((project) => (
              <MenuItem key={project.id} value={String(project.id)}>
                {project.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      {(projectsError || isError) && (
        <Alert
          severity="error"
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => {
                void refetchProjects();
                void refetch();
              }}
            >
              {t('common.retry')}
            </Button>
          }
        >
          {getErrorMessage(
            projectsError ? projectsErr : error,
            t('analytics.loadError'),
          )}
        </Alert>
      )}

      {projects.length === 0 ? (
        <Card>
          <CardContent sx={{ py: 8, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              {t('analytics.noProjectsTitle')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {t('analytics.noProjectsBody')}
            </Typography>
            <Button component={RouterLink} to="/projects" variant="contained">
              {t('analytics.goToProjects')}
            </Button>
          </CardContent>
        </Card>
      ) : isLoading || !data ? (
        <Box sx={{ display: 'grid', placeItems: 'center', py: 10 }}>
          <CircularProgress size={36} />
        </Box>
      ) : (
        <>
          {isFetching && (
            <Typography variant="body2" color="text.secondary">
              {t('projects.updating')}
            </Typography>
          )}

          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <KpiCard
                title={t('analytics.kpiRevenue')}
                value={formatMoney(data.summary.totalRevenue, i18n.language)}
                hint={t('analytics.kpiRevenueHint', {
                  count: data.summary.revenueCount,
                })}
                icon={<TrendingUpRoundedIcon />}
                accent={theme.palette.success.main}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <KpiCard
                title={t('analytics.kpiExpenses')}
                value={formatMoney(data.summary.totalExpenses, i18n.language)}
                hint={t('analytics.kpiExpensesHint', {
                  count: data.summary.expenseCount,
                })}
                icon={<PaymentsRoundedIcon />}
                accent={theme.palette.error.main}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <KpiCard
                title={t('analytics.kpiNet')}
                value={formatMoney(data.summary.netProfit, i18n.language)}
                hint={t('analytics.kpiNetHint')}
                icon={<AccountBalanceRoundedIcon />}
                accent={
                  data.summary.netProfit >= 0
                    ? theme.palette.success.main
                    : theme.palette.error.main
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <KpiCard
                title={t('analytics.kpiMaterials')}
                value={formatMoney(
                  data.summary.totalMaterialsCost,
                  i18n.language,
                )}
                hint={t('analytics.kpiMaterialsHint', {
                  count: data.summary.materialsCount,
                })}
                icon={<Inventory2RoundedIcon />}
              />
            </Grid>
          </Grid>

          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, lg: 8 }}>
              <ChartCard
                title={t('analytics.cashflowTitle')}
                subtitle={t('analytics.cashflowSubtitle')}
                empty={!hasCashflow}
                emptyLabel={t('analytics.emptyChart')}
              >
                <LineChart
                  height={CHART_HEIGHT}
                  series={[
                    {
                      data: revenueSeries,
                      label: t('analytics.seriesRevenue'),
                      color: theme.palette.success.main,
                      area: true,
                      showMark: false,
                      valueFormatter: currencyValueFormatter,
                    },
                    {
                      data: expenseSeries,
                      label: t('analytics.seriesExpenses'),
                      color: theme.palette.error.main,
                      area: true,
                      showMark: false,
                      valueFormatter: currencyValueFormatter,
                    },
                  ]}
                  xAxis={[
                    {
                      data: monthLabels,
                      scaleType: 'point',
                      tickLabelStyle: { fontSize: 11 },
                    },
                  ]}
                  yAxis={[
                    {
                      valueFormatter: axisValueFormatter,
                    },
                  ]}
                  margin={{ left: 16, right: 16, top: 24, bottom: 8 }}
                  grid={{ horizontal: true }}
                />
              </ChartCard>
            </Grid>

            <Grid size={{ xs: 12, lg: 4 }}>
              <ChartCard
                title={t('analytics.expenseMixTitle')}
                subtitle={t('analytics.expenseMixSubtitle')}
                empty={categoryPie.length === 0}
                emptyLabel={t('analytics.emptyChart')}
              >
                <PieChart
                  height={CHART_HEIGHT}
                  series={[
                    {
                      data: categoryPie,
                      innerRadius: 55,
                      outerRadius: 100,
                      paddingAngle: 2,
                      cornerRadius: 4,
                      valueFormatter: (item) =>
                        formatMoney(item.value, i18n.language),
                    },
                  ]}
                  margin={{ top: 8, bottom: 8, left: 8, right: 8 }}
                />
              </ChartCard>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <ChartCard
                title={t('analytics.monthlyCompareTitle')}
                subtitle={t('analytics.monthlyCompareSubtitle')}
                empty={!hasCashflow}
                emptyLabel={t('analytics.emptyChart')}
              >
                <BarChart
                  height={CHART_HEIGHT}
                  series={[
                    {
                      data: revenueSeries,
                      label: t('analytics.seriesRevenue'),
                      color: theme.palette.success.main,
                      valueFormatter: currencyValueFormatter,
                    },
                    {
                      data: expenseSeries,
                      label: t('analytics.seriesExpenses'),
                      color: theme.palette.error.main,
                      valueFormatter: currencyValueFormatter,
                    },
                  ]}
                  xAxis={[
                    {
                      data: monthLabels,
                      scaleType: 'band',
                      tickLabelStyle: { fontSize: 11 },
                    },
                  ]}
                  margin={{ left: 16, right: 16, top: 24, bottom: 8 }}
                  grid={{ horizontal: true }}
                  borderRadius={6}
                />
              </ChartCard>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <ChartCard
                title={t('analytics.revenueStatusTitle')}
                subtitle={t('analytics.revenueStatusSubtitle')}
                empty={statusPie.length === 0}
                emptyLabel={t('analytics.emptyChart')}
              >
                <PieChart
                  height={CHART_HEIGHT}
                  series={[
                    {
                      data: statusPie,
                      outerRadius: 100,
                      paddingAngle: 2,
                      cornerRadius: 4,
                      valueFormatter: (item) =>
                        formatMoney(item.value, i18n.language),
                    },
                  ]}
                  margin={{ top: 8, bottom: 8, left: 8, right: 8 }}
                />
              </ChartCard>
            </Grid>

            <Grid size={{ xs: 12, lg: showProjectChart ? 6 : 12 }}>
              <ChartCard
                title={t('analytics.materialsTitle')}
                subtitle={t('analytics.materialsSubtitle')}
                empty={materialValues.length === 0}
                emptyLabel={t('analytics.emptyChart')}
              >
                <BarChart
                  height={CHART_HEIGHT}
                  layout="horizontal"
                  series={[
                    {
                      data: materialValues,
                      label: t('analytics.seriesMaterials'),
                      color: theme.palette.primary.main,
                      valueFormatter: currencyValueFormatter,
                    },
                  ]}
                  yAxis={[
                    {
                      data: materialLabels,
                      scaleType: 'band',
                      width: 110,
                    },
                  ]}
                  margin={{ left: 8, right: 24, top: 24, bottom: 8 }}
                  grid={{ vertical: true }}
                  borderRadius={6}
                />
              </ChartCard>
            </Grid>

            {showProjectChart && (
              <Grid size={{ xs: 12, lg: 6 }}>
                <ChartCard
                  title={t('analytics.projectsTitle')}
                  subtitle={t('analytics.projectsSubtitle')}
                  empty={projectLabels.length === 0}
                  emptyLabel={t('analytics.emptyChart')}
                >
                  <BarChart
                    height={CHART_HEIGHT}
                    series={[
                      {
                        data: projectRevenueValues,
                        label: t('analytics.seriesRevenue'),
                        color: theme.palette.success.main,
                        valueFormatter: currencyValueFormatter,
                      },
                      {
                        data: projectExpenseValues,
                        label: t('analytics.seriesExpenses'),
                        color: theme.palette.error.main,
                        valueFormatter: currencyValueFormatter,
                      },
                    ]}
                    xAxis={[
                      {
                        data: projectLabels,
                        scaleType: 'band',
                        tickLabelStyle: { fontSize: 11 },
                      },
                    ]}
                    margin={{ left: 16, right: 16, top: 24, bottom: 8 }}
                    grid={{ horizontal: true }}
                    borderRadius={6}
                  />
                </ChartCard>
              </Grid>
            )}
          </Grid>
        </>
      )}
    </Stack>
  );
}
