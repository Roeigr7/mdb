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
import { tokens } from '../../app/theme';
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
      const authTokens = await login({
        email: trimmedEmail,
        password,
      }).unwrap();
      await establishSession(dispatch, authTokens);
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
        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
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
          backgroundColor: tokens.ink[900],
          backgroundImage: `
            radial-gradient(ellipse 80% 60% at 0% 0%, ${alpha(tokens.teal[600], 0.35)}, transparent 55%),
            radial-gradient(ellipse 60% 50% at 100% 100%, ${alpha(tokens.ink[700], 0.9)}, transparent 50%),
            linear-gradient(165deg, ${tokens.ink[800]} 0%, ${tokens.ink[900]} 55%, ${tokens.ink[950]} 100%)
          `,
        }}
      >
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            inset: 0,
            opacity: 0.12,
            backgroundImage: `
              linear-gradient(${alpha('#fff', 0.1)} 1px, transparent 1px),
              linear-gradient(90deg, ${alpha('#fff', 0.1)} 1px, transparent 1px)
            `,
            backgroundSize: '56px 56px',
            maskImage:
              'radial-gradient(ellipse 70% 60% at 40% 40%, #000 15%, transparent 70%)',
          }}
        />

        <Stack spacing={1.5} sx={{ position: 'relative', zIndex: 1 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2,
              display: 'grid',
              placeItems: 'center',
              fontWeight: 800,
              letterSpacing: 0.6,
              fontSize: 12,
              background: `linear-gradient(145deg, ${tokens.teal[500]} 0%, ${tokens.teal[700]} 100%)`,
              boxShadow: `0 4px 16px ${alpha(tokens.teal[600], 0.4)}`,
            }}
          >
            MBD
          </Box>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 800,
              letterSpacing: '-0.035em',
              maxWidth: 420,
              mt: 5,
              fontSize: { md: '2.5rem', lg: '2.875rem' },
              lineHeight: 1.15,
            }}
          >
            {t('app.name')}
          </Typography>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 500,
              color: alpha('#fff', 0.72),
              maxWidth: 400,
              lineHeight: 1.5,
              fontSize: '1.0625rem',
            }}
          >
            {t('auth.heroLine')}
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: alpha('#fff', 0.48), maxWidth: 380, lineHeight: 1.6 }}
          >
            {t('auth.heroSupport')}
          </Typography>
        </Stack>

        <Stack
          spacing={0.75}
          sx={{ position: 'relative', zIndex: 1, maxWidth: 360 }}
        >
          <Typography
            variant="overline"
            sx={{ color: alpha('#fff', 0.38), letterSpacing: '0.1em' }}
          >
            {t('auth.heroFootnoteLabel')}
          </Typography>
          <Typography variant="body2" sx={{ color: alpha('#fff', 0.55) }}>
            {t('auth.heroFootnote')}
          </Typography>
        </Stack>
      </Box>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          bgcolor: tokens.slate[50],
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
          <Box
            sx={{
              display: { xs: 'flex', md: 'none' },
              alignItems: 'center',
              gap: 1.25,
            }}
          >
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: 1.5,
                background: `linear-gradient(145deg, ${tokens.teal[500]} 0%, ${tokens.teal[700]} 100%)`,
                color: '#fff',
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
          <Box
            sx={{
              width: '100%',
              maxWidth: 400,
              p: { xs: 0, sm: 3.5 },
              borderRadius: 3,
              bgcolor: { sm: '#fff' },
              border: { sm: '1px solid' },
              borderColor: { sm: 'divider' },
              boxShadow: { sm: `0 1px 2px ${alpha(tokens.ink[900], 0.03)}` },
            }}
          >
            <Stack spacing={0.75} sx={{ mb: 3 }}>
              <Typography
                variant="h4"
                component="h1"
                sx={{ fontSize: '1.375rem', fontWeight: 800 }}
              >
                {mode === 'login' ? t('auth.signIn') : t('auth.createAccount')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('auth.subtitle')}
              </Typography>
            </Stack>

            <Stack spacing={2}>
              <OAuthButtons disabled={busy} />

              <Box
                component="form"
                noValidate
                onSubmit={handleSubmit}
                sx={{ display: 'grid', gap: 1.75 }}
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

            <Typography variant="body2" sx={{ mt: 2.5 }} color="text.secondary">
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
