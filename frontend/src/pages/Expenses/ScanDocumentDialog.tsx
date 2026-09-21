import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import DocumentScannerRoundedIcon from '@mui/icons-material/DocumentScannerRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useRef, useState, type ChangeEvent, type DragEvent, type FormEvent } from 'react';
import { getErrorMessage } from '../../app/api/apiError';
import type {
  DocumentScanResult,
  ExtractedTransactionType,
} from '../../app/features/expenses/expenses.types';
import {
  useCreateExpenseMutation,
  useScanExpenseDocumentMutation,
} from '../../app/features/expenses/expensesApi';
import { useCreateRevenueMutation } from '../../app/features/revenue/revenueApi';
import { t, useAppTranslation } from '../../i18n/useAppTranslation';
import type { AppTranslationKey } from '../../i18n/useAppTranslation';
import {
  isLowConfidence,
  toDateInputValue,
  toIsoDate,
  validateReviewForm,
  validateScanFile,
  type ReviewFormValues,
  type ReviewValidationError,
} from './scanDocumentHelpers';

type ScanStep =
  | 'idle'
  | 'uploading'
  | 'reading'
  | 'extracting'
  | 'review'
  | 'saving';

const REVIEW_ERROR_TRANSLATION_KEYS = {
  descriptionRequired: 'scan.errors.descriptionRequired',
  amountInvalid: 'scan.errors.amountInvalid',
  vatInvalid: 'scan.errors.vatInvalid',
  dateRequired: 'scan.errors.dateRequired',
} as const satisfies Record<ReviewValidationError, AppTranslationKey>;

const OLLAMA_ERROR_TRANSLATION_KEYS = {
  OLLAMA_NOT_RUNNING: 'scan.errors.ollamaNotRunning',
  OLLAMA_MODEL_NOT_INSTALLED: 'scan.errors.ollamaModelMissing',
  OLLAMA_INVALID_JSON: 'scan.errors.ollamaInvalidJson',
  OLLAMA_PDF_UNSUPPORTED: 'scan.errors.ollamaPdfUnsupported',
  OLLAMA_REQUEST_FAILED: 'scan.errors.ollamaRequestFailed',
  OLLAMA_EMPTY_RESPONSE: 'scan.errors.ollamaEmptyResponse',
  OLLAMA_TIMEOUT: 'scan.errors.ollamaTimeout',
} as const satisfies Record<string, AppTranslationKey>;

function mapScanApiError(error: unknown, fallback: string): string {
  const raw = getErrorMessage(error, fallback);
  const code = raw.trim();
  const key =
    OLLAMA_ERROR_TRANSLATION_KEYS[
      code as keyof typeof OLLAMA_ERROR_TRANSLATION_KEYS
    ];
  return key ? t(key) : raw;
}

type ScanDocumentDialogProps = {
  open: boolean;
  projectId: number;
  defaultType?: ExtractedTransactionType;
  onClose: () => void;
  onSuccess: (message: string) => void;
};

function ConfidenceHint({
  confidence,
  reviewLabel,
  okLabel,
}: {
  confidence: number | undefined;
  reviewLabel: string;
  okLabel: string;
}) {
  if (confidence === undefined) return null;
  const low = isLowConfidence(confidence);
  return (
    <Stack
      direction="row"
      spacing={0.5}
      sx={{ alignItems: 'center', mt: 0.5 }}
      aria-label={low ? reviewLabel : okLabel}
    >
      {low ? (
        <WarningAmberRoundedIcon color="warning" sx={{ fontSize: 16 }} />
      ) : (
        <CheckCircleOutlineRoundedIcon color="success" sx={{ fontSize: 16 }} />
      )}
      <Typography variant="caption" color={low ? 'warning.main' : 'success.main'}>
        {low ? reviewLabel : okLabel}
      </Typography>
    </Stack>
  );
}

export function ScanDocumentDialog({
  open,
  projectId,
  defaultType = 'EXPENSE',
  onClose,
  onSuccess,
}: ScanDocumentDialogProps) {
  const { t } = useAppTranslation();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [step, setStep] = useState<ScanStep>('idle');
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<DocumentScanResult | null>(null);
  const [form, setForm] = useState<ReviewFormValues>({
    type: defaultType,
    supplier: '',
    amount: '',
    vatAmount: '',
    date: '',
    documentNumber: '',
    category: '',
    description: '',
  });

  const [scanDocument, scanState] = useScanExpenseDocumentMutation();
  const [createExpense, createExpenseState] = useCreateExpenseMutation();
  const [createRevenue, createRevenueState] = useCreateRevenueMutation();

  const busy =
    step === 'uploading' ||
    step === 'reading' ||
    step === 'extracting' ||
    step === 'saving' ||
    scanState.isLoading ||
    createExpenseState.isLoading ||
    createRevenueState.isLoading;

  function resetLocalState() {
    setStep('idle');
    setError(null);
    setScanResult(null);
    setDragOver(false);
    setForm({
      type: defaultType,
      supplier: '',
      amount: '',
      vatAmount: '',
      date: '',
      documentNumber: '',
      category: '',
      description: '',
    });
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }

  function handleClose() {
    if (busy) return;
    resetLocalState();
    onClose();
  }

  function mapClientError(code: ReturnType<typeof validateScanFile>): string {
    if (code === 'tooLarge') return t('scan.errors.tooLarge');
    if (code === 'unsupported') return t('scan.errors.unsupported');
    if (code === 'invalidName') return t('scan.errors.invalidName');
    return t('scan.errors.missing');
  }

  async function processFile(file: File) {
    if (busy) return;

    const clientError = validateScanFile(file);
    if (clientError) {
      setError(mapClientError(clientError));
      return;
    }

    setError(null);
    setStep('uploading');

    try {
      setStep('reading');
      // Visual staging — single request still covers upload+OCR+extraction
      setStep('extracting');
      const result = await scanDocument({ projectId, file }).unwrap();
      const extracted = result.extractedData;

      setScanResult(result);
      setForm({
        type: extracted.type ?? defaultType,
        supplier: extracted.supplier ?? '',
        amount:
          extracted.amount !== null && extracted.amount !== undefined
            ? String(extracted.amount)
            : '',
        vatAmount:
          extracted.vatAmount !== null && extracted.vatAmount !== undefined
            ? String(extracted.vatAmount)
            : '',
        date: toDateInputValue(extracted.date),
        documentNumber: extracted.documentNumber ?? '',
        category: extracted.category ?? '',
        description: extracted.description ?? '',
      });
      setStep('review');
    } catch (err) {
      setStep('idle');
      setError(mapScanApiError(err, t('scan.errors.readFailed')));
    }
  }

  function onFileInputChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      void processFile(file);
    }
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragOver(false);
    if (busy) return;
    const file = event.dataTransfer.files?.[0];
    if (file) {
      void processFile(file);
    }
  }

  async function handleSave(event: FormEvent) {
    event.preventDefault();
    if (!scanResult || busy) return;

    const validationKey = validateReviewForm(form);
    if (validationKey) {
      setError(t(REVIEW_ERROR_TRANSLATION_KEYS[validationKey]));
      return;
    }

    setError(null);
    setStep('saving');

    const amount = Number(form.amount);
    const vatRaw = form.vatAmount.trim();
    const vatAmount = vatRaw ? Number(vatRaw) : null;
    const isoDate = toIsoDate(form.date);

    try {
      if (form.type === 'INCOME') {
        await createRevenue({
          projectId,
          body: {
            description: form.description.trim(),
            customer: form.supplier.trim() || undefined,
            amount,
            vatAmount,
            date: isoDate,
            status: 'PENDING',
            documentNumber: form.documentNumber.trim() || null,
            documentUrl: scanResult.documentUrl,
            source: 'SCANNED',
            documentId: scanResult.documentId,
          },
        }).unwrap();
        onSuccess(t('scan.savedIncomeToast'));
      } else {
        await createExpense({
          projectId,
          body: {
            description: form.description.trim(),
            amount,
            vatAmount,
            date: isoDate,
            supplier: form.supplier.trim() || null,
            documentNumber: form.documentNumber.trim() || null,
            documentUrl: scanResult.documentUrl,
            category: form.category.trim() || undefined,
            source: 'SCANNED',
            documentId: scanResult.documentId,
          },
        }).unwrap();
        onSuccess(t('scan.savedExpenseToast'));
      }
      resetLocalState();
      onClose();
    } catch (err) {
      setStep('review');
      setError(
        getErrorMessage(err, t('scan.errors.saveFailed')),
      );
    }
  }

  const confidence = scanResult?.extractedData.fieldConfidence ?? {};

  const stepLabel =
    step === 'uploading'
      ? t('scan.steps.uploading')
      : step === 'reading'
        ? t('scan.steps.reading')
        : step === 'extracting'
          ? t('scan.steps.extracting')
          : step === 'saving'
            ? t('scan.steps.saving')
            : null;

  return (
    <Dialog
      open={open}
      onClose={busy ? undefined : handleClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>{t('scan.title')}</DialogTitle>
      <DialogContent>
        {step !== 'review' && (
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {t('scan.hint')}
            </Typography>

            <Box
              onDragOver={(event) => {
                event.preventDefault();
                if (!busy) setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              sx={{
                border: '2px dashed',
                borderColor: dragOver ? 'primary.main' : 'divider',
                borderRadius: 2,
                bgcolor: dragOver ? 'action.hover' : 'background.paper',
                p: 3,
                textAlign: 'center',
                cursor: busy ? 'default' : 'pointer',
                opacity: busy ? 0.7 : 1,
              }}
              onClick={() => {
                if (!busy) inputRef.current?.click();
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (!busy && (event.key === 'Enter' || event.key === ' ')) {
                  event.preventDefault();
                  inputRef.current?.click();
                }
              }}
              aria-label={t('scan.uploadAria')}
            >
              {busy ? (
                <Stack spacing={1.5} sx={{ alignItems: 'center' }}>
                  <CircularProgress size={32} />
                  <Typography variant="body2">{stepLabel}</Typography>
                </Stack>
              ) : (
                <Stack spacing={1} sx={{ alignItems: 'center' }}>
                  <CloudUploadRoundedIcon color="primary" sx={{ fontSize: 36 }} />
                  <Typography variant="subtitle1">{t('scan.upload')}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {t('scan.formats')}
                  </Typography>
                </Stack>
              )}
            </Box>

            <input
              ref={inputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
              hidden
              disabled={busy}
              onChange={onFileInputChange}
            />

            <Button
              variant="outlined"
              startIcon={<DocumentScannerRoundedIcon />}
              disabled={busy}
              onClick={() => inputRef.current?.click()}
            >
              {t('scan.chooseFile')}
            </Button>
          </Stack>
        )}

        {step === 'review' && (
          <form id="scan-review-form" noValidate onSubmit={handleSave}>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                {t('scan.reviewHint')}
              </Typography>

              <FormControl>
                <Typography variant="subtitle2" gutterBottom>
                  {t('scan.fields.type')}
                </Typography>
                <RadioGroup
                  row
                  value={form.type}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      type: event.target.value as ExtractedTransactionType,
                    }))
                  }
                >
                  <FormControlLabel
                    value="EXPENSE"
                    control={<Radio />}
                    label={t('scan.fields.typeExpense')}
                    disabled={busy}
                  />
                  <FormControlLabel
                    value="INCOME"
                    control={<Radio />}
                    label={t('scan.fields.typeIncome')}
                    disabled={busy}
                  />
                </RadioGroup>
                <ConfidenceHint
                  confidence={confidence.type}
                  reviewLabel={t('scan.confidence.review')}
                  okLabel={t('scan.confidence.ok')}
                />
              </FormControl>

              <Box>
                <TextField
                  label={
                    form.type === 'INCOME'
                      ? t('scan.fields.customer')
                      : t('scan.fields.supplier')
                  }
                  value={form.supplier}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, supplier: event.target.value }))
                  }
                  fullWidth
                  disabled={busy}
                  slotProps={{ htmlInput: { maxLength: 200 } }}
                />
                <ConfidenceHint
                  confidence={confidence.supplier}
                  reviewLabel={t('scan.confidence.review')}
                  okLabel={t('scan.confidence.ok')}
                />
              </Box>

              <Box>
                <TextField
                  label={t('scan.fields.amount')}
                  value={form.amount}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, amount: event.target.value }))
                  }
                  required
                  fullWidth
                  type="number"
                  disabled={busy}
                  slotProps={{ htmlInput: { min: 0, step: 'any' } }}
                />
                <ConfidenceHint
                  confidence={confidence.amount}
                  reviewLabel={t('scan.confidence.review')}
                  okLabel={t('scan.confidence.ok')}
                />
              </Box>

              <Box>
                <TextField
                  label={t('scan.fields.vat')}
                  value={form.vatAmount}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      vatAmount: event.target.value,
                    }))
                  }
                  fullWidth
                  type="number"
                  disabled={busy}
                  slotProps={{ htmlInput: { min: 0, step: 'any' } }}
                />
                <ConfidenceHint
                  confidence={confidence.vatAmount}
                  reviewLabel={t('scan.confidence.review')}
                  okLabel={t('scan.confidence.ok')}
                />
              </Box>

              <Box>
                <TextField
                  label={t('scan.fields.date')}
                  value={form.date}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, date: event.target.value }))
                  }
                  required
                  fullWidth
                  type="date"
                  disabled={busy}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
                <ConfidenceHint
                  confidence={confidence.date}
                  reviewLabel={t('scan.confidence.review')}
                  okLabel={t('scan.confidence.ok')}
                />
              </Box>

              <Box>
                <TextField
                  label={t('scan.fields.documentNumber')}
                  value={form.documentNumber}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      documentNumber: event.target.value,
                    }))
                  }
                  fullWidth
                  disabled={busy}
                  slotProps={{ htmlInput: { maxLength: 100 } }}
                />
                <ConfidenceHint
                  confidence={confidence.documentNumber}
                  reviewLabel={t('scan.confidence.review')}
                  okLabel={t('scan.confidence.ok')}
                />
              </Box>

              {form.type === 'EXPENSE' && (
                <Box>
                  <TextField
                    label={t('scan.fields.category')}
                    value={form.category}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        category: event.target.value,
                      }))
                    }
                    fullWidth
                    disabled={busy}
                    slotProps={{ htmlInput: { maxLength: 100 } }}
                  />
                  <ConfidenceHint
                    confidence={confidence.category}
                    reviewLabel={t('scan.confidence.review')}
                    okLabel={t('scan.confidence.ok')}
                  />
                </Box>
              )}

              {form.type === 'INCOME' && (
                <Typography variant="caption" color="text.secondary">
                  {t('scan.incomeStatusNote', {
                    status: t('revenue.statuses.PENDING'),
                  })}
                </Typography>
              )}

              <Box>
                <TextField
                  label={t('scan.fields.description')}
                  value={form.description}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      description: event.target.value,
                    }))
                  }
                  required
                  fullWidth
                  disabled={busy}
                  slotProps={{ htmlInput: { maxLength: 500 } }}
                />
                <ConfidenceHint
                  confidence={confidence.description}
                  reviewLabel={t('scan.confidence.review')}
                  okLabel={t('scan.confidence.ok')}
                />
              </Box>
            </Stack>
          </form>
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 2 }} role="alert">
            {error}
          </Alert>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={busy}>
          {t('common.cancel')}
        </Button>
        {step === 'review' && (
          <Button
            type="submit"
            form="scan-review-form"
            variant="contained"
            disabled={busy}
          >
            {busy ? t('common.saving') : t('scan.save')}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
