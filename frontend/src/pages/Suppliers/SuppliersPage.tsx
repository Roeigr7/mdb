import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import LocalShippingRoundedIcon from '@mui/icons-material/LocalShippingRounded';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import { useMemo, useState, type FormEvent } from 'react';
import { getErrorMessage } from '../../app/api/apiError';
import type { Supplier } from '../../app/features/suppliers/suppliers.types';
import { useGetSuppliersQuery } from '../../app/features/suppliers/suppliersApi';
import { useNotification } from '../../components/feedback/NotificationProvider';
import { PageHeader } from '../../components/ui/PageHeader';
import { formatDate } from '../../i18n/format';
import { useAppTranslation } from '../../i18n/useAppTranslation';
import { DeleteSupplierDialog } from './DeleteSupplierDialog';
import { SupplierFormDialog } from './SupplierFormDialog';

export function SuppliersPage() {
  const { t, i18n } = useAppTranslation();
  const { notify } = useNotification();
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState<string | undefined>();

  const { data, isLoading, isError, error, refetch, isFetching } =
    useGetSuppliersQuery({
      limit: 100,
      sortBy: 'name',
      sortOrder: 'asc',
      ...(search ? { search } : {}),
    });

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [deleting, setDeleting] = useState<Supplier | null>(null);

  const suppliers = data?.data ?? [];
  const subtitle = useMemo(() => {
    if (search) return t('suppliers.searchResults', { query: search });
    if (isFetching && !isLoading) {
      return `${t('suppliers.subtitle')} ${t('projects.updating')}`;
    }
    return t('suppliers.subtitle');
  }, [isFetching, isLoading, search, t]);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(supplier: Supplier) {
    setEditing(supplier);
    setFormOpen(true);
  }

  function handleSearchSubmit(event: FormEvent) {
    event.preventDefault();
    const q = searchInput.trim();
    setSearch(q || undefined);
  }

  return (
    <Stack spacing={3}>
      <PageHeader
        title={t('suppliers.title')}
        subtitle={subtitle}
        hideTitle
        actions={
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={openCreate}
          >
            {t('suppliers.create')}
          </Button>
        }
      />

      <Box
        component="form"
        onSubmit={handleSearchSubmit}
        sx={{ maxWidth: 360 }}
      >
        <TextField
          size="small"
          fullWidth
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          placeholder={t('suppliers.searchPlaceholder')}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon sx={{ fontSize: 18 }} color="action" />
                </InputAdornment>
              ),
            },
          }}
        />
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
          {getErrorMessage(error, t('suppliers.loadError'))}
        </Alert>
      )}

      <Card>
        {isLoading ? (
          <Box sx={{ display: 'grid', placeItems: 'center', py: 8 }}>
            <CircularProgress size={36} />
          </Box>
        ) : suppliers.length === 0 ? (
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
              <LocalShippingRoundedIcon />
            </Box>
            <Typography variant="h6" gutterBottom>
              {search
                ? t('suppliers.searchEmptyTitle')
                : t('suppliers.emptyTitle')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {search
                ? t('suppliers.searchEmptyBody', { query: search })
                : t('suppliers.emptyBody')}
            </Typography>
            {!search && (
              <Button
                variant="contained"
                startIcon={<AddRoundedIcon />}
                onClick={openCreate}
              >
                {t('suppliers.create')}
              </Button>
            )}
          </Box>
        ) : (
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table size="medium" sx={{ minWidth: 720 }}>
              <TableHead>
                <TableRow>
                  <TableCell>{t('suppliers.name')}</TableCell>
                  <TableCell>{t('suppliers.email')}</TableCell>
                  <TableCell>{t('suppliers.phone')}</TableCell>
                  <TableCell>{t('suppliers.notes')}</TableCell>
                  <TableCell>{t('suppliers.updated')}</TableCell>
                  <TableCell align="right">{t('common.actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {suppliers.map((supplier) => (
                  <TableRow key={supplier.id} hover>
                    <TableCell>
                      <Typography variant="subtitle2">{supplier.name}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {supplier.email || t('common.none')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {supplier.phone || t('common.none')}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ maxWidth: 240 }}>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {supplier.notes || t('common.none')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(supplier.updatedAt, i18n.language)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title={t('common.edit')}>
                        <IconButton
                          size="small"
                          onClick={() => openEdit(supplier)}
                          aria-label={t('suppliers.editAria', {
                            name: supplier.name,
                          })}
                        >
                          <EditOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={t('common.delete')}>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => setDeleting(supplier)}
                          aria-label={t('suppliers.deleteAria', {
                            name: supplier.name,
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

      <SupplierFormDialog
        key={`${formOpen}-${editing?.id ?? 'create'}`}
        open={formOpen}
        supplier={editing}
        onClose={() => setFormOpen(false)}
        onSuccess={(message) => notify({ message, severity: 'success' })}
      />

      <DeleteSupplierDialog
        open={Boolean(deleting)}
        supplier={deleting}
        onClose={() => setDeleting(null)}
        onSuccess={(message) => notify({ message, severity: 'success' })}
      />
    </Stack>
  );
}
