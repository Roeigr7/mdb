import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import DocumentScannerRoundedIcon from '@mui/icons-material/DocumentScannerRounded';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
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
import { useEffect, useState } from 'react';
import { getErrorMessage } from '../../app/api/apiError';
import type { Expense } from '../../app/features/expenses/expenses.types';
import { useGetExpensesQuery } from '../../app/features/expenses/expensesApi';
import { useNotification } from '../../components/feedback/NotificationProvider';
import { StatCard } from '../../components/ui/StatCard';
import { formatDate, formatMoney } from '../../i18n/format';
import { useAppTranslation } from '../../i18n/useAppTranslation';
import { DeleteExpenseDialog } from './DeleteExpenseDialog';
import { ExpenseFormDialog } from './ExpenseFormDialog';
import { ScanDocumentDialog } from './ScanDocumentDialog';

type ExpensesPanelProps = {
  projectId: number;
  showHeading?: boolean;
  showSummary?: boolean;
};

export function ExpensesPanel({
  projectId,
  showHeading = false,
  showSummary = true,
}: ExpensesPanelProps) {
  const { t, i18n } = useAppTranslation();
  const { notify } = useNotification();
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error, refetch, isFetching } =
    useGetExpensesQuery({ projectId, page });

  useEffect(() => {
    setPage(1);
  }, [projectId]);

  const [formOpen, setFormOpen] = useState(false);
  const [scanOpen, setScanOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [deleting, setDeleting] = useState<Expense | null>(null);

  const expenses = data?.data ?? [];
  const total = data?.summary.totalAmount ?? 0;
  const thisMonthTotal = data?.summary.thisMonthAmount ?? 0;
  const totalCount = data?.summary.count ?? 0;
  const hasMore = Boolean(
    data && data.meta.page < data.meta.totalPages,
  );

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(expense: Expense) {
    setEditing(expense);
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
              {t('expenses.sectionTitle')}
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
            {t('expenses.scanReceipt')}
          </Button>
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={openCreate}
          >
            {t('expenses.createManual')}
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
          {getErrorMessage(error, t('expenses.loadError'), {
            preferFallback: true,
          })}
        </Alert>
      )}

      {showSummary && !isLoading && !isError && (
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <StatCard
              title={t('expenses.total')}
              value={formatMoney(total, i18n.language)}
              hint={t('expenses.totalHint')}
              icon={<PaymentsRoundedIcon />}
              tone="expenses"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <StatCard
              title={t('expenses.thisMonth')}
              value={formatMoney(thisMonthTotal, i18n.language)}
              hint={t('expenses.thisMonthHint')}
              icon={<CalendarMonthRoundedIcon />}
              tone="default"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <StatCard
              title={t('expenses.count')}
              value={String(totalCount)}
              hint={t('expenses.countHint')}
              icon={<ReceiptLongRoundedIcon />}
              tone="neutral"
            />
          </Grid>
        </Grid>
      )}

      <Card>
        {isLoading ? (
          <Box sx={{ display: 'grid', placeItems: 'center', py: 8 }}>
            <CircularProgress size={36} />
          </Box>
        ) : expenses.length === 0 ? (
          <Box sx={{ py: 8, px: 3, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              {t('expenses.emptyTitle')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {t('expenses.emptyBody')}
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
                {t('expenses.scanReceipt')}
              </Button>
              <Button
                variant="contained"
                startIcon={<AddRoundedIcon />}
                onClick={openCreate}
              >
                {t('expenses.createManual')}
              </Button>
            </Stack>
          </Box>
        ) : (
          <>
            <TableContainer sx={{ overflowX: 'auto' }}>
              <Table size="medium" sx={{ minWidth: { md: 640 }, width: '100%' }}>
                <TableHead>
                  <TableRow>
                    <TableCell>{t('expenses.description')}</TableCell>
                    <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                      {t('expenses.category')}
                    </TableCell>
                    <TableCell>{t('expenses.date')}</TableCell>
                    <TableCell align="right">{t('expenses.amount')}</TableCell>
                    <TableCell align="right">{t('common.actions')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {expenses.map((expense) => (
                    <TableRow key={expense.id} hover>
                      <TableCell>
                        <Typography variant="subtitle2">
                          {expense.description}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                        <Typography variant="body2" color="text.secondary">
                          {expense.category || t('common.none')}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(expense.date, i18n.language)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {formatMoney(expense.amount, i18n.language)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title={t('common.edit')}>
                          <IconButton
                            size="small"
                            onClick={() => openEdit(expense)}
                            aria-label={t('expenses.editAria', {
                              name: expense.description,
                            })}
                          >
                            <EditOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={t('common.delete')}>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => setDeleting(expense)}
                            aria-label={t('expenses.deleteAria', {
                              name: expense.description,
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

      <ExpenseFormDialog
        key={`${formOpen}-${editing?.id ?? 'create'}`}
        open={formOpen}
        projectId={projectId}
        expense={editing}
        onClose={() => setFormOpen(false)}
        onSuccess={(message) => {
          setPage(1);
          notify({ message, severity: 'success' });
        }}
      />
      <ScanDocumentDialog
        key={`scan-${scanOpen}`}
        open={scanOpen}
        projectId={projectId}
        defaultType="EXPENSE"
        onClose={() => setScanOpen(false)}
        onSuccess={(message) => {
          setPage(1);
          notify({ message, severity: 'success' });
        }}
      />
      <DeleteExpenseDialog
        open={Boolean(deleting)}
        projectId={projectId}
        expense={deleting}
        onClose={() => setDeleting(null)}
        onSuccess={(message) => {
          setPage(1);
          notify({ message, severity: 'success' });
        }}
      />
    </Stack>
  );
}
