import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
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
import { useEffect, useState } from 'react';
import { useAppTranslation } from '../../i18n/useAppTranslation';
import { getErrorMessage } from '../../app/api/apiError';
import type { Material } from '../../app/features/materials/materials.types';
import { useGetMaterialsQuery } from '../../app/features/materials/materialsApi';
import { useNotification } from '../../components/feedback/NotificationProvider';
import { formatMoney, formatNumber } from '../../i18n/format';
import { DeleteMaterialDialog } from './DeleteMaterialDialog';
import { MaterialFormDialog } from './MaterialFormDialog';

type MaterialsPanelProps = {
  projectId: number;
  showHeading?: boolean;
};

export function MaterialsPanel({
  projectId,
  showHeading = false,
}: MaterialsPanelProps) {
  const { t, i18n } = useAppTranslation();
  const { notify } = useNotification();
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error, refetch, isFetching } =
    useGetMaterialsQuery({ projectId, page });

  useEffect(() => {
    setPage(1);
  }, [projectId]);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Material | null>(null);
  const [deleting, setDeleting] = useState<Material | null>(null);

  const materials = data?.data ?? [];
  const total = data?.summary.totalCost ?? 0;
  const hasMore = Boolean(data && data.meta.page < data.meta.totalPages);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(material: Material) {
    setEditing(material);
    setFormOpen(true);
  }

  function loadMore() {
    if (!hasMore || isFetching) return;
    setPage((current) => current + 1);
  }

  return (
    <Stack spacing={2}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', sm: 'center' },
        }}
      >
        <Box>
          {showHeading && (
            <Typography variant="h6" component="h2">
              {t('materials.sectionTitle')}
            </Typography>
          )}
          {isFetching && !isLoading && (
            <Typography variant="body2" color="text.secondary">
              {t('projects.updating')}
            </Typography>
          )}
        </Box>
        <Button
          variant="contained"
          startIcon={<AddRoundedIcon />}
          onClick={openCreate}
        >
          {t('materials.add')}
        </Button>
      </Stack>

      {isError && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => void refetch()}>
              {t('common.retry')}
            </Button>
          }
        >
          {getErrorMessage(error, t('materials.loadError'), {
            preferFallback: true,
          })}
        </Alert>
      )}

      <Card>
        {isLoading ? (
          <Box sx={{ display: 'grid', placeItems: 'center', py: 8 }}>
            <CircularProgress size={36} />
          </Box>
        ) : materials.length === 0 ? (
          <Box sx={{ py: 8, px: 3, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              {t('materials.emptyTitle')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {t('materials.emptyBody')}
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddRoundedIcon />}
              onClick={openCreate}
            >
              {t('materials.add')}
            </Button>
          </Box>
        ) : (
          <>
            <TableContainer sx={{ overflowX: 'auto' }}>
              <Table size="medium" sx={{ minWidth: { md: 720 }, width: '100%' }}>
                <TableHead>
                  <TableRow>
                    <TableCell>{t('materials.name')}</TableCell>
                    <TableCell>{t('materials.quantity')}</TableCell>
                    <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                      {t('materials.unitPrice')}
                    </TableCell>
                    <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                      {t('materials.supplier')}
                    </TableCell>
                    <TableCell>{t('materials.cost')}</TableCell>
                    <TableCell align="right">{t('common.actions')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {materials.map((material) => (
                    <TableRow key={material.id} hover>
                      <TableCell>
                        <Typography variant="subtitle2">{material.name}</Typography>
                      </TableCell>
                      <TableCell>
                        {formatNumber(material.quantity, i18n.language)}
                      </TableCell>
                      <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                        {formatMoney(material.unitPrice, i18n.language)}
                      </TableCell>
                      <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                        {material.supplier || t('common.none')}
                      </TableCell>
                      <TableCell>
                        {formatMoney(material.cost, i18n.language)}
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title={t('common.edit')}>
                          <IconButton
                            size="small"
                            onClick={() => openEdit(material)}
                            aria-label={t('materials.editAria', {
                              name: material.name,
                            })}
                          >
                            <EditOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={t('common.delete')}>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => setDeleting(material)}
                            aria-label={t('materials.deleteAria', {
                              name: material.name,
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
            {hasMore && (
              <Box sx={{ display: 'grid', placeItems: 'center', py: 2 }}>
                <Button
                  variant="outlined"
                  onClick={loadMore}
                  disabled={isFetching}
                >
                  {isFetching ? t('common.pleaseWait') : t('common.loadMore')}
                </Button>
              </Box>
            )}
            <Divider />
            <Stack
              direction="row"
              spacing={2}
              sx={{
                justifyContent: 'space-between',
                alignItems: 'center',
                px: 2,
                py: 1.5,
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                {t('materials.total')}
              </Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                {formatMoney(total, i18n.language)}
              </Typography>
            </Stack>
          </>
        )}
      </Card>

      <MaterialFormDialog
        key={`${formOpen}-${editing?.id ?? 'create'}`}
        open={formOpen}
        projectId={projectId}
        material={editing}
        onClose={() => setFormOpen(false)}
        onSuccess={(message) => {
          setPage(1);
          notify({ message, severity: 'success' });
        }}
      />
      <DeleteMaterialDialog
        open={Boolean(deleting)}
        projectId={projectId}
        material={deleting}
        onClose={() => setDeleting(null)}
        onSuccess={(message) => {
          setPage(1);
          notify({ message, severity: 'success' });
        }}
      />
    </Stack>
  );
}
