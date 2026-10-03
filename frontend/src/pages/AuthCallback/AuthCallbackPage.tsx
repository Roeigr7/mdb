import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Link as RouterLink,
  Navigate,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';
import { getErrorMessage } from '../../app/api/apiError';
import { useExchangeOAuthCodeMutation } from '../../app/features/auth/authApi';
import { establishSession } from '../../app/features/auth/establishSession';
import { selectIsAuthenticated } from '../../app/features/auth/authSlice';
import type { AppDispatch } from '../../app/store';
import { tokens } from '../../app/theme';
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
        const authTokens = await exchange({ code }).unwrap();
        await establishSession(dispatch, authTokens);
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

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        px: 2,
        background: `
          radial-gradient(ellipse 70% 50% at 20% 10%, ${alpha(tokens.teal[600], 0.1)}, transparent),
          ${tokens.slate[50]}
        `,
      }}
    >
      <Stack
        spacing={2.5}
        sx={{
          maxWidth: 420,
          width: '100%',
          textAlign: 'center',
          p: 4,
          borderRadius: 3,
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: 2,
        }}
      >
        {!code || error ? (
          <>
            <Alert severity="error">
              {error ?? t('auth.oauthInvalid')}
            </Alert>
            <Button component={RouterLink} to="/login" variant="contained">
              {t('auth.backToLogin')}
            </Button>
          </>
        ) : (
          <>
            <CircularProgress sx={{ mx: 'auto' }} />
            <Typography variant="h6">{t('auth.oauthCompleting')}</Typography>
            <Typography variant="body2" color="text.secondary">
              {isLoading ? t('common.pleaseWait') : t('common.pleaseWait')}
            </Typography>
          </>
        )}
      </Stack>
    </Box>
  );
}
