import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useAppTranslation } from '../../i18n/useAppTranslation';

type PlaceholderPageProps = {
  page: 'expenses' | 'revenue';
};

export function PlaceholderPage({ page }: PlaceholderPageProps) {
  const { t } = useAppTranslation();
  const title =
    page === 'expenses'
      ? t('placeholders.expenses.title')
      : t('placeholders.revenue.title');
  const description =
    page === 'expenses'
      ? t('placeholders.expenses.description')
      : t('placeholders.revenue.description');

  return (
    <Stack spacing={2.5} sx={{ maxWidth: 640 }}>
      <Box>
        <Typography variant="h4" component="h1" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {description}
        </Typography>
      </Box>
      <Alert severity="info">{t('placeholders.planned')}</Alert>
      <Box>
        <Button variant="outlined" disabled>
          {t('placeholders.comingSoon')}
        </Button>
      </Box>
    </Stack>
  );
}
