import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { useState } from 'react';
import { useAppTranslation } from '../../i18n/useAppTranslation';
import { getErrorMessage } from '../../app/api/apiError';
import { useDeleteMaterialMutation } from '../../app/features/materials/materialsApi';
import type { Material } from '../../app/features/materials/materials.types';

type DeleteMaterialDialogProps = {
  open: boolean;
  projectId: number;
  material: Material | null;
  onClose: () => void;
  onSuccess: (message: string) => void;
};

export function DeleteMaterialDialog({
  open,
  projectId,
  material,
  onClose,
  onSuccess,
}: DeleteMaterialDialogProps) {
  const { t } = useAppTranslation();
  const [deleteMaterial, { isLoading }] = useDeleteMaterialMutation();
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    if (!material) return;
    setError(null);
    try {
      await deleteMaterial({ projectId, materialId: material.id }).unwrap();
      onSuccess(t('materials.deletedToast'));
      onClose();
    } catch (err) {
      setError(
        getErrorMessage(err, t('materials.deleteFailed'), {
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
      <DialogTitle>{t('materials.deleteTitle')}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {material
            ? t('materials.deleteBody', { name: material.name })
            : t('materials.deleteBodyGeneric')}
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
