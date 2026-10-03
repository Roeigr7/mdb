import AccountBalanceRoundedIcon from '@mui/icons-material/AccountBalanceRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useMemo, useState } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import { getErrorMessage } from '../../app/api/apiError';
import { useGetAnalyticsQuery } from '../../app/features/analytics/analyticsApi';
import { useGetProjectByIdQuery } from '../../app/features/projects/projectsApi';
import {
  CashflowAreaChart,
  CashflowLegendFooter,
  ProfessionalChartCard,
  sliceLastMonths,
  type CashflowRange,
} from '../../components/charts';
import { useNotification } from '../../components/feedback/NotificationProvider';
import { StatCard } from '../../components/ui/StatCard';
import { formatDateTime, formatMoney } from '../../i18n/format';
import { useAppTranslation } from '../../i18n/useAppTranslation';
import { ExpensesPanel } from '../Expenses/ExpensesPanel';
import { MaterialsPanel } from '../Materials/MaterialsPanel';
import { ProjectFormDialog } from '../Projects/ProjectFormDialog';
import { RevenuePanel } from '../Revenue/RevenuePanel';

const CHART_HEIGHT = 300;

export function ProjectDetailsPage() {
  const { t, i18n } = useAppTranslation();
  const { id } = useParams();
  const projectId = Number(id);
  const validId = Number.isInteger(projectId) && projectId > 0;

  const { notify } = useNotification();
  const [editOpen, setEditOpen] = useState(false);
  const [cashflowRange, setCashflowRange] = useState<CashflowRange>(12);

  const {
    data: project,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetProjectByIdQuery(projectId, { skip: !validId });

  const {
    data: analytics,
    isLoading: analyticsLoading,
    isError: analyticsError,
    refetch: refetchAnalytics,
  } = useGetAnalyticsQuery({ projectId }, { skip: !validId });

  const cashflowData = useMemo(
    () => sliceLastMonths(analytics?.monthlyCashflow ?? [], cashflowRange),
    [analytics?.monthlyCashflow, cashflowRange],
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

  const hasCashflow = cashflowData.some(
    (point) => point.revenue > 0 || point.expenses > 0,
  );

  const cashflowRanges = [
    { value: 3 as const, label: t('charts.range3m') },
    { value: 6 as const, label: t('charts.range6m') },
    { value: 12 as const, label: t('charts.range12m') },
  ];

  if (!validId) {
    return (
      <Alert severity="error">
        {t('projectDetails.invalidId')}{' '}
        <Button component={RouterLink} to="/projects" size="small">
          {t('projectDetails.backToProjects')}
        </Button>
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <Stack spacing={3}>
        <Skeleton variant="rounded" height={72} />
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          {[0, 1, 2, 3].map((key) => (
            <Skeleton key={key} variant="rounded" height={110} sx={{ flex: 1 }} />
          ))}
        </Stack>
        <Skeleton variant="rounded" height={320} />
      </Stack>
    );
  }

  if (isError || !project) {
    return (
      <Alert
        severity="error"
        action={
          <Button color="inherit" size="small" onClick={() => void refetch()}>
            {t('common.retry')}
          </Button>
        }
      >
        {getErrorMessage(error, t('projectDetails.loadError'))}
      </Alert>
    );
  }

  const summary = analytics?.summary;

  return (
    <Stack spacing={3}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', sm: 'flex-start' },
        }}
      >
        <Box>
          <Button
            component={RouterLink}
            to="/projects"
            startIcon={
              <ArrowBackRoundedIcon
                sx={(muiTheme) => ({
                  transform:
                    muiTheme.direction === 'rtl' ? 'scaleX(-1)' : 'none',
                })}
              />
            }
            sx={{ mb: 1, marginInlineStart: -1 }}
          >
            {t('projectDetails.back')}
          </Button>
          <Typography variant="h4" component="h1" gutterBottom>
            {project.name}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {project.description || t('projectDetails.noDescription')}
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<EditOutlinedIcon />}
          onClick={() => setEditOpen(true)}
        >
          {t('projectDetails.edit')}
        </Button>
      </Stack>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          {analyticsLoading ? (
            <Skeleton variant="rounded" height={120} sx={{ borderRadius: 3 }} />
          ) : (
            <StatCard
              title={t('dashboard.totalRevenue')}
              value={formatMoney(summary?.totalRevenue ?? 0, i18n.language)}
              icon={<TrendingUpRoundedIcon />}
              tone="revenue"
            />
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          {analyticsLoading ? (
            <Skeleton variant="rounded" height={120} sx={{ borderRadius: 3 }} />
          ) : (
            <StatCard
              title={t('dashboard.totalExpenses')}
              value={formatMoney(summary?.totalExpenses ?? 0, i18n.language)}
              icon={<PaymentsRoundedIcon />}
              tone="expenses"
            />
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          {analyticsLoading ? (
            <Skeleton variant="rounded" height={120} sx={{ borderRadius: 3 }} />
          ) : (
            <StatCard
              title={t('dashboard.netProfit')}
              value={formatMoney(summary?.netProfit ?? 0, i18n.language)}
              icon={<AccountBalanceRoundedIcon />}
              tone="profit"
            />
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          {analyticsLoading ? (
            <Skeleton variant="rounded" height={120} sx={{ borderRadius: 3 }} />
          ) : (
            <StatCard
              title={t('dashboard.materialsCost')}
              value={formatMoney(
                summary?.totalMaterialsCost ?? 0,
                i18n.language,
              )}
              icon={<Inventory2RoundedIcon />}
              tone="neutral"
            />
          )}
        </Grid>
      </Grid>

      <ProfessionalChartCard
        title={t('dashboard.cashflowTitle')}
        subtitle={t('dashboard.cashflowSubtitle')}
        kpiValue={
          analyticsLoading
            ? undefined
            : formatMoney(rangeRevenueTotal, i18n.language)
        }
        ranges={cashflowRanges}
        activeRange={cashflowRange}
        onRangeChange={setCashflowRange}
        loading={analyticsLoading}
        empty={!analyticsLoading && !hasCashflow}
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

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {t('projectDetails.details')}
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" color="text.secondary">
                {t('projectDetails.created')}
              </Typography>
              <Typography variant="body1">
                {formatDateTime(project.createdAt, i18n.language)}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" color="text.secondary">
                {t('projectDetails.updated')}
              </Typography>
              <Typography variant="body1">
                {formatDateTime(project.updatedAt, i18n.language)}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <MaterialsPanel projectId={project.id} showHeading />
      <ExpensesPanel projectId={project.id} showHeading showSummary={false} />
      <RevenuePanel projectId={project.id} showHeading showSummary={false} />

      <ProjectFormDialog
        key={`${editOpen}-${project.id}`}
        open={editOpen}
        project={project}
        onClose={() => setEditOpen(false)}
        onSuccess={(message) => notify({ message, severity: 'success' })}
      />
    </Stack>
  );
}
