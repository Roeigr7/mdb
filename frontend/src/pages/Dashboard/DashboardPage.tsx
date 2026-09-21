import AccountBalanceRoundedIcon from '@mui/icons-material/AccountBalanceRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import FolderRoundedIcon from '@mui/icons-material/FolderRounded';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import { BarChart } from '@mui/x-charts/BarChart';
import { LineChart } from '@mui/x-charts/LineChart';
import { PieChart } from '@mui/x-charts/PieChart';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import { getErrorMessage } from '../../app/api/apiError';
import { useGetAnalyticsQuery } from '../../app/features/analytics/analyticsApi';
import { selectCurrentUser } from '../../app/features/auth/authSlice';
import { useGetProjectsQuery } from '../../app/features/projects/projectsApi';
import { ChartCard, DashboardSkeleton } from '../../components/ui/ChartCard';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatCard } from '../../components/ui/StatCard';
import { formatDate, formatMoney } from '../../i18n/format';
import { useAppTranslation } from '../../i18n/useAppTranslation';
import { monthOverMonthPercent } from './dashboardMetrics';

const CHART_HEIGHT = 300;

function formatMonthLabel(month: string, locale: string) {
  const [year, monthPart] = month.split('-').map(Number);
  const date = new Date(year, monthPart - 1, 1);
  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    year: '2-digit',
  }).format(date);
}

export function DashboardPage() {
  const { t, i18n } = useAppTranslation();
  const theme = useTheme();
  const user = useSelector(selectCurrentUser);

  const {
    data: projectsData,
    isLoading: projectsLoading,
    isError: projectsError,
    error: projectsErr,
    refetch: refetchProjects,
  } = useGetProjectsQuery({ limit: 100, sortBy: 'updatedAt', sortOrder: 'desc' });

  const {
    data: analytics,
    isLoading: analyticsLoading,
    isError: analyticsError,
    error: analyticsErr,
    refetch: refetchAnalytics,
  } = useGetAnalyticsQuery();

  const projects = projectsData?.data ?? [];
  const loading = projectsLoading || analyticsLoading;

  const monthLabels = useMemo(
    () =>
      (analytics?.monthlyCashflow ?? []).map((point) =>
        formatMonthLabel(point.month, i18n.language),
      ),
    [analytics?.monthlyCashflow, i18n.language],
  );
  const expenseSeries = useMemo(
    () => (analytics?.monthlyCashflow ?? []).map((point) => point.expenses),
    [analytics?.monthlyCashflow],
  );
  const revenueSeries = useMemo(
    () => (analytics?.monthlyCashflow ?? []).map((point) => point.revenue),
    [analytics?.monthlyCashflow],
  );

  const revenueTrend = useMemo(
    () => monthOverMonthPercent(revenueSeries),
    [revenueSeries],
  );
  const expensesTrend = useMemo(
    () => monthOverMonthPercent(expenseSeries),
    [expenseSeries],
  );
  const profitSeries = useMemo(
    () =>
      revenueSeries.map((revenue, index) => revenue - (expenseSeries[index] ?? 0)),
    [expenseSeries, revenueSeries],
  );
  const profitTrend = useMemo(
    () => monthOverMonthPercent(profitSeries),
    [profitSeries],
  );

  const categoryPie = useMemo(
    () =>
      (analytics?.expensesByCategory ?? []).map((item, index) => ({
        id: index,
        value: item.amount,
        label:
          item.label === 'Uncategorized'
            ? t('analytics.uncategorized')
            : item.label,
      })),
    [analytics?.expensesByCategory, t],
  );

  const projectBreakdown = analytics?.projectBreakdown ?? [];
  const projectChartLabels = projectBreakdown.map((item) => item.projectName);
  const projectRevenue = projectBreakdown.map((item) => item.revenue);
  const projectExpenses = projectBreakdown.map((item) => item.expenses);

  const financeByProjectId = useMemo(() => {
    const map = new Map<
      number,
      { revenue: number; expenses: number; profit: number }
    >();
    for (const row of projectBreakdown) {
      map.set(row.projectId, {
        revenue: row.revenue,
        expenses: row.expenses,
        profit: row.revenue - row.expenses,
      });
    }
    return map;
  }, [projectBreakdown]);

  const recentProjects = projects.slice(0, 8);
  const hasCashflow =
    expenseSeries.some((value) => value > 0) ||
    revenueSeries.some((value) => value > 0);

  const currencyValueFormatter = (value: number | null) =>
    formatMoney(value ?? 0, i18n.language);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (projectsError || analyticsError) {
    return (
      <Alert
        severity="error"
        action={
          <Button
            color="inherit"
            size="small"
            onClick={() => {
              void refetchProjects();
              void refetchAnalytics();
            }}
          >
            {t('common.retry')}
          </Button>
        }
      >
        {getErrorMessage(
          projectsError ? projectsErr : analyticsErr,
          t('dashboard.loadError'),
        )}
      </Alert>
    );
  }

  const summary = analytics?.summary;

  return (
    <Stack spacing={3}>
      <Card
        sx={{
          border: 'none',
          background: `
            radial-gradient(ellipse 80% 120% at 100% 0%, ${alpha(theme.palette.primary.light, 0.28)}, transparent 55%),
            linear-gradient(120deg, #0b1f3a 0%, #1a365d 55%, #243f66 100%)
          `,
          color: '#fff',
          boxShadow: '0 8px 28px rgba(15, 23, 42, 0.12)',
          '&:hover': {
            borderColor: 'transparent',
            boxShadow: '0 10px 32px rgba(15, 23, 42, 0.16)',
          },
        }}
      >
        <Box
          sx={{
            p: { xs: 2.5, sm: 3.5 },
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { sm: 'center' },
            justifyContent: 'space-between',
            gap: 2.5,
          }}
        >
          <Box sx={{ maxWidth: 560 }}>
            <Typography variant="overline" sx={{ color: alpha('#fff', 0.55) }}>
              {t('dashboard.welcomeEyebrow')}
            </Typography>
            <Typography
              variant="h4"
              sx={{ fontWeight: 800, letterSpacing: '-0.02em', mb: 0.75 }}
            >
              {t('dashboard.welcomeTitle', {
                name: user?.name?.trim() || user?.email || t('app.name'),
              })}
            </Typography>
            <Typography variant="body1" sx={{ color: alpha('#fff', 0.72) }}>
              {t('dashboard.welcomeBody')}
            </Typography>
          </Box>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25}>
            <Button
              component={RouterLink}
              to="/projects"
              variant="contained"
              startIcon={<AddRoundedIcon />}
              sx={{
                bgcolor: '#fff',
                color: 'primary.main',
                '&:hover': { bgcolor: alpha('#fff', 0.92) },
              }}
            >
              {t('projects.create')}
            </Button>
            <Button
              component={RouterLink}
              to="/reports"
              variant="outlined"
              sx={{
                borderColor: alpha('#fff', 0.35),
                color: '#fff',
                '&:hover': {
                  borderColor: alpha('#fff', 0.55),
                  bgcolor: alpha('#fff', 0.08),
                },
              }}
            >
              {t('nav.reports')}
            </Button>
          </Stack>
        </Box>
      </Card>

      <PageHeader
        title={t('dashboard.title')}
        subtitle={t('dashboard.subtitle')}
      />

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            title={t('dashboard.totalRevenue')}
            value={formatMoney(summary?.totalRevenue ?? 0, i18n.language)}
            icon={<TrendingUpRoundedIcon />}
            accent={theme.palette.success.main}
            sparkline={revenueSeries}
            trend={
              revenueTrend == null
                ? null
                : {
                    value: revenueTrend,
                    label: t('dashboard.vsPreviousMonth'),
                  }
            }
            hint={t('dashboard.revenueHint')}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            title={t('dashboard.totalExpenses')}
            value={formatMoney(summary?.totalExpenses ?? 0, i18n.language)}
            icon={<PaymentsRoundedIcon />}
            accent={theme.palette.error.main}
            sparkline={expenseSeries}
            trend={
              expensesTrend == null
                ? null
                : {
                    value: expensesTrend,
                    label: t('dashboard.vsPreviousMonth'),
                  }
            }
            hint={t('dashboard.expensesHint')}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            title={t('dashboard.netProfit')}
            value={formatMoney(summary?.netProfit ?? 0, i18n.language)}
            icon={<AccountBalanceRoundedIcon />}
            accent={
              (summary?.netProfit ?? 0) >= 0
                ? theme.palette.success.main
                : theme.palette.error.main
            }
            sparkline={profitSeries}
            trend={
              profitTrend == null
                ? null
                : {
                    value: profitTrend,
                    label: t('dashboard.vsPreviousMonth'),
                  }
            }
            hint={t('dashboard.netProfitHint')}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            title={t('dashboard.totalProjects')}
            value={String(projectsData?.meta.total ?? projects.length)}
            icon={<FolderRoundedIcon />}
            hint={t('dashboard.projectsHint')}
          />
        </Grid>
      </Grid>

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <ChartCard
            title={t('dashboard.cashflowTitle')}
            subtitle={t('dashboard.cashflowSubtitle')}
            empty={!hasCashflow}
            emptyLabel={t('analytics.emptyChart')}
            height={CHART_HEIGHT}
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
              margin={{ left: 16, right: 16, top: 24, bottom: 8 }}
              grid={{ horizontal: true }}
            />
          </ChartCard>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <ChartCard
            title={t('dashboard.expenseMixTitle')}
            subtitle={t('dashboard.expenseMixSubtitle')}
            empty={categoryPie.length === 0}
            emptyLabel={t('analytics.emptyChart')}
            height={CHART_HEIGHT}
          >
            <PieChart
              height={CHART_HEIGHT}
              series={[
                {
                  data: categoryPie,
                  innerRadius: 58,
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

        {projectBreakdown.length > 0 && (
          <Grid size={{ xs: 12 }}>
            <ChartCard
              title={t('dashboard.projectsChartTitle')}
              subtitle={t('dashboard.projectsChartSubtitle')}
              height={CHART_HEIGHT}
            >
              <BarChart
                height={CHART_HEIGHT}
                series={[
                  {
                    data: projectRevenue,
                    label: t('analytics.seriesRevenue'),
                    color: theme.palette.success.main,
                    valueFormatter: currencyValueFormatter,
                  },
                  {
                    data: projectExpenses,
                    label: t('analytics.seriesExpenses'),
                    color: theme.palette.error.main,
                    valueFormatter: currencyValueFormatter,
                  },
                ]}
                xAxis={[
                  {
                    data: projectChartLabels,
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

      <Card>
        <Box
          sx={{
            px: 2.5,
            py: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
            flexWrap: 'wrap',
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box>
            <Typography variant="h6">{t('dashboard.recentProjectsTitle')}</Typography>
            <Typography variant="body2" color="text.secondary">
              {t('dashboard.recentProjectsSubtitle')}
            </Typography>
          </Box>
          <Button component={RouterLink} to="/projects" variant="outlined" size="small">
            {t('dashboard.viewAllProjects')}
          </Button>
        </Box>

        {recentProjects.length === 0 ? (
          <Box sx={{ py: 8, px: 3, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              {t('projects.emptyTitle')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {t('projects.emptyBody')}
            </Typography>
            <Button
              component={RouterLink}
              to="/projects"
              variant="contained"
              startIcon={<AddRoundedIcon />}
            >
              {t('projects.create')}
            </Button>
          </Box>
        ) : (
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table size="medium" sx={{ minWidth: 720 }}>
              <TableHead>
                <TableRow>
                  <TableCell>{t('projects.name')}</TableCell>
                  <TableCell align="right">{t('dashboard.colRevenue')}</TableCell>
                  <TableCell align="right">{t('dashboard.colExpenses')}</TableCell>
                  <TableCell align="right">{t('dashboard.colProfit')}</TableCell>
                  <TableCell>{t('projects.created')}</TableCell>
                  <TableCell align="right">{t('common.actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentProjects.map((project) => {
                  const finance = financeByProjectId.get(project.id);
                  return (
                    <TableRow key={project.id} hover>
                      <TableCell>
                        <Typography variant="subtitle2">{project.name}</Typography>
                        <Typography variant="caption" color="text.secondary" noWrap>
                          {project.description || t('common.none')}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        {finance
                          ? formatMoney(finance.revenue, i18n.language)
                          : t('common.none')}
                      </TableCell>
                      <TableCell align="right">
                        {finance
                          ? formatMoney(finance.expenses, i18n.language)
                          : t('common.none')}
                      </TableCell>
                      <TableCell align="right">
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            color:
                              finance && finance.profit < 0
                                ? 'error.main'
                                : 'success.main',
                          }}
                        >
                          {finance
                            ? formatMoney(finance.profit, i18n.language)
                            : t('common.none')}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {formatDate(project.updatedAt, i18n.language)}
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title={t('common.view')}>
                          <IconButton
                            component={RouterLink}
                            to={`/projects/${project.id}`}
                            size="small"
                            aria-label={t('projects.viewAria', {
                              name: project.name,
                            })}
                          >
                            <VisibilityOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>
    </Stack>
  );
}
