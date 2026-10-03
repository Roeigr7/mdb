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
import { PageHeader } from '../../components/ui/PageHeader';
import { useAppTranslation } from '../../i18n/useAppTranslation';
import { MaterialsPanel } from './MaterialsPanel';

export function MaterialsPage() {
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
      <PageHeader
        title={t('materials.title')}
        subtitle={t('materials.subtitle')}
        hideTitle
        actions={
          !isLoading && projects.length > 0 ? (
            <FormControl sx={{ minWidth: { xs: '100%', sm: 280 } }} size="small">
              <InputLabel id="materials-project-label">
                {t('materials.project')}
              </InputLabel>
              <Select
                labelId="materials-project-label"
                label={t('materials.project')}
                value={projectId}
                displayEmpty
                onChange={(event) =>
                  setSelectedProjectId(Number(event.target.value))
                }
              >
                {projectId === '' && (
                  <MenuItem value="" disabled>
                    {t('materials.chooseProject')}
                  </MenuItem>
                )}
                {projects.map((project) => (
                  <MenuItem key={project.id} value={project.id}>
                    {project.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : undefined
        }
      />

      {isError && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => void refetch()}>
              {t('common.retry')}
            </Button>
          }
        >
          {getErrorMessage(error, t('materials.projectsLoadError'))}
        </Alert>
      )}

      {isLoading ? (
        <Box sx={{ display: 'grid', placeItems: 'center', py: 8 }}>
          <CircularProgress size={36} />
        </Box>
      ) : projects.length === 0 ? (
        <Box sx={{ py: 6, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            {t('materials.noProjectsTitle')}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t('materials.noProjectsBody')}
          </Typography>
          <Button component={RouterLink} to="/projects" variant="contained">
            {t('materials.goToProjects')}
          </Button>
        </Box>
      ) : projectId === '' ? (
        <Typography variant="body2" color="text.secondary">
          {t('materials.chooseProject')}
        </Typography>
      ) : (
        <MaterialsPanel projectId={projectId} />
      )}
    </Stack>
  );
}
