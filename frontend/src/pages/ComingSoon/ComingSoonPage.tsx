import ConstructionRoundedIcon from '@mui/icons-material/ConstructionRounded';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
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
      <Box>
        <Typography variant="h4" component="h1" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {description}
        </Typography>
      </Box>
      <Card>
        <CardContent sx={{ py: 8, textAlign: 'center' }}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 2,
              display: 'grid',
              placeItems: 'center',
              bgcolor: 'rgba(30, 58, 95, 0.08)',
              color: 'primary.main',
              mx: 'auto',
              mb: 2,
            }}
          >
            <ConstructionRoundedIcon />
          </Box>
          <Typography variant="h6" gutterBottom>
            {t('comingSoon.badge')}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 420, mx: 'auto' }}>
            {t('comingSoon.hint')}
          </Typography>
        </CardContent>
      </Card>
    </Stack>
  );
}
