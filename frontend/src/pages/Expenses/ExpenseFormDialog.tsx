import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import { useState, type FormEvent } from 'react';
import { getErrorMessage } from '../../app/api/apiError';
import type { Expense } from '../../app/features/expenses/expenses.types';
import {
  useCreateExpenseMutation,
  useUpdateExpenseMutation,
} from '../../app/features/expenses/expensesApi';
import { useAppTranslation } from '../../i18n/useAppTranslation';

function toDateInputValue(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

function toIsoDate(dateInput: string) {
  return new Date(`${dateInput}T00:00:00.000Z`).toISOString();
}

type ExpenseFormDialogProps = {
  open: boolean;
  projectId: number;
  expense: Expense | null;
  onClose: () => void;
  onSuccess: (message: string) => void;
};

export function ExpenseFormDialog({
  open,
  projectId,
  expense,
  onClose,
  onSuccess,
}: ExpenseFormDialogProps) {
  const { t } = useAppTranslation();
  const isEdit = Boolean(expense);
  const [description, setDescription] = useState(expense?.description ?? '');
  const [category, setCategory] = useState(expense?.category ?? '');
  const [amount, setAmount] = useState(expense ? String(expense.amount) : '');
  const [date, setDate] = useState(
    expense ? toDateInputValue(expense.date) : toDateInputValue(new Date().toISOString()),
  );
  const [formError, setFormError] = useState<string | null>(null);

  const [createExpense, createState] = useCreateExpenseMutation();
  const [updateExpense, updateState] = useUpdateExpenseMutation();
  const saving = createState.isLoading || updateState.isLoading;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);

    const trimmedDescription = description.trim();
    const trimmedCategory = category.trim();
    const parsedAmount = Number(amount);

    if (!trimmedDescription) {
      setFormError(t('expenses.descriptionRequired'));
      return;
    }
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setFormError(t('expenses.amountInvalid'));
      return;
    }
    if (!date) {
      setFormError(t('expenses.dateRequired'));
      return;
    }

    const isoDate = toIsoDate(date);

    try {
      if (isEdit && expense) {
        await updateExpense({
          projectId,
          expenseId: expense.id,
          body: {
            description: trimmedDescription,
            category: trimmedCategory || null,
            amount: parsedAmount,
            date: isoDate,
          },
        }).unwrap();
        onSuccess(t('expenses.updatedToast'));
      } else {
        await createExpense({
          projectId,
          body: {
            description: trimmedDescription,
            amount: parsedAmount,
            date: isoDate,
            ...(trimmedCategory ? { category: trimmedCategory } : {}),
          },
        }).unwrap();
        onSuccess(t('expenses.createdToast'));
      }
      onClose();
    } catch (err) {
      setFormError(
        getErrorMessage(
          err,
          isEdit ? t('expenses.updateFailed') : t('expenses.createFailed'),
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
        {isEdit ? t('expenses.formEdit') : t('expenses.formCreate')}
      </DialogTitle>
      <DialogContent>
        <form id="expense-form" noValidate onSubmit={handleSubmit}>
          <TextField
            autoFocus
            margin="dense"
            label={t('expenses.description')}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            required
            fullWidth
            slotProps={{ htmlInput: { maxLength: 500 } }}
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            label={t('expenses.category')}
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            fullWidth
            slotProps={{ htmlInput: { maxLength: 100 } }}
            sx={{ mb: 2 }}
          />
          <TextField
            label={t('expenses.amount')}
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            required
            fullWidth
            type="number"
            slotProps={{ htmlInput: { min: 0, step: 'any' } }}
            sx={{ mb: 2 }}
          />
          <TextField
            label={t('expenses.date')}
            value={date}
            onChange={(event) => setDate(event.target.value)}
            required
            fullWidth
            type="date"
            slotProps={{ inputLabel: { shrink: true } }}
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
          form="expense-form"
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
