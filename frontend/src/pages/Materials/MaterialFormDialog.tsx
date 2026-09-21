import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import { useState, type FormEvent } from 'react';
import { useAppTranslation } from '../../i18n/useAppTranslation';
import { getErrorMessage } from '../../app/api/apiError';
import type { Material } from '../../app/features/materials/materials.types';
import {
  useCreateMaterialMutation,
  useUpdateMaterialMutation,
} from '../../app/features/materials/materialsApi';

type MaterialFormDialogProps = {
  open: boolean;
  projectId: number;
  material: Material | null;
  onClose: () => void;
  onSuccess: (message: string) => void;
};

export function MaterialFormDialog({
  open,
  projectId,
  material,
  onClose,
  onSuccess,
}: MaterialFormDialogProps) {
  const { t } = useAppTranslation();
  const isEdit = Boolean(material);
  const [name, setName] = useState(material?.name ?? '');
  const [quantity, setQuantity] = useState(material ? String(material.quantity) : '');
  const [unitPrice, setUnitPrice] = useState(material ? String(material.unitPrice) : '');
  const [supplier, setSupplier] = useState(material?.supplier ?? '');
  const [formError, setFormError] = useState<string | null>(null);

  const [createMaterial, createState] = useCreateMaterialMutation();
  const [updateMaterial, updateState] = useUpdateMaterialMutation();
  const saving = createState.isLoading || updateState.isLoading;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);

    const trimmedName = name.trim();
    const parsedQuantity = Number(quantity);
    const parsedUnitPrice = Number(unitPrice);
    const trimmedSupplier = supplier.trim();

    if (!trimmedName) {
      setFormError(t('materials.nameRequired'));
      return;
    }
    if (!Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
      setFormError(t('materials.quantityInvalid'));
      return;
    }
    if (!Number.isFinite(parsedUnitPrice) || parsedUnitPrice < 0) {
      setFormError(t('materials.unitPriceInvalid'));
      return;
    }

    try {
      if (isEdit && material) {
        await updateMaterial({
          projectId,
          materialId: material.id,
          body: {
            name: trimmedName,
            quantity: parsedQuantity,
            unitPrice: parsedUnitPrice,
            supplier: trimmedSupplier || null,
          },
        }).unwrap();
        onSuccess(t('materials.updatedToast'));
      } else {
        await createMaterial({
          projectId,
          body: {
            name: trimmedName,
            quantity: parsedQuantity,
            unitPrice: parsedUnitPrice,
            ...(trimmedSupplier ? { supplier: trimmedSupplier } : {}),
          },
        }).unwrap();
        onSuccess(t('materials.createdToast'));
      }
      onClose();
    } catch (err) {
      setFormError(
        getErrorMessage(
          err,
          isEdit ? t('materials.updateFailed') : t('materials.createFailed'),
          { preferFallback: true },
        ),
      );
    }
  }

  return (
    <Dialog
      open={open}
      onClose={saving ? undefined : onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>
        {isEdit ? t('materials.formEdit') : t('materials.formCreate')}
      </DialogTitle>
      <DialogContent>
        <form id="material-form" noValidate onSubmit={handleSubmit}>
          <TextField
            autoFocus
            margin="dense"
            label={t('materials.name')}
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            fullWidth
            slotProps={{ htmlInput: { maxLength: 200 } }}
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            label={t('materials.quantity')}
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
            required
            fullWidth
            type="number"
            slotProps={{ htmlInput: { min: 0, step: 'any' } }}
            sx={{ mb: 2 }}
          />
          <TextField
            label={t('materials.unitPrice')}
            value={unitPrice}
            onChange={(event) => setUnitPrice(event.target.value)}
            required
            fullWidth
            type="number"
            slotProps={{ htmlInput: { min: 0, step: 'any' } }}
            sx={{ mb: 2 }}
          />
          <TextField
            label={t('materials.supplier')}
            value={supplier}
            onChange={(event) => setSupplier(event.target.value)}
            fullWidth
            slotProps={{ htmlInput: { maxLength: 200 } }}
          />
          {formError && (
            <Alert severity="error" sx={{ mt: 2 }} role="alert">
              {formError}
            </Alert>
          )}
        </form>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={saving}>
          {t('common.cancel')}
        </Button>
        <Button
          type="submit"
          form="material-form"
          variant="contained"
          disabled={saving}
        >
          {saving
            ? t('common.saving')
            : isEdit
              ? t('common.saveChanges')
              : t('common.create')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
