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
import { useMemo, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { getErrorMessage } from '../../app/api/apiError';
import { useGetAnalyticsQuery } from '../../app/features/analytics/analyticsApi';
import { useGetProjectsQuery } from '../../app/features/projects/projectsApi';
import {
  AnalyticsDataTable,
  CHART_COLORS,
  ComparisonBarChart,
  DynamicBreakdownCard,
  DynamicCashflowCard,
  DynamicProjectsCard,
  MarginGauge,
  ProfessionalChartCard,
  StackedCashflowChart,
  sliceLastMonths,
  type CashflowRange,
} from '../../components/charts';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatCard } from '../../components/ui/StatCard';
import { formatMoney, formatMonthKey } from '../../i18n/format';
import { useAppTranslation } from '../../i18n/useAppTranslation';

const CHART_HEIGHT = 300;
const ALL_PROJECTS = 'all';

export function AnalyticsPage() {
  const { t, i18n } = useAppTranslation();
  const navigate = useNavigate();
  const [cashflowRange, setCashflowRange] = useState<CashflowRange>(12);

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

  const cashflowData = useMemo(
    () => sliceLastMonths(data?.monthlyCashflow ?? [], cashflowRange),
    [cashflowRange, data?.monthlyCashflow],
  );

  const monthLabels = useMemo(
    () => cashflowData.map((point) => formatMonthKey(point.month, i18n.language)),
    [cashflowData, i18n.language],
  );

  const expenseSeries = useMemo(
    () => cashflowData.map((point) => point.expenses),
    [cashflowData],
  );
  const revenueSeries = useMemo(
    () => cashflowData.map((point) => point.revenue),
    [cashflowData],
  );

  const categoryDonut = useMemo(
    () =>
      (data?.expensesByCategory ?? []).map((item) => ({
        id: item.label,
        value: item.amount,
        label:
          item.label === 'Uncategorized'
            ? t('analytics.uncategorized')
            : item.label,
      })),
    [data?.expensesByCategory, t],
  );

  const statusDonut = useMemo(
    () =>
      (data?.revenueByStatus ?? []).map((item) => {
        const status = item.label;
        const label =
          status === 'PAID' || status === 'PENDING' || status === 'CANCELLED'
            ? t(`revenue.statuses.${status}`)
            : status;
        return {
          id: status,
          value: item.amount,
          label,
        };
      }),
    [data?.revenueByStatus, t],
  );

  const materialsBreakdown = useMemo(
    () =>
      (data?.topMaterials ?? []).map((item) => ({
        id: item.label,
        label: item.label,
        value: item.amount,
      })),
    [data?.topMaterials],
  );

  const projectBreakdown = data?.projectBreakdown ?? [];
  const showProjectExplorer =
    selected === ALL_PROJECTS && projectBreakdown.length > 0;

  const hasCashflow =
    expenseSeries.some((value) => value > 0) ||
    revenueSeries.some((value) => value > 0);

  const cashflowRanges = [
    { value: 3 as const, label: t('charts.range3m') },
    { value: 6 as const, label: t('charts.range6m') },
    { value: 12 as const, label: t('charts.range12m') },
  ];

  const monthlyRows = useMemo(
    () =>
      [...(data?.monthlyCashflow ?? [])]
        .slice()
        .reverse()
        .map((point) => ({
          month: point.month,
          revenue: point.revenue,
          expenses: point.expenses,
          profit: point.revenue - point.expenses,
        })),
    [data?.monthlyCashflow],
  );

  const projectRows = useMemo(
    () =>
      [...projectBreakdown]
        .map((item) => ({
          ...item,
          profit: item.revenue - item.expenses,
          margin:
            item.revenue > 0
              ? ((item.revenue - item.expenses) / item.revenue) * 100
              : 0,
        }))
        .sort((a, b) => b.revenue - a.revenue),
    [projectBreakdown],
  );

  const categoryTotal = useMemo(
    () => categoryDonut.reduce((sum, item) => sum + item.value, 0),
    [categoryDonut],
  );

  const materialsTotal = useMemo(
    () => materialsBreakdown.reduce((sum, item) => sum + item.value, 0),
    [materialsBreakdown],
  );

  if (projectsLoading) {
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', py: 10 }}>
        <CircularProgress size={36} />
      </Box>
    );
  }

  return (
    <Stack spacing={3}>
      <PageHeader
        title={t('analytics.title')}
        subtitle={t('analytics.subtitle')}
        hideTitle
        actions={
          <FormControl sx={{ minWidth: { xs: '100%', md: 260 } }} size="small">
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
        }
      />

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

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <StatCard
                title={t('analytics.kpiRevenue')}
                value={formatMoney(data.summary.totalRevenue, i18n.language)}
                hint={t('analytics.kpiRevenueHint', {
                  count: data.summary.revenueCount,
                })}
                icon={<TrendingUpRoundedIcon />}
                tone="revenue"
                sparkline={revenueSeries}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <StatCard
                title={t('analytics.kpiExpenses')}
                value={formatMoney(data.summary.totalExpenses, i18n.language)}
                hint={t('analytics.kpiExpensesHint', {
                  count: data.summary.expenseCount,
                })}
                icon={<PaymentsRoundedIcon />}
                tone="expenses"
                sparkline={expenseSeries}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <StatCard
                title={t('analytics.kpiNet')}
                value={formatMoney(data.summary.netProfit, i18n.language)}
                hint={t('analytics.kpiNetHint')}
                icon={<AccountBalanceRoundedIcon />}
                tone="profit"
                sparkline={cashflowData.map(
                  (point) => point.revenue - point.expenses,
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <StatCard
                title={t('analytics.kpiMaterials')}
                value={formatMoney(
                  data.summary.totalMaterialsCost,
                  i18n.language,
                )}
                hint={t('analytics.kpiMaterialsHint', {
                  count: data.summary.materialsCount,
                })}
                icon={<Inventory2RoundedIcon />}
                tone="neutral"
              />
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <DynamicCashflowCard
                data={data.monthlyCashflow ?? []}
                language={i18n.language}
                title={t('analytics.dynamicTitle')}
                subtitle={t('analytics.dynamicSubtitle')}
                revenueLabel={t('analytics.seriesRevenue')}
                expensesLabel={t('analytics.seriesExpenses')}
                profitLabel={t('charts.profitSeries')}
                viewLabel={t('charts.viewMode')}
                periodLabel={t('charts.period')}
                showProfitLabel={t('charts.showProfit')}
                overviewLabel={t('charts.viewOverview')}
                revenueOnlyLabel={t('charts.viewRevenue')}
                expensesOnlyLabel={t('charts.viewExpenses')}
                netOnlyLabel={t('charts.viewNet')}
                emptyLabel={t('analytics.emptyChart')}
                rangeLabels={cashflowRanges}
                height={CHART_HEIGHT + 24}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <ProfessionalChartCard
                title={t('analytics.marginTitle')}
                subtitle={t('analytics.marginHint')}
                height={CHART_HEIGHT}
                empty={data.summary.totalRevenue <= 0}
                emptyLabel={t('analytics.emptyChart')}
              >
                <MarginGauge
                  revenue={data.summary.totalRevenue}
                  expenses={data.summary.totalExpenses}
                  label={t('analytics.marginTitle')}
                  hint={t('analytics.marginHint')}
                  height={CHART_HEIGHT - 40}
                />
              </ProfessionalChartCard>
            </Grid>

            <Grid size={{ xs: 12, md: 8 }}>
              <ProfessionalChartCard
                title={t('analytics.stackedTitle')}
                subtitle={t('analytics.stackedSubtitle')}
                ranges={cashflowRanges}
                activeRange={cashflowRange}
                onRangeChange={setCashflowRange}
                empty={!hasCashflow}
                emptyLabel={t('analytics.emptyChart')}
                height={CHART_HEIGHT}
              >
                <StackedCashflowChart
                  categories={monthLabels}
                  revenue={revenueSeries}
                  expenses={expenseSeries}
                  revenueLabel={t('analytics.seriesRevenue')}
                  expensesLabel={t('analytics.seriesExpenses')}
                  language={i18n.language}
                  height={CHART_HEIGHT}
                />
              </ProfessionalChartCard>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <DynamicBreakdownCard
                title={t('analytics.dynamicBreakdownTitle')}
                subtitle={t('analytics.dynamicBreakdownSubtitle')}
                data={categoryDonut}
                language={i18n.language}
                chartTypeLabel={t('charts.chartType')}
                sortLabel={t('charts.sortBy')}
                donutLabel={t('charts.typeDonut')}
                barsLabel={t('charts.typeBars')}
                sortHighLabel={t('charts.sortHigh')}
                sortLowLabel={t('charts.sortLow')}
                emptyLabel={t('analytics.emptyChart')}
                centerLabel={t('charts.totalCenter')}
                otherLabel={t('charts.otherCategory')}
                seriesLabel={t('analytics.seriesExpenses')}
                height={CHART_HEIGHT}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <DynamicBreakdownCard
                title={t('analytics.materialsTitle')}
                subtitle={t('analytics.materialsSubtitle')}
                data={materialsBreakdown}
                language={i18n.language}
                chartTypeLabel={t('charts.chartType')}
                sortLabel={t('charts.sortBy')}
                donutLabel={t('charts.typeDonut')}
                barsLabel={t('charts.typeBars')}
                sortHighLabel={t('charts.sortHigh')}
                sortLowLabel={t('charts.sortLow')}
                emptyLabel={t('analytics.emptyChart')}
                centerLabel={t('charts.totalCenter')}
                otherLabel={t('charts.otherCategory')}
                seriesLabel={t('analytics.seriesMaterials')}
                height={CHART_HEIGHT}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <ProfessionalChartCard
                title={t('analytics.monthlyCompareTitle')}
                subtitle={t('analytics.monthlyCompareSubtitle')}
                ranges={cashflowRanges}
                activeRange={cashflowRange}
                onRangeChange={setCashflowRange}
                empty={!hasCashflow}
                emptyLabel={t('analytics.emptyChart')}
                height={CHART_HEIGHT}
              >
                <ComparisonBarChart
                  categories={monthLabels}
                  series={[
                    {
                      id: 'revenue',
                      label: t('analytics.seriesRevenue'),
                      data: revenueSeries,
                    },
                    {
                      id: 'expenses',
                      label: t('analytics.seriesExpenses'),
                      data: expenseSeries,
                    },
                  ]}
                  language={i18n.language}
                  height={CHART_HEIGHT}
                />
              </ProfessionalChartCard>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <ProfessionalChartCard
                title={t('analytics.revenueStatusTitle')}
                subtitle={t('analytics.revenueStatusSubtitle')}
                empty={statusDonut.length === 0}
                emptyLabel={t('analytics.emptyChart')}
                height={CHART_HEIGHT}
              >
                <ComparisonBarChart
                  categories={statusDonut.map((item) => item.label)}
                  series={[
                    {
                      id: 'status',
                      label: t('analytics.seriesRevenue'),
                      data: statusDonut.map((item) => item.value),
                      color: CHART_COLORS.profit,
                    },
                  ]}
                  language={i18n.language}
                  height={CHART_HEIGHT}
                />
              </ProfessionalChartCard>
            </Grid>

            {showProjectExplorer && (
              <Grid size={{ xs: 12 }}>
                <DynamicProjectsCard
                  title={t('analytics.projectsTitle')}
                  subtitle={t('analytics.projectsSubtitle')}
                  data={projectBreakdown}
                  language={i18n.language}
                  metricLabel={t('charts.metric')}
                  chartTypeLabel={t('charts.chartType')}
                  revenueLabel={t('analytics.seriesRevenue')}
                  expensesLabel={t('analytics.seriesExpenses')}
                  profitLabel={t('charts.profitSeries')}
                  materialsLabel={t('analytics.seriesMaterials')}
                  barsLabel={t('charts.typeBars')}
                  radarLabel={t('charts.typeRadar')}
                  scatterLabel={t('charts.typeScatter')}
                  emptyLabel={t('analytics.emptyChart')}
                  height={CHART_HEIGHT + 20}
                  onProjectClick={(id) => navigate(`/projects/${id}`)}
                />
              </Grid>
            )}
          </Grid>

          <Box sx={{ pt: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
              {t('analytics.tablesSectionTitle')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.35, mb: 2 }}>
              {t('analytics.tablesSectionSubtitle')}
            </Typography>
          </Box>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, lg: 6 }}>
              <AnalyticsDataTable
                title={t('analytics.tableMonthlyTitle')}
                subtitle={t('analytics.tableMonthlySubtitle')}
                emptyLabel={t('analytics.emptyChart')}
                rows={monthlyRows}
                getRowKey={(row) => row.month}
                columns={[
                  {
                    id: 'month',
                    label: t('analytics.colMonth'),
                    render: (row) => (
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {formatMonthKey(row.month, i18n.language)}
                      </Typography>
                    ),
                  },
                  {
                    id: 'revenue',
                    label: t('analytics.colRevenue'),
                    align: 'right',
                    render: (row) => (
                      <Typography
                        variant="body2"
                        className="tabular-nums"
                        sx={{ color: CHART_COLORS.revenue, fontWeight: 600 }}
                      >
                        {formatMoney(row.revenue, i18n.language)}
                      </Typography>
                    ),
                  },
                  {
                    id: 'expenses',
                    label: t('analytics.colExpenses'),
                    align: 'right',
                    render: (row) => (
                      <Typography
                        variant="body2"
                        className="tabular-nums"
                        sx={{ color: CHART_COLORS.expenses, fontWeight: 600 }}
                      >
                        {formatMoney(row.expenses, i18n.language)}
                      </Typography>
                    ),
                  },
                  {
                    id: 'profit',
                    label: t('analytics.colProfit'),
                    align: 'right',
                    render: (row) => (
                      <Typography
                        variant="body2"
                        className="tabular-nums"
                        sx={{
                          color:
                            row.profit >= 0
                              ? CHART_COLORS.profit
                              : CHART_COLORS.expenses,
                          fontWeight: 700,
                        }}
                      >
                        {formatMoney(row.profit, i18n.language)}
                      </Typography>
                    ),
                  },
                ]}
              />
            </Grid>

            <Grid size={{ xs: 12, lg: 6 }}>
              <AnalyticsDataTable
                title={t('analytics.tableProjectsTitle')}
                subtitle={t('analytics.tableProjectsSubtitle')}
                emptyLabel={t('analytics.emptyChart')}
                rows={projectRows}
                getRowKey={(row) => row.projectId}
                onRowClick={(row) => navigate(`/projects/${row.projectId}`)}
                columns={[
                  {
                    id: 'project',
                    label: t('analytics.colProject'),
                    render: (row) => (
                      <Typography variant="body2" sx={{ fontWeight: 650 }}>
                        {row.projectName}
                      </Typography>
                    ),
                  },
                  {
                    id: 'revenue',
                    label: t('analytics.colRevenue'),
                    align: 'right',
                    render: (row) => (
                      <span className="tabular-nums">
                        {formatMoney(row.revenue, i18n.language)}
                      </span>
                    ),
                  },
                  {
                    id: 'expenses',
                    label: t('analytics.colExpenses'),
                    align: 'right',
                    render: (row) => (
                      <span className="tabular-nums">
                        {formatMoney(row.expenses, i18n.language)}
                      </span>
                    ),
                  },
                  {
                    id: 'profit',
                    label: t('analytics.colProfit'),
                    align: 'right',
                    render: (row) => (
                      <Typography
                        variant="body2"
                        className="tabular-nums"
                        sx={{
                          fontWeight: 700,
                          color:
                            row.profit >= 0
                              ? CHART_COLORS.profit
                              : CHART_COLORS.expenses,
                        }}
                      >
                        {formatMoney(row.profit, i18n.language)}
                      </Typography>
                    ),
                  },
                  {
                    id: 'margin',
                    label: t('analytics.colMargin'),
                    align: 'right',
                    render: (row) => (
                      <Typography
                        variant="body2"
                        className="tabular-nums"
                        color="text.secondary"
                        sx={{ fontWeight: 600 }}
                      >
                        {row.margin.toFixed(0)}%
                      </Typography>
                    ),
                  },
                ]}
              />
            </Grid>

            <Grid size={{ xs: 12, lg: 6 }}>
              <AnalyticsDataTable
                title={t('analytics.tableCategoriesTitle')}
                subtitle={t('analytics.tableCategoriesSubtitle')}
                emptyLabel={t('analytics.emptyChart')}
                rows={[...categoryDonut].sort((a, b) => b.value - a.value)}
                getRowKey={(row) => row.id}
                columns={[
                  {
                    id: 'category',
                    label: t('analytics.colCategory'),
                    render: (row) => (
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {row.label}
                      </Typography>
                    ),
                  },
                  {
                    id: 'amount',
                    label: t('analytics.colAmount'),
                    align: 'right',
                    render: (row) => (
                      <span className="tabular-nums">
                        {formatMoney(row.value, i18n.language)}
                      </span>
                    ),
                  },
                  {
                    id: 'share',
                    label: t('analytics.colShare'),
                    align: 'right',
                    render: (row) => (
                      <Typography
                        variant="body2"
                        className="tabular-nums"
                        color="text.secondary"
                        sx={{ fontWeight: 600 }}
                      >
                        {categoryTotal > 0
                          ? `${((row.value / categoryTotal) * 100).toFixed(0)}%`
                          : '—'}
                      </Typography>
                    ),
                  },
                ]}
              />
            </Grid>

            <Grid size={{ xs: 12, lg: 6 }}>
              <AnalyticsDataTable
                title={t('analytics.tableMaterialsTitle')}
                subtitle={t('analytics.tableMaterialsSubtitle')}
                emptyLabel={t('analytics.emptyChart')}
                rows={[...materialsBreakdown].sort((a, b) => b.value - a.value)}
                getRowKey={(row) => row.id}
                columns={[
                  {
                    id: 'material',
                    label: t('analytics.colMaterial'),
                    render: (row) => (
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {row.label}
                      </Typography>
                    ),
                  },
                  {
                    id: 'amount',
                    label: t('analytics.colAmount'),
                    align: 'right',
                    render: (row) => (
                      <span className="tabular-nums">
                        {formatMoney(row.value, i18n.language)}
                      </span>
                    ),
                  },
                  {
                    id: 'share',
                    label: t('analytics.colShare'),
                    align: 'right',
                    render: (row) => (
                      <Typography
                        variant="body2"
                        className="tabular-nums"
                        color="text.secondary"
                        sx={{ fontWeight: 600 }}
                      >
                        {materialsTotal > 0
                          ? `${((row.value / materialsTotal) * 100).toFixed(0)}%`
                          : '—'}
                      </Typography>
                    ),
                  },
                ]}
              />
            </Grid>
          </Grid>
        </>
      )}
    </Stack>
  );
}
