import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useGetOAuthProvidersQuery } from '../../app/features/auth/authApi';
import { useAppTranslation } from '../../i18n/useAppTranslation';
import { FacebookIcon, GoogleIcon } from './OAuthIcons';
import {
  resolveOAuthButtonVisibility,
  type OAuthProvidersQueryStatus,
} from './oauthProvidersVisibility';

function apiBaseUrl() {
  return (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ?? '';
}

type OAuthButtonsProps = {
  disabled?: boolean;
};

export function OAuthButtons({ disabled = false }: OAuthButtonsProps) {
  const { t } = useAppTranslation();
  const base = apiBaseUrl();
  const { data: providers, isLoading, isError, isSuccess } =
    useGetOAuthProvidersQuery();

  const status: OAuthProvidersQueryStatus = isLoading
    ? 'pending'
    : isError
      ? 'error'
      : isSuccess
        ? 'success'
        : 'pending';

  const { showGoogle, showFacebook } = resolveOAuthButtonVisibility(
    providers,
    status,
  );

  if (!showGoogle && !showFacebook) {
    return null;
  }

  return (
    <Stack spacing={1.5}>
      {showGoogle && (
        <Button
          fullWidth
          variant="outlined"
          size="large"
          disabled={disabled || !base}
          startIcon={<GoogleIcon />}
          href={`${base}/auth/google`}
          sx={{ justifyContent: 'center' }}
        >
          {t('auth.continueGoogle')}
        </Button>
      )}
      {showFacebook && (
        <Button
          fullWidth
          variant="outlined"
          size="large"
          disabled={disabled || !base}
          startIcon={<FacebookIcon />}
          href={`${base}/auth/facebook`}
          sx={{ justifyContent: 'center' }}
        >
          {t('auth.continueFacebook')}
        </Button>
      )}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 0.5 }}>
        <Divider sx={{ flex: 1 }} />
        <Typography variant="body2" color="text.secondary">
          {t('auth.or')}
        </Typography>
        <Divider sx={{ flex: 1 }} />
      </Box>
    </Stack>
  );
}
