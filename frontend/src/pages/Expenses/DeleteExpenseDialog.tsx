import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { useState } from 'react';
import { getErrorMessage } from '../../app/api/apiError';
import type { Expense } from '../../app/features/expenses/expenses.types';
import { useDeleteExpenseMutation } from '../../app/features/expenses/expensesApi';
import { useAppTranslation } from '../../i18n/useAppTranslation';

type DeleteExpenseDialogProps = {
  open: boolean;
  projectId: number;
  expense: Expense | null;
  onClose: () => void;
  onSuccess: (message: string) => void;
};

export function DeleteExpenseDialog({
  open,
  projectId,
  expense,
  onClose,
  onSuccess,
}: DeleteExpenseDialogProps) {
  const { t } = useAppTranslation();
  const [deleteExpense, { isLoading }] = useDeleteExpenseMutation();
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    if (!expense) return;
    setError(null);
    try {
      await deleteExpense({ projectId, expenseId: expense.id }).unwrap();
      onSuccess(t('expenses.deletedToast'));
      onClose();
    } catch (err) {
      setError(
        getErrorMessage(err, t('expenses.deleteFailed'), {
          preferFallback: true,
        }),
      );
    }
  }

  function handleClose() {
    if (isLoading) return;
    setError(null);
    onClose();
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>{t('expenses.deleteTitle')}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {expense
            ? t('expenses.deleteBody', { name: expense.description })
            : t('expenses.deleteBodyGeneric')}
        </DialogContentText>
        {error && (
          <Alert severity="error" sx={{ mt: 2 }} role="alert">
            {error}
          </Alert>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={isLoading}>
          {t('common.cancel')}
        </Button>
        <Button
          color="error"
          variant="contained"
          onClick={() => void handleConfirm()}
          disabled={isLoading}
        >
          {isLoading ? t('common.deleting') : t('common.delete')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
