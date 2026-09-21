import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import DocumentScannerRoundedIcon from '@mui/icons-material/DocumentScannerRounded';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
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
import { useEffect, useState, type ReactNode } from 'react';
import { getErrorMessage } from '../../app/api/apiError';
import type {
  Revenue,
  RevenueStatus,
} from '../../app/features/revenue/revenue.types';
import { useGetRevenueQuery } from '../../app/features/revenue/revenueApi';
import { useNotification } from '../../components/feedback/NotificationProvider';
import { formatDate, formatMoney } from '../../i18n/format';
import { useAppTranslation } from '../../i18n/useAppTranslation';
import { ScanDocumentDialog } from '../Expenses/ScanDocumentDialog';
import { DeleteRevenueDialog } from './DeleteRevenueDialog';
import { RevenueFormDialog } from './RevenueFormDialog';

type SummaryCardProps = {
  title: string;
  value: string;
  hint: string;
  icon: ReactNode;
};

function SummaryCard({ title, value, hint, icon }: SummaryCardProps) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Stack
          direction="row"
          spacing={1}
          sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}
        >
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
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
            }}
          >
            {icon}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

function statusChipColor(
  status: RevenueStatus,
): 'success' | 'warning' | 'default' {
  if (status === 'PAID') return 'success';
  if (status === 'PENDING') return 'warning';
  return 'default';
}

type RevenuePanelProps = {
  projectId: number;
  showHeading?: boolean;
  showSummary?: boolean;
};

export function RevenuePanel({
  projectId,
  showHeading = false,
  showSummary = true,
}: RevenuePanelProps) {
  const { t, i18n } = useAppTranslation();
  const { notify } = useNotification();
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error, refetch, isFetching } =
    useGetRevenueQuery({ projectId, page });

  useEffect(() => {
    setPage(1);
  }, [projectId]);

  const [formOpen, setFormOpen] = useState(false);
  const [scanOpen, setScanOpen] = useState(false);
  const [editing, setEditing] = useState<Revenue | null>(null);
  const [deleting, setDeleting] = useState<Revenue | null>(null);

  const entries = data?.data ?? [];
  const total = data?.summary.totalAmount ?? 0;
  const thisMonthTotal = data?.summary.thisMonthAmount ?? 0;
  const totalCount = data?.summary.count ?? 0;
  const hasMore = Boolean(data && data.meta.page < data.meta.totalPages);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(entry: Revenue) {
    setEditing(entry);
    setFormOpen(true);
  }

  function loadMore() {
    if (!hasMore || isFetching) return;
    setPage((current) => current + 1);
  }

  return (
    <Stack spacing={2}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', sm: 'center' },
        }}
      >
        <Box>
          {showHeading && (
            <Typography variant="h6" component="h2">
              {t('revenue.sectionTitle')}
            </Typography>
          )}
          {isFetching && !isLoading && (
            <Typography variant="body2" color="text.secondary">
              {t('projects.updating')}
            </Typography>
          )}
        </Box>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          <Button
            variant="outlined"
            startIcon={<DocumentScannerRoundedIcon />}
            onClick={() => setScanOpen(true)}
          >
            {t('revenue.scanReceipt')}
          </Button>
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={openCreate}
          >
            {t('revenue.createManual')}
          </Button>
        </Stack>
      </Stack>

      {isError && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => void refetch()}>
              {t('common.retry')}
            </Button>
          }
        >
          {getErrorMessage(error, t('revenue.loadError'), {
            preferFallback: true,
          })}
        </Alert>
      )}

      {showSummary && !isLoading && !isError && (
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <SummaryCard
              title={t('revenue.total')}
              value={formatMoney(total, i18n.language)}
              hint={t('revenue.totalHint')}
              icon={<TrendingUpRoundedIcon />}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <SummaryCard
              title={t('revenue.thisMonth')}
              value={formatMoney(thisMonthTotal, i18n.language)}
              hint={t('revenue.thisMonthHint')}
              icon={<CalendarMonthRoundedIcon />}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <SummaryCard
              title={t('revenue.count')}
              value={String(totalCount)}
              hint={t('revenue.countHint')}
              icon={<ReceiptLongRoundedIcon />}
            />
          </Grid>
        </Grid>
      )}

      <Card>
        {isLoading ? (
          <Box sx={{ display: 'grid', placeItems: 'center', py: 8 }}>
            <CircularProgress size={36} />
          </Box>
        ) : entries.length === 0 ? (
          <Box sx={{ py: 8, px: 3, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              {t('revenue.emptyTitle')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {t('revenue.emptyBody')}
            </Typography>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1}
              sx={{ justifyContent: 'center' }}
            >
              <Button
                variant="outlined"
                startIcon={<DocumentScannerRoundedIcon />}
                onClick={() => setScanOpen(true)}
              >
                {t('revenue.scanReceipt')}
              </Button>
              <Button
                variant="contained"
                startIcon={<AddRoundedIcon />}
                onClick={openCreate}
              >
                {t('revenue.createManual')}
              </Button>
            </Stack>
          </Box>
        ) : (
          <>
            <TableContainer sx={{ overflowX: 'auto' }}>
              <Table size="medium" sx={{ minWidth: 720 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>{t('revenue.description')}</TableCell>
                    <TableCell>{t('revenue.customer')}</TableCell>
                    <TableCell>{t('revenue.date')}</TableCell>
                    <TableCell align="right">{t('revenue.amount')}</TableCell>
                    <TableCell>{t('revenue.status')}</TableCell>
                    <TableCell align="right">{t('common.actions')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {entries.map((entry) => (
                    <TableRow key={entry.id} hover>
                      <TableCell>
                        <Typography variant="subtitle2">
                          {entry.description}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {entry.customer || t('common.none')}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(entry.date, i18n.language)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {formatMoney(entry.amount, i18n.language)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={t(`revenue.statuses.${entry.status}`)}
                          color={statusChipColor(entry.status)}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title={t('common.edit')}>
                          <IconButton
                            size="small"
                            onClick={() => openEdit(entry)}
                            aria-label={t('revenue.editAria', {
                              name: entry.description,
                            })}
                          >
                            <EditOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={t('common.delete')}>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => setDeleting(entry)}
                            aria-label={t('revenue.deleteAria', {
                              name: entry.description,
                            })}
                          >
                            <DeleteOutlineRoundedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            {hasMore && (
              <Box sx={{ display: 'grid', placeItems: 'center', py: 2 }}>
                <Button
                  variant="outlined"
                  onClick={loadMore}
                  disabled={isFetching}
                >
                  {isFetching ? t('common.pleaseWait') : t('common.loadMore')}
                </Button>
              </Box>
            )}
          </>
        )}
      </Card>

      <RevenueFormDialog
        key={`${formOpen}-${editing?.id ?? 'create'}`}
        open={formOpen}
        projectId={projectId}
        revenue={editing}
        onClose={() => setFormOpen(false)}
        onSuccess={(message) => {
          setPage(1);
          notify({ message, severity: 'success' });
        }}
      />
      <ScanDocumentDialog
        key={`scan-revenue-${scanOpen}`}
        open={scanOpen}
        projectId={projectId}
        defaultType="INCOME"
        onClose={() => setScanOpen(false)}
        onSuccess={(message) => {
          setPage(1);
          notify({ message, severity: 'success' });
        }}
      />
      <DeleteRevenueDialog
        open={Boolean(deleting)}
        projectId={projectId}
        revenue={deleting}
        onClose={() => setDeleting(null)}
        onSuccess={(message) => {
          setPage(1);
          notify({ message, severity: 'success' });
        }}
      />
    </Stack>
  );
}
