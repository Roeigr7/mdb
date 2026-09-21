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
import { useTheme } from '@mui/material/styles';
import { LineChart } from '@mui/x-charts/LineChart';
import { useMemo, useState } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import { getErrorMessage } from '../../app/api/apiError';
import { useGetAnalyticsQuery } from '../../app/features/analytics/analyticsApi';
import { useGetProjectByIdQuery } from '../../app/features/projects/projectsApi';
import { useNotification } from '../../components/feedback/NotificationProvider';
import { ChartCard } from '../../components/ui/ChartCard';
import { StatCard } from '../../components/ui/StatCard';
import { formatDateTime, formatMoney } from '../../i18n/format';
import { useAppTranslation } from '../../i18n/useAppTranslation';
import { ExpensesPanel } from '../Expenses/ExpensesPanel';
import { MaterialsPanel } from '../Materials/MaterialsPanel';
import { ProjectFormDialog } from '../Projects/ProjectFormDialog';
import { RevenuePanel } from '../Revenue/RevenuePanel';

function formatMonthLabel(month: string, locale: string) {
  const [year, monthPart] = month.split('-').map(Number);
  const date = new Date(year, monthPart - 1, 1);
  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    year: '2-digit',
  }).format(date);
}

export function ProjectDetailsPage() {
  const { t, i18n } = useAppTranslation();
  const theme = useTheme();
  const { id } = useParams();
  const projectId = Number(id);
  const validId = Number.isInteger(projectId) && projectId > 0;

  const { notify } = useNotification();
  const [editOpen, setEditOpen] = useState(false);

  const {
    data: project,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetProjectByIdQuery(projectId, { skip: !validId });

  const { data: analytics, isLoading: analyticsLoading } = useGetAnalyticsQuery(
    { projectId },
    { skip: !validId },
  );

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
  const hasCashflow =
    expenseSeries.some((value) => value > 0) ||
    revenueSeries.some((value) => value > 0);

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

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          {analyticsLoading ? (
            <Skeleton variant="rounded" height={110} />
          ) : (
            <StatCard
              title={t('dashboard.totalRevenue')}
              value={formatMoney(summary?.totalRevenue ?? 0, i18n.language)}
              icon={<TrendingUpRoundedIcon />}
              accent={theme.palette.success.main}
            />
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          {analyticsLoading ? (
            <Skeleton variant="rounded" height={110} />
          ) : (
            <StatCard
              title={t('dashboard.totalExpenses')}
              value={formatMoney(summary?.totalExpenses ?? 0, i18n.language)}
              icon={<PaymentsRoundedIcon />}
              accent={theme.palette.error.main}
            />
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          {analyticsLoading ? (
            <Skeleton variant="rounded" height={110} />
          ) : (
            <StatCard
              title={t('dashboard.netProfit')}
              value={formatMoney(summary?.netProfit ?? 0, i18n.language)}
              icon={<AccountBalanceRoundedIcon />}
              accent={
                (summary?.netProfit ?? 0) >= 0
                  ? theme.palette.success.main
                  : theme.palette.error.main
              }
            />
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          {analyticsLoading ? (
            <Skeleton variant="rounded" height={110} />
          ) : (
            <StatCard
              title={t('dashboard.materialsCost')}
              value={formatMoney(
                summary?.totalMaterialsCost ?? 0,
                i18n.language,
              )}
              icon={<Inventory2RoundedIcon />}
            />
          )}
        </Grid>
      </Grid>

      <ChartCard
        title={t('dashboard.cashflowTitle')}
        subtitle={t('dashboard.cashflowSubtitle')}
        empty={!analyticsLoading && !hasCashflow}
        emptyLabel={t('analytics.emptyChart')}
      >
        {analyticsLoading ? (
          <Skeleton variant="rounded" height={300} />
        ) : (
          <LineChart
            height={300}
            series={[
              {
                data: revenueSeries,
                label: t('analytics.seriesRevenue'),
                color: theme.palette.success.main,
                area: true,
                showMark: false,
                valueFormatter: (value) =>
                  formatMoney(value ?? 0, i18n.language),
              },
              {
                data: expenseSeries,
                label: t('analytics.seriesExpenses'),
                color: theme.palette.error.main,
                area: true,
                showMark: false,
                valueFormatter: (value) =>
                  formatMoney(value ?? 0, i18n.language),
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
        )}
      </ChartCard>

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
