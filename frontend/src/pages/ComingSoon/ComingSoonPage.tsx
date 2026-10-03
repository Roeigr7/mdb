import ConstructionRoundedIcon from '@mui/icons-material/ConstructionRounded';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import { tokens } from '../../app/theme';
import { PageHeader } from '../../components/ui/PageHeader';
import { useAppTranslation } from '../../i18n/useAppTranslation';

type ComingSoonPageProps = {
  kind: 'suppliers' | 'settings';
};

export function ComingSoonPage({ kind }: ComingSoonPageProps) {
  const { t } = useAppTranslation();
  const title =
    kind === 'suppliers'
      ? t('comingSoon.suppliersTitle')
      : t('comingSoon.settingsTitle');
  const description =
    kind === 'suppliers'
      ? t('comingSoon.suppliersBody')
      : t('comingSoon.settingsBody');

  return (
    <Stack spacing={3}>
      <PageHeader title={title} subtitle={description} hideTitle />
      <Card>
        <CardContent sx={{ py: 8, textAlign: 'center' }}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 2.5,
              display: 'grid',
              placeItems: 'center',
              bgcolor: alpha(tokens.teal[600], 0.08),
              color: tokens.teal[600],
              border: `1px solid ${alpha(tokens.teal[600], 0.12)}`,
              mx: 'auto',
              mb: 2,
            }}
          >
            <ConstructionRoundedIcon />
          </Box>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
            {t('comingSoon.badge')}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ maxWidth: 420, mx: 'auto' }}
          >
            {t('comingSoon.hint')}
          </Typography>
        </CardContent>
      </Card>
    </Stack>
  );
}
