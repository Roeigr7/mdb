import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import { useState, type FormEvent } from 'react';
import { getErrorMessage } from '../../app/api/apiError';
import type {
  Revenue,
  RevenueStatus,
} from '../../app/features/revenue/revenue.types';
import {
  useCreateRevenueMutation,
  useUpdateRevenueMutation,
} from '../../app/features/revenue/revenueApi';
import { useAppTranslation } from '../../i18n/useAppTranslation';

const STATUS_OPTIONS: RevenueStatus[] = ['PENDING', 'PAID', 'CANCELLED'];

function toDateInputValue(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

function toIsoDate(dateInput: string) {
  return new Date(`${dateInput}T00:00:00.000Z`).toISOString();
}

type RevenueFormDialogProps = {
  open: boolean;
  projectId: number;
  revenue: Revenue | null;
  onClose: () => void;
  onSuccess: (message: string) => void;
};

export function RevenueFormDialog({
  open,
  projectId,
  revenue,
  onClose,
  onSuccess,
}: RevenueFormDialogProps) {
  const { t } = useAppTranslation();
  const isEdit = Boolean(revenue);
  const [description, setDescription] = useState(revenue?.description ?? '');
  const [customer, setCustomer] = useState(revenue?.customer ?? '');
  const [amount, setAmount] = useState(revenue ? String(revenue.amount) : '');
  const [date, setDate] = useState(
    revenue
      ? toDateInputValue(revenue.date)
      : toDateInputValue(new Date().toISOString()),
  );
  const [status, setStatus] = useState<RevenueStatus>(
    revenue?.status ?? 'PENDING',
  );
  const [formError, setFormError] = useState<string | null>(null);

  const [createRevenue, createState] = useCreateRevenueMutation();
  const [updateRevenue, updateState] = useUpdateRevenueMutation();
  const saving = createState.isLoading || updateState.isLoading;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);

    const trimmedDescription = description.trim();
    const trimmedCustomer = customer.trim();
    const parsedAmount = Number(amount);

    if (!trimmedDescription) {
      setFormError(t('revenue.descriptionRequired'));
      return;
    }
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setFormError(t('revenue.amountInvalid'));
      return;
    }
    if (!date) {
      setFormError(t('revenue.dateRequired'));
      return;
    }
    if (!STATUS_OPTIONS.includes(status)) {
      setFormError(t('revenue.statusRequired'));
      return;
    }

    const isoDate = toIsoDate(date);

    try {
      if (isEdit && revenue) {
        await updateRevenue({
          projectId,
          revenueId: revenue.id,
          body: {
            description: trimmedDescription,
            customer: trimmedCustomer || null,
            amount: parsedAmount,
            date: isoDate,
            status,
          },
        }).unwrap();
        onSuccess(t('revenue.updatedToast'));
      } else {
        await createRevenue({
          projectId,
          body: {
            description: trimmedDescription,
            amount: parsedAmount,
            date: isoDate,
            status,
            ...(trimmedCustomer ? { customer: trimmedCustomer } : {}),
          },
        }).unwrap();
        onSuccess(t('revenue.createdToast'));
      }
      onClose();
    } catch (err) {
      setFormError(
        getErrorMessage(
          err,
          isEdit ? t('revenue.updateFailed') : t('revenue.createFailed'),
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
        {isEdit ? t('revenue.formEdit') : t('revenue.formCreate')}
      </DialogTitle>
      <DialogContent>
        <form id="revenue-form" noValidate onSubmit={handleSubmit}>
          <TextField
            autoFocus
            margin="dense"
            label={t('revenue.description')}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            required
            fullWidth
            slotProps={{ htmlInput: { maxLength: 500 } }}
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            label={t('revenue.customer')}
            value={customer}
            onChange={(event) => setCustomer(event.target.value)}
            fullWidth
            slotProps={{ htmlInput: { maxLength: 200 } }}
            sx={{ mb: 2 }}
          />
          <TextField
            label={t('revenue.amount')}
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            required
            fullWidth
            type="number"
            slotProps={{ htmlInput: { min: 0, step: 'any' } }}
            sx={{ mb: 2 }}
          />
          <TextField
            label={t('revenue.date')}
            value={date}
            onChange={(event) => setDate(event.target.value)}
            required
            fullWidth
            type="date"
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth required>
            <InputLabel id="revenue-status-label">{t('revenue.status')}</InputLabel>
            <Select
              labelId="revenue-status-label"
              label={t('revenue.status')}
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as RevenueStatus)
              }
            >
              {STATUS_OPTIONS.map((option) => (
                <MenuItem key={option} value={option}>
                  {t(`revenue.statuses.${option}`)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
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
          form="revenue-form"
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
