import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import { useState, type FormEvent } from 'react';
import { useDispatch } from 'react-redux';
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router-dom';
import { getErrorMessage } from '../../app/api/apiError';
import {
  useLoginMutation,
  useRegisterMutation,
} from '../../app/features/auth/authApi';
import { establishSession } from '../../app/features/auth/establishSession';
import { mapOAuthErrorCode } from '../../app/features/auth/oauthErrors';
import type { AppDispatch } from '../../app/store';
import { OAuthButtons } from '../../components/auth/OAuthButtons';
import { LanguageSwitcher } from '../../components/i18n/LanguageSwitcher';
import { useAppTranslation } from '../../i18n/useAppTranslation';

type LoginPageProps = {
  initialMode?: 'login' | 'register';
};

export function LoginPage({ initialMode = 'login' }: LoginPageProps) {
  const { t } = useAppTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(() =>
    mapOAuthErrorCode(searchParams.get('error'), t),
  );

  const [login, { isLoading: isLoggingIn }] = useLoginMutation();
  const [register, { isLoading: isRegistering }] = useRegisterMutation();

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (mode === 'register' && !trimmedName) {
      setFormError(t('auth.nameRequired'));
      return;
    }
    if (!trimmedEmail.includes('@')) {
      setFormError(t('auth.emailRequired'));
      return;
    }
    if (!password) {
      setFormError(t('auth.missingFields'));
      return;
    }
    if (password.length < 8) {
      setFormError(t('auth.passwordTooShort'));
      return;
    }

    try {
      if (mode === 'register') {
        await register({
          name: trimmedName,
          email: trimmedEmail,
          password,
        }).unwrap();
      }
      const tokens = await login({
        email: trimmedEmail,
        password,
      }).unwrap();
      await establishSession(dispatch, tokens);
      navigate('/dashboard', { replace: true });
    } catch (error) {
      setFormError(getErrorMessage(error, t('auth.failed')));
    }
  }

  const busy = isLoggingIn || isRegistering;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '1.05fr 0.95fr' },
      }}
    >
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          position: 'relative',
          overflow: 'hidden',
          flexDirection: 'column',
          justifyContent: 'space-between',
          p: { md: 5, lg: 7 },
          color: '#fff',
          backgroundColor: '#0b1f3a',
          backgroundImage: `
            radial-gradient(ellipse 90% 70% at 10% 15%, ${alpha('#2b4c7e', 0.7)}, transparent 55%),
            radial-gradient(ellipse 70% 60% at 90% 85%, ${alpha('#16375f', 0.9)}, transparent 50%),
            linear-gradient(160deg, #0b1f3a 0%, #132740 55%, #0f2440 100%)
          `,
        }}
      >
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            inset: 0,
            opacity: 0.18,
            backgroundImage: `
              linear-gradient(${alpha('#fff', 0.08)} 1px, transparent 1px),
              linear-gradient(90deg, ${alpha('#fff', 0.08)} 1px, transparent 1px)
            `,
            backgroundSize: '48px 48px',
            maskImage:
              'radial-gradient(ellipse 80% 70% at 50% 40%, #000 20%, transparent 75%)',
          }}
        />

        <Stack spacing={1.5} sx={{ position: 'relative', zIndex: 1 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              display: 'grid',
              placeItems: 'center',
              fontWeight: 800,
              letterSpacing: 0.6,
              bgcolor: alpha('#fff', 0.1),
              border: `1px solid ${alpha('#fff', 0.16)}`,
            }}
          >
            MBD
          </Box>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 800,
              letterSpacing: '-0.03em',
              maxWidth: 420,
              mt: 4,
              fontSize: { md: '2.6rem', lg: '3rem' },
            }}
          >
            {t('app.name')}
          </Typography>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 500,
              color: alpha('#fff', 0.78),
              maxWidth: 420,
              lineHeight: 1.5,
            }}
          >
            {t('auth.heroLine')}
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: alpha('#fff', 0.55), maxWidth: 400 }}
          >
            {t('auth.heroSupport')}
          </Typography>
        </Stack>

        <Stack
          spacing={1}
          sx={{ position: 'relative', zIndex: 1, maxWidth: 360 }}
        >
          <Typography variant="overline" sx={{ color: alpha('#fff', 0.45) }}>
            {t('auth.heroFootnoteLabel')}
          </Typography>
          <Typography variant="body2" sx={{ color: alpha('#fff', 0.65) }}>
            {t('auth.heroFootnote')}
          </Typography>
        </Stack>
      </Box>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          bgcolor: 'background.default',
          px: { xs: 2.5, sm: 4 },
          py: { xs: 3, sm: 4 },
        }}
      >
        <Stack
          direction="row"
          sx={{
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: { xs: 3, md: 2 },
          }}
        >
          <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: 1.5,
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                display: 'grid',
                placeItems: 'center',
                fontWeight: 800,
                fontSize: 11,
              }}
            >
              MBD
            </Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              {t('app.name')}
            </Typography>
          </Box>
          <Box sx={{ marginInlineStart: 'auto' }}>
            <LanguageSwitcher />
          </Box>
        </Stack>

        <Box
          sx={{
            flex: 1,
            display: 'grid',
            placeItems: 'center',
            width: '100%',
          }}
        >
          <Box sx={{ width: '100%', maxWidth: 420 }}>
            <Stack spacing={0.75} sx={{ mb: 3.5 }}>
              <Typography variant="h4" component="h1">
                {mode === 'login' ? t('auth.signIn') : t('auth.createAccount')}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {t('auth.subtitle')}
              </Typography>
            </Stack>

            <Stack spacing={2.25}>
              <OAuthButtons disabled={busy} />

              <Box
                component="form"
                noValidate
                onSubmit={handleSubmit}
                sx={{ display: 'grid', gap: 2 }}
              >
                {mode === 'register' && (
                  <TextField
                    label={t('auth.name')}
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    required
                    autoComplete="name"
                    fullWidth
                  />
                )}
                <TextField
                  label={t('auth.email')}
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  autoComplete="email"
                  fullWidth
                />
                <TextField
                  label={t('auth.password')}
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  helperText={t('auth.passwordHint')}
                  autoComplete={
                    mode === 'login' ? 'current-password' : 'new-password'
                  }
                  fullWidth
                />

                {formError && (
                  <Alert severity="error" role="alert">
                    {formError}
                  </Alert>
                )}

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={busy}
                  sx={{ mt: 0.5 }}
                >
                  {busy
                    ? t('common.pleaseWait')
                    : mode === 'login'
                      ? t('auth.signIn')
                      : t('auth.register')}
                </Button>
              </Box>
            </Stack>

            <Typography variant="body2" sx={{ mt: 3 }} color="text.secondary">
              {mode === 'login' ? (
                <>
                  {t('auth.noAccount')}{' '}
                  <Link
                    component={RouterLink}
                    to="/register"
                    onClick={() => {
                      setMode('register');
                      setFormError(null);
                    }}
                    sx={{ fontWeight: 600 }}
                  >
                    {t('auth.register')}
                  </Link>
                </>
              ) : (
                <>
                  {t('auth.alreadyRegistered')}{' '}
                  <Link
                    component={RouterLink}
                    to="/login"
                    onClick={() => {
                      setMode('login');
                      setFormError(null);
                    }}
                    sx={{ fontWeight: 600 }}
                  >
                    {t('auth.signIn')}
                  </Link>
                </>
              )}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
