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
import type { Project } from '../../app/features/projects/projects.types';
import {
  useCreateProjectMutation,
  useUpdateProjectMutation,
} from '../../app/features/projects/projectsApi';

type ProjectFormDialogProps = {
  open: boolean;
  project: Project | null;
  onClose: () => void;
  onSuccess: (message: string) => void;
};

export function ProjectFormDialog({
  open,
  project,
  onClose,
  onSuccess,
}: ProjectFormDialogProps) {
  const { t } = useAppTranslation();
  const isEdit = Boolean(project);
  const [name, setName] = useState(project?.name ?? '');
  const [description, setDescription] = useState(project?.description ?? '');
  const [formError, setFormError] = useState<string | null>(null);

  const [createProject, createState] = useCreateProjectMutation();
  const [updateProject, updateState] = useUpdateProjectMutation();

  const saving = createState.isLoading || updateState.isLoading;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);

    const trimmedName = name.trim();
    const trimmedDescription = description.trim();

    if (!trimmedName) {
      setFormError(t('projects.nameRequired'));
      return;
    }

    try {
      if (isEdit && project) {
        await updateProject({
          id: project.id,
          body: {
            name: trimmedName,
            description: trimmedDescription || undefined,
          },
        }).unwrap();
        onSuccess(t('projects.updatedToast'));
      } else {
        await createProject({
          name: trimmedName,
          description: trimmedDescription || undefined,
        }).unwrap();
        onSuccess(t('projects.createdToast'));
      }
      onClose();
    } catch (err) {
      setFormError(
        getErrorMessage(
          err,
          isEdit ? t('projects.updateFailed') : t('projects.createFailed'),
        ),
      );
    }
  }

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {isEdit ? t('projects.editTitle') : t('projects.createTitle')}
      </DialogTitle>
      <DialogContent>
        <form id="project-form" noValidate onSubmit={handleSubmit}>
          <TextField
            autoFocus
            margin="dense"
            label={t('projects.name')}
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            fullWidth
            slotProps={{ htmlInput: { maxLength: 100 } }}
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            label={t('projects.description')}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
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
        <Button type="submit" form="project-form" variant="contained" disabled={saving}>
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
