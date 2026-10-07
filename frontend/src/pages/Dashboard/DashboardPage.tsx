import AccountBalanceRoundedIcon from '@mui/icons-material/AccountBalanceRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
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
import { alpha } from '@mui/material/styles';
import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { getErrorMessage } from '../../app/api/apiError';
import { useGetAnalyticsQuery } from '../../app/features/analytics/analyticsApi';
import { selectCurrentUser } from '../../app/features/auth/authSlice';
import { useGetProjectsQuery } from '../../app/features/projects/projectsApi';
import { tokens } from '../../app/theme';
import {
  CashflowAreaChart,
  CashflowLegendFooter,
  CategoryDonutChart,
  ComparisonBarChart,
  ProfessionalChartCard,
  sliceLastMonths,
  type CashflowRange,
} from '../../components/charts';
import { DashboardSkeleton } from '../../components/ui/DashboardSkeleton';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatCard } from '../../components/ui/StatCard';
import { formatDate, formatMoney } from '../../i18n/format';
import { useAppTranslation } from '../../i18n/useAppTranslation';
import { monthOverMonthPercent } from './dashboardMetrics';

const CHART_HEIGHT = 300;

export function DashboardPage() {
  const { t, i18n } = useAppTranslation();
  const user = useSelector(selectCurrentUser);
  const navigate = useNavigate();
  const [cashflowRange, setCashflowRange] = useState<CashflowRange>(12);

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

  const cashflowData = useMemo(
    () => sliceLastMonths(analytics?.monthlyCashflow ?? [], cashflowRange),
    [analytics?.monthlyCashflow, cashflowRange],
  );

  const expenseSeries = useMemo(
    () => cashflowData.map((point) => point.expenses),
    [cashflowData],
  );
  const revenueSeries = useMemo(
    () => cashflowData.map((point) => point.revenue),
    [cashflowData],
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

  const rangeRevenueTotal = useMemo(
    () => cashflowData.reduce((sum, point) => sum + point.revenue, 0),
    [cashflowData],
  );
  const rangeExpensesTotal = useMemo(
    () => cashflowData.reduce((sum, point) => sum + point.expenses, 0),
    [cashflowData],
  );
  const rangeProfitTotal = rangeRevenueTotal - rangeExpensesTotal;

  const donutSlices = useMemo(
    () =>
      (analytics?.expensesByCategory ?? []).map((item) => ({
        id: item.label,
        value: item.amount,
        label:
          item.label === 'Uncategorized'
            ? t('analytics.uncategorized')
            : item.label,
      })),
    [analytics?.expensesByCategory, t],
  );

  const projectBreakdown = analytics?.projectBreakdown ?? [];
  const useHorizontalProjects = projectBreakdown.length > 4;

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

  const cashflowRanges = [
    { value: 3 as const, label: t('charts.range3m') },
    { value: 6 as const, label: t('charts.range6m') },
    { value: 12 as const, label: t('charts.range12m') },
  ];

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
  const displayName =
    user?.name?.trim() || user?.email?.split('@')[0] || t('app.name');

  return (
    <Stack spacing={3}>
      {/* Compact command strip — not a competing hero */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { md: 'center' },
          justifyContent: 'space-between',
          gap: 2,
          p: { xs: 2, sm: 2.5 },
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: '#fff',
          backgroundImage: `
            radial-gradient(ellipse 60% 120% at 100% 50%, ${alpha(tokens.teal[500], 0.06)}, transparent 55%),
            linear-gradient(135deg, ${alpha(tokens.ink[900], 0.02)} 0%, transparent 50%)
          `,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="overline"
            sx={{ color: tokens.teal[600], letterSpacing: '0.1em' }}
          >
            {t('dashboard.welcomeEyebrow')}
          </Typography>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              letterSpacing: '-0.03em',
              fontSize: { xs: '1.25rem', sm: '1.375rem' },
              mb: 0.35,
              overflowWrap: 'anywhere',
            }}
          >
            {t('dashboard.welcomeTitle', { name: displayName })}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 480 }}>
            {t('dashboard.welcomeBody')}
          </Typography>
        </Box>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1}
          sx={{ width: { xs: '100%', sm: 'auto' }, minWidth: 0 }}
        >
          <Button
            component={RouterLink}
            to="/projects"
            variant="contained"
            startIcon={<AddRoundedIcon />}
          >
            {t('projects.create')}
          </Button>
          <Button
            component={RouterLink}
            to="/reports"
            variant="outlined"
            endIcon={
              <ArrowForwardRoundedIcon
                sx={{
                  fontSize: 16,
                  transform: (muiTheme) =>
                    muiTheme.direction === 'rtl' ? 'scaleX(-1)' : 'none',
                }}
              />
            }
          >
            {t('nav.reports')}
          </Button>
        </Stack>
      </Box>

      <PageHeader
        title={t('dashboard.title')}
        subtitle={t('dashboard.subtitle')}
        hideTitle
      />

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            title={t('dashboard.totalRevenue')}
            value={formatMoney(summary?.totalRevenue ?? 0, i18n.language)}
            icon={<TrendingUpRoundedIcon />}
            tone="revenue"
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
            tone="expenses"
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
            tone="profit"
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
            tone="neutral"
            hint={t('dashboard.projectsHint')}
          />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <ProfessionalChartCard
            title={t('dashboard.cashflowTitle')}
            subtitle={t('dashboard.cashflowSubtitle')}
            kpiValue={formatMoney(rangeRevenueTotal, i18n.language)}
            kpiTrend={
              revenueTrend == null
                ? null
                : {
                    value: revenueTrend,
                    label: t('charts.vsSelectedPeriod'),
                  }
            }
            ranges={cashflowRanges}
            activeRange={cashflowRange}
            onRangeChange={setCashflowRange}
            empty={!hasCashflow}
            emptyLabel={t('analytics.emptyChart')}
            error={analyticsError}
            errorLabel={t('charts.loadError')}
            retryLabel={t('common.retry')}
            onRetry={() => void refetchAnalytics()}
            height={CHART_HEIGHT}
            footer={
              hasCashflow ? (
                <CashflowLegendFooter
                  revenueLabel={t('analytics.seriesRevenue')}
                  expensesLabel={t('analytics.seriesExpenses')}
                  profitLabel={t('charts.profitSeries')}
                  revenueTotal={rangeRevenueTotal}
                  expensesTotal={rangeExpensesTotal}
                  profitTotal={rangeProfitTotal}
                  language={i18n.language}
                />
              ) : undefined
            }
          >
            <CashflowAreaChart
              data={cashflowData}
              language={i18n.language}
              height={CHART_HEIGHT}
              revenueLabel={t('analytics.seriesRevenue')}
              expensesLabel={t('analytics.seriesExpenses')}
              profitLabel={t('charts.profitSeries')}
            />
          </ProfessionalChartCard>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <ProfessionalChartCard
            title={t('dashboard.expenseMixTitle')}
            subtitle={t('dashboard.expenseMixSubtitle')}
            empty={donutSlices.length === 0}
            emptyLabel={t('analytics.emptyChart')}
            error={analyticsError}
            errorLabel={t('charts.loadError')}
            retryLabel={t('common.retry')}
            onRetry={() => void refetchAnalytics()}
            height={CHART_HEIGHT}
          >
            <CategoryDonutChart
              data={donutSlices}
              language={i18n.language}
              height={CHART_HEIGHT - 16}
              centerLabel={t('charts.totalCenter')}
              otherLabel={t('charts.otherCategory')}
            />
          </ProfessionalChartCard>
        </Grid>

        {projectBreakdown.length > 0 && (
          <Grid size={{ xs: 12 }}>
            <ProfessionalChartCard
              title={t('dashboard.projectsChartTitle')}
              subtitle={t('dashboard.projectsChartSubtitle')}
              height={
                useHorizontalProjects
                  ? Math.max(260, projectBreakdown.length * 42)
                  : CHART_HEIGHT
              }
            >
              <ComparisonBarChart
                categories={projectBreakdown.map((item) => item.projectName)}
                series={[
                  {
                    id: 'revenue',
                    label: t('analytics.seriesRevenue'),
                    data: projectBreakdown.map((item) => item.revenue),
                  },
                  {
                    id: 'expenses',
                    label: t('analytics.seriesExpenses'),
                    data: projectBreakdown.map((item) => item.expenses),
                  },
                ]}
                language={i18n.language}
                height={
                  useHorizontalProjects
                    ? Math.max(260, projectBreakdown.length * 42)
                    : CHART_HEIGHT
                }
                layout={useHorizontalProjects ? 'horizontal' : 'vertical'}
                onCategoryClick={(index) => {
                  const project = projectBreakdown[index];
                  if (project) {
                    navigate(`/projects/${project.projectId}`);
                  }
                }}
              />
            </ProfessionalChartCard>
          </Grid>
        )}
      </Grid>

      <Card sx={{ overflow: 'hidden' }}>
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
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {t('dashboard.recentProjectsTitle')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('dashboard.recentProjectsSubtitle')}
            </Typography>
          </Box>
          <Button
            component={RouterLink}
            to="/projects"
            variant="text"
            size="small"
            endIcon={
              <ArrowForwardRoundedIcon
                sx={{
                  fontSize: 16,
                  transform: (muiTheme) =>
                    muiTheme.direction === 'rtl' ? 'scaleX(-1)' : 'none',
                }}
              />
            }
          >
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
            <Table size="medium" sx={{ minWidth: { md: 720 }, width: '100%' }}>
              <TableHead>
                <TableRow>
                  <TableCell>{t('projects.name')}</TableCell>
                  <TableCell align="right">{t('dashboard.colRevenue')}</TableCell>
                  <TableCell
                    align="right"
                    sx={{ display: { xs: 'none', sm: 'table-cell' } }}
                  >
                    {t('dashboard.colExpenses')}
                  </TableCell>
                  <TableCell align="right">{t('dashboard.colProfit')}</TableCell>
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                    {t('projects.created')}
                  </TableCell>
                  <TableCell align="right">{t('common.actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentProjects.map((project) => {
                  const finance = financeByProjectId.get(project.id);
                  const profitColor =
                    finance && finance.profit < 0
                      ? 'error.main'
                      : tokens.chart.profit;
                  return (
                    <TableRow
                      key={project.id}
                      hover
                      sx={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/projects/${project.id}`)}
                    >
                      <TableCell>
                        <Typography variant="subtitle2" sx={{ fontWeight: 650 }}>
                          {project.name}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          noWrap
                          sx={{ display: { xs: 'none', sm: 'block' }, maxWidth: 280 }}
                        >
                          {project.description || t('common.none')}
                        </Typography>
                      </TableCell>
                      <TableCell align="right" className="tabular-nums">
                        {finance
                          ? formatMoney(finance.revenue, i18n.language)
                          : t('common.none')}
                      </TableCell>
                      <TableCell
                        align="right"
                        className="tabular-nums"
                        sx={{ display: { xs: 'none', sm: 'table-cell' } }}
                      >
                        {finance
                          ? formatMoney(finance.expenses, i18n.language)
                          : t('common.none')}
                      </TableCell>
                      <TableCell align="right">
                        <Typography
                          variant="body2"
                          className="tabular-nums"
                          sx={{
                            fontWeight: 700,
                            color: finance ? profitColor : 'text.secondary',
                          }}
                        >
                          {finance
                            ? formatMoney(finance.profit, i18n.language)
                            : t('common.none')}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(project.updatedAt, i18n.language)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                        <Tooltip title={t('common.view')}>
                          <IconButton
                            component={RouterLink}
                            to={`/projects/${project.id}`}
                            size="small"
                            aria-label={t('projects.viewAria', {
                              name: project.name,
                            })}
                            sx={{
                              border: '1px solid',
                              borderColor: 'divider',
                            }}
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
