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
import type { Project } from '../../app/features/projects/projects.types';
import { useDeleteProjectMutation } from '../../app/features/projects/projectsApi';

type DeleteProjectDialogProps = {
  open: boolean;
  project: Project | null;
  onClose: () => void;
  onSuccess: (message: string) => void;
};

export function DeleteProjectDialog({
  open,
  project,
  onClose,
  onSuccess,
}: DeleteProjectDialogProps) {
  const { t } = useAppTranslation();
  const [deleteProject, { isLoading }] = useDeleteProjectMutation();
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    if (!project) return;
    setError(null);
    try {
      await deleteProject(project.id).unwrap();
      onSuccess(t('projects.deletedToast'));
      onClose();
    } catch (err) {
      setError(getErrorMessage(err, t('projects.deleteFailed')));
    }
  }

  function handleClose() {
    if (isLoading) return;
    setError(null);
    onClose();
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>{t('projects.deleteTitle')}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {project
            ? t('projects.deleteBody', { name: project.name })
            : t('projects.deleteBodyGeneric')}
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
