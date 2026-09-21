import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { getErrorMessage } from '../../app/api/apiError';
import { useGetProjectsQuery } from '../../app/features/projects/projectsApi';
import { useAppTranslation } from '../../i18n/useAppTranslation';
import { ExpensesPanel } from './ExpensesPanel';

export function ExpensesPage() {
  const { t } = useAppTranslation();
  const { data, isLoading, isError, error, refetch } = useGetProjectsQuery({
    limit: 100,
  });
  const projects = data?.data ?? [];
  const onlyProjectId = projects.length === 1 ? projects[0].id : null;
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const projectId = selectedProjectId ?? onlyProjectId ?? '';

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" component="h1" gutterBottom>
          {t('expenses.title')}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t('expenses.subtitle')}
        </Typography>
      </Box>

      {isError && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => void refetch()}>
              {t('common.retry')}
            </Button>
          }
        >
          {getErrorMessage(error, t('expenses.projectsLoadError'))}
        </Alert>
      )}

      {isLoading ? (
        <Box sx={{ display: 'grid', placeItems: 'center', py: 8 }}>
          <CircularProgress size={36} />
        </Box>
      ) : projects.length === 0 ? (
        <Box sx={{ py: 6, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            {t('expenses.noProjectsTitle')}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t('expenses.noProjectsBody')}
          </Typography>
          <Button component={RouterLink} to="/projects" variant="contained">
            {t('expenses.goToProjects')}
          </Button>
        </Box>
      ) : (
        <>
          <FormControl sx={{ maxWidth: 420 }} fullWidth>
            <InputLabel id="expenses-project-label">
              {t('expenses.project')}
            </InputLabel>
            <Select
              labelId="expenses-project-label"
              label={t('expenses.project')}
              value={projectId}
              displayEmpty
              onChange={(event) => setSelectedProjectId(Number(event.target.value))}
            >
              {projectId === '' && (
                <MenuItem value="" disabled>
                  {t('expenses.chooseProject')}
                </MenuItem>
              )}
              {projects.map((project) => (
                <MenuItem key={project.id} value={project.id}>
                  {project.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {projectId === '' ? (
            <Typography variant="body2" color="text.secondary">
              {t('expenses.chooseProject')}
            </Typography>
          ) : (
            <ExpensesPanel projectId={projectId} />
          )}
        </>
      )}
    </Stack>
  );
}
