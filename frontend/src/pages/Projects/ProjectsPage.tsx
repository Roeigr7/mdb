import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import FolderRoundedIcon from '@mui/icons-material/FolderRounded';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useMemo, useState } from 'react';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import { getErrorMessage } from '../../app/api/apiError';
import type { Project } from '../../app/features/projects/projects.types';
import { useGetProjectsQuery } from '../../app/features/projects/projectsApi';
import { useNotification } from '../../components/feedback/NotificationProvider';
import { PageHeader } from '../../components/ui/PageHeader';
import { formatDate } from '../../i18n/format';
import { useAppTranslation } from '../../i18n/useAppTranslation';
import { DeleteProjectDialog } from './DeleteProjectDialog';
import { ProjectFormDialog } from './ProjectFormDialog';

export function ProjectsPage() {
  const { t, i18n } = useAppTranslation();
  const { notify } = useNotification();
  const [searchParams] = useSearchParams();
  const search = searchParams.get('search')?.trim() || undefined;

  const { data, isLoading, isError, error, refetch, isFetching } =
    useGetProjectsQuery({
      limit: 100,
      sortBy: 'updatedAt',
      sortOrder: 'desc',
      ...(search ? { search } : {}),
    });

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState<Project | null>(null);

  const projects = data?.data ?? [];
  const subtitle = useMemo(() => {
    if (search) return t('projects.searchResults', { query: search });
    if (isFetching && !isLoading) {
      return `${t('projects.subtitle')} ${t('projects.updating')}`;
    }
    return t('projects.subtitle');
  }, [isFetching, isLoading, search, t]);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(project: Project) {
    setEditing(project);
    setFormOpen(true);
  }

  return (
    <Stack spacing={3}>
      <PageHeader
        title={t('projects.title')}
        subtitle={subtitle}
        hideTitle
        actions={
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={openCreate}
          >
            {t('projects.create')}
          </Button>
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
          {getErrorMessage(error, t('projects.loadError'))}
        </Alert>
      )}

      <Card>
        {isLoading ? (
          <Box sx={{ display: 'grid', placeItems: 'center', py: 8 }}>
            <CircularProgress size={36} />
          </Box>
        ) : projects.length === 0 ? (
          <Box sx={{ py: 8, px: 3, textAlign: 'center' }}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: 2.5,
                display: 'grid',
                placeItems: 'center',
                bgcolor: 'action.selected',
                color: 'primary.main',
                mx: 'auto',
                mb: 2,
              }}
            >
              <FolderRoundedIcon />
            </Box>
            <Typography variant="h6" gutterBottom>
              {search ? t('projects.searchEmptyTitle') : t('projects.emptyTitle')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {search
                ? t('projects.searchEmptyBody', { query: search })
                : t('projects.emptyBody')}
            </Typography>
            {!search && (
              <Button
                variant="contained"
                startIcon={<AddRoundedIcon />}
                onClick={openCreate}
              >
                {t('projects.create')}
              </Button>
            )}
          </Box>
        ) : (
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table size="medium" sx={{ minWidth: { md: 640 }, width: '100%' }}>
              <TableHead>
                <TableRow>
                  <TableCell>{t('projects.name')}</TableCell>
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                    {t('projects.description')}
                  </TableCell>
                  <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                    {t('projects.created')}
                  </TableCell>
                  <TableCell align="right">{t('common.actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {projects.map((project) => (
                  <TableRow key={project.id} hover>
                    <TableCell>
                      <Typography
                        component={RouterLink}
                        to={`/projects/${project.id}`}
                        variant="subtitle2"
                        sx={{
                          color: 'primary.main',
                          textDecoration: 'none',
                          '&:hover': { textDecoration: 'underline' },
                        }}
                      >
                        {project.name}
                      </Typography>
                    </TableCell>
                    <TableCell
                      sx={{ maxWidth: 320, display: { xs: 'none', md: 'table-cell' } }}
                    >
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {project.description || t('common.none')}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                      <Typography variant="body2">
                        {formatDate(project.createdAt, i18n.language)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title={t('common.view')}>
                        <IconButton
                          component={RouterLink}
                          to={`/projects/${project.id}`}
                          size="small"
                          aria-label={t('projects.viewAria', {
                            name: project.name,
                          })}
                        >
                          <VisibilityOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={t('common.edit')}>
                        <IconButton
                          size="small"
                          onClick={() => openEdit(project)}
                          aria-label={t('projects.editAria', {
                            name: project.name,
                          })}
                        >
                          <EditOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={t('common.delete')}>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => setDeleting(project)}
                          aria-label={t('projects.deleteAria', {
                            name: project.name,
                          })}
                        >
                          <DeleteOutlineRoundedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      <ProjectFormDialog
        key={`${formOpen}-${editing?.id ?? 'create'}`}
        open={formOpen}
        project={editing}
        onClose={() => setFormOpen(false)}
        onSuccess={(message) => notify({ message, severity: 'success' })}
      />

      <DeleteProjectDialog
        open={Boolean(deleting)}
        project={deleting}
        onClose={() => setDeleting(null)}
        onSuccess={(message) => notify({ message, severity: 'success' })}
      />
    </Stack>
  );
}
