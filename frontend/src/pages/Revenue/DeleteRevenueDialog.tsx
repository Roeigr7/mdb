import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { useState } from 'react';
import { getErrorMessage } from '../../app/api/apiError';
import type { Revenue } from '../../app/features/revenue/revenue.types';
import { useDeleteRevenueMutation } from '../../app/features/revenue/revenueApi';
import { useAppTranslation } from '../../i18n/useAppTranslation';

type DeleteRevenueDialogProps = {
  open: boolean;
  projectId: number;
  revenue: Revenue | null;
  onClose: () => void;
  onSuccess: (message: string) => void;
};

export function DeleteRevenueDialog({
  open,
  projectId,
  revenue,
  onClose,
  onSuccess,
}: DeleteRevenueDialogProps) {
  const { t } = useAppTranslation();
  const [deleteRevenue, { isLoading }] = useDeleteRevenueMutation();
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    if (!revenue) return;
    setError(null);
    try {
      await deleteRevenue({ projectId, revenueId: revenue.id }).unwrap();
      onSuccess(t('revenue.deletedToast'));
      onClose();
    } catch (err) {
      setError(
        getErrorMessage(err, t('revenue.deleteFailed'), {
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
      <DialogTitle>{t('revenue.deleteTitle')}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {revenue
            ? t('revenue.deleteBody', { name: revenue.description })
            : t('revenue.deleteBodyGeneric')}
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
