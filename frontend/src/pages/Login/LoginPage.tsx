import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
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
        await register({ name: trimmedName, email: trimmedEmail, password }).unwrap();
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
        placeItems: 'center',
        px: 2,
        background: `
          radial-gradient(ellipse 80% 60% at 20% 10%, rgba(30, 58, 95, 0.12), transparent),
          radial-gradient(ellipse 60% 50% at 90% 80%, rgba(92, 107, 122, 0.1), transparent),
          #f5f7fa
        `,
      }}
    >
      <Card sx={{ width: '100%', maxWidth: 420 }}>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Stack
            direction="row"
            sx={{ justifyContent: 'flex-end', mb: 2 }}
          >
            <LanguageSwitcher />
          </Stack>
          <Stack spacing={0.5} sx={{ mb: 3 }}>
            <Typography
              variant="overline"
              color="primary"
              sx={{ letterSpacing: 1.2, fontWeight: 700 }}
            >
              {t('app.name')}
            </Typography>
            <Typography variant="h4" component="h1">
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

            <Button type="submit" variant="contained" size="large" disabled={busy}>
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
                >
                  {t('auth.signIn')}
                </Link>
              </>
            )}
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
