import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { useState } from 'react';
import { getErrorMessage } from '../../app/api/apiError';
import type { Supplier } from '../../app/features/suppliers/suppliers.types';
import { useDeleteSupplierMutation } from '../../app/features/suppliers/suppliersApi';
import { useAppTranslation } from '../../i18n/useAppTranslation';

type DeleteSupplierDialogProps = {
  open: boolean;
  supplier: Supplier | null;
  onClose: () => void;
  onSuccess: (message: string) => void;
};

export function DeleteSupplierDialog({
  open,
  supplier,
  onClose,
  onSuccess,
}: DeleteSupplierDialogProps) {
  const { t } = useAppTranslation();
  const [deleteSupplier, { isLoading }] = useDeleteSupplierMutation();
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    if (!supplier) return;
    setError(null);
    try {
      await deleteSupplier(supplier.id).unwrap();
      onSuccess(t('suppliers.deletedToast'));
      onClose();
    } catch (err) {
      setError(getErrorMessage(err, t('suppliers.deleteFailed')));
    }
  }

  function handleClose() {
    if (isLoading) return;
    setError(null);
    onClose();
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>{t('suppliers.deleteTitle')}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {supplier
            ? t('suppliers.deleteBody', { name: supplier.name })
            : t('suppliers.deleteBodyGeneric')}
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
