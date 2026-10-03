import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import { useState, type FormEvent } from 'react';
import { getErrorMessage } from '../../app/api/apiError';
import type { Supplier } from '../../app/features/suppliers/suppliers.types';
import {
  useCreateSupplierMutation,
  useUpdateSupplierMutation,
} from '../../app/features/suppliers/suppliersApi';
import { useAppTranslation } from '../../i18n/useAppTranslation';

type SupplierFormDialogProps = {
  open: boolean;
  supplier: Supplier | null;
  onClose: () => void;
  onSuccess: (message: string) => void;
};

export function SupplierFormDialog({
  open,
  supplier,
  onClose,
  onSuccess,
}: SupplierFormDialogProps) {
  const { t } = useAppTranslation();
  const isEdit = Boolean(supplier);
  const [name, setName] = useState(supplier?.name ?? '');
  const [email, setEmail] = useState(supplier?.email ?? '');
  const [phone, setPhone] = useState(supplier?.phone ?? '');
  const [notes, setNotes] = useState(supplier?.notes ?? '');
  const [formError, setFormError] = useState<string | null>(null);

  const [createSupplier, createState] = useCreateSupplierMutation();
  const [updateSupplier, updateState] = useUpdateSupplierMutation();
  const saving = createState.isLoading || updateState.isLoading;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();
    const trimmedNotes = notes.trim();

    if (!trimmedName) {
      setFormError(t('suppliers.nameRequired'));
      return;
    }

    const body = {
      name: trimmedName,
      email: trimmedEmail || null,
      phone: trimmedPhone || null,
      notes: trimmedNotes || null,
    };

    try {
      if (isEdit && supplier) {
        await updateSupplier({ id: supplier.id, body }).unwrap();
        onSuccess(t('suppliers.updatedToast'));
      } else {
        await createSupplier(body).unwrap();
        onSuccess(t('suppliers.createdToast'));
      }
      onClose();
    } catch (err) {
      setFormError(
        getErrorMessage(
          err,
          isEdit ? t('suppliers.updateFailed') : t('suppliers.createFailed'),
        ),
      );
    }
  }

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {isEdit ? t('suppliers.editTitle') : t('suppliers.createTitle')}
      </DialogTitle>
      <DialogContent>
        <form id="supplier-form" noValidate onSubmit={handleSubmit}>
          <TextField
            autoFocus
            margin="dense"
            label={t('suppliers.name')}
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            fullWidth
            slotProps={{ htmlInput: { maxLength: 120 } }}
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            margin="dense"
            label={t('suppliers.email')}
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            fullWidth
            slotProps={{ htmlInput: { maxLength: 160 } }}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label={t('suppliers.phone')}
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            fullWidth
            slotProps={{ htmlInput: { maxLength: 40 } }}
            sx={{ mb: 2 }}
          />
          <TextField
            label={t('suppliers.notes')}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            fullWidth
            multiline
            minRows={3}
            slotProps={{ htmlInput: { maxLength: 1000 } }}
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
          form="supplier-form"
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
