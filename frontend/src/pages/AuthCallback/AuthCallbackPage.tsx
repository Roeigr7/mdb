import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link as RouterLink, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { getErrorMessage } from '../../app/api/apiError';
import { useExchangeOAuthCodeMutation } from '../../app/features/auth/authApi';
import { establishSession } from '../../app/features/auth/establishSession';
import { selectIsAuthenticated } from '../../app/features/auth/authSlice';
import type { AppDispatch } from '../../app/store';
import { useAppTranslation } from '../../i18n/useAppTranslation';

export function AuthCallbackPage() {
  const { t } = useAppTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const [searchParams] = useSearchParams();
  const code = searchParams.get('code');
  const [exchange, { isLoading }] = useExchangeOAuthCodeMutation();
  const [error, setError] = useState<string | null>(null);
  const started = useRef(false);

  useEffect(() => {
    if (!code || started.current) return;
    started.current = true;

    void (async () => {
      try {
        const tokens = await exchange({ code }).unwrap();
        await establishSession(dispatch, tokens);
        navigate('/dashboard', { replace: true });
      } catch (err) {
        setError(
          getErrorMessage(err, t('auth.oauthFailed'), { preferFallback: true }),
        );
      }
    })();
  }, [code, dispatch, exchange, navigate, t]);

  if (isAuthenticated && !error) {
    return <Navigate to="/dashboard" replace />;
  }

  if (!code) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', px: 2 }}>
        <Stack spacing={2} sx={{ maxWidth: 420, width: '100%' }}>
          <Alert severity="error">{t('auth.oauthInvalid')}</Alert>
          <Button component={RouterLink} to="/login" variant="contained">
            {t('auth.backToLogin')}
          </Button>
        </Stack>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', px: 2 }}>
      <Stack spacing={2} sx={{ maxWidth: 420, width: '100%', textAlign: 'center' }}>
        {error ? (
          <>
            <Alert severity="error">{error}</Alert>
            <Button component={RouterLink} to="/login" variant="contained">
              {t('auth.backToLogin')}
            </Button>
          </>
        ) : (
          <>
            <CircularProgress sx={{ mx: 'auto' }} />
            <Typography variant="body1" color="text.secondary">
              {isLoading ? t('auth.oauthCompleting') : t('common.pleaseWait')}
            </Typography>
          </>
        )}
      </Stack>
    </Box>
  );
}
