import LockRoundedIcon from '@mui/icons-material/LockRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import TranslateRoundedIcon from '@mui/icons-material/TranslateRounded';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import { useEffect, useState, type FormEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getErrorMessage } from '../../app/api/apiError';
import {
  useChangePasswordMutation,
  useUpdateProfileMutation,
} from '../../app/features/auth/authApi';
import {
  selectCurrentUser,
  setUser,
} from '../../app/features/auth/authSlice';
import type { AppDispatch } from '../../app/store';
import { tokens } from '../../app/theme';
import { LanguageSwitcher } from '../../components/i18n/LanguageSwitcher';
import { useNotification } from '../../components/feedback/NotificationProvider';
import { PageHeader } from '../../components/ui/PageHeader';
import { useAppTranslation } from '../../i18n/useAppTranslation';

function SectionHeader({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start', mb: 2.5 }}>
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: 2,
          display: 'grid',
          placeItems: 'center',
          bgcolor: alpha(tokens.teal[600], 0.08),
          color: tokens.teal[600],
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </Box>
    </Stack>
  );
}

export function SettingsPage() {
  const { t } = useAppTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { notify } = useNotification();
  const user = useSelector(selectCurrentUser);

  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [profileError, setProfileError] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [updateProfile, profileState] = useUpdateProfileMutation();
  const [changePassword, passwordState] = useChangePasswordMutation();

  useEffect(() => {
    if (!user) return;
    setName(user.name);
    setEmail(user.email);
  }, [user]);

  const hasPassword = user?.hasPassword !== false;

  async function handleProfileSubmit(event: FormEvent) {
    event.preventDefault();
    if (!user) return;
    setProfileError(null);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      setProfileError(t('settings.nameRequired'));
      return;
    }
    if (!trimmedEmail.includes('@')) {
      setProfileError(t('settings.emailRequired'));
      return;
    }

    try {
      const updated = await updateProfile({
        id: user.id,
        body: { name: trimmedName, email: trimmedEmail },
      }).unwrap();
      dispatch(setUser(updated));
      notify({ message: t('settings.profileUpdated'), severity: 'success' });
    } catch (err) {
      setProfileError(getErrorMessage(err, t('settings.profileFailed')));
    }
  }

  async function handlePasswordSubmit(event: FormEvent) {
    event.preventDefault();
    setPasswordError(null);

    if (newPassword.length < 8) {
      setPasswordError(t('settings.passwordTooShort'));
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError(t('settings.passwordMismatch'));
      return;
    }
    if (hasPassword && !currentPassword) {
      setPasswordError(t('settings.currentPasswordRequired'));
      return;
    }

    try {
      await changePassword({
        ...(hasPassword ? { currentPassword } : {}),
        newPassword,
      }).unwrap();
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      notify({ message: t('settings.passwordUpdated'), severity: 'success' });
    } catch (err) {
      setPasswordError(getErrorMessage(err, t('settings.passwordFailed')));
    }
  }

  if (!user) {
    return (
      <Alert severity="warning">{t('settings.notSignedIn')}</Alert>
    );
  }

  return (
    <Stack spacing={3}>
      <PageHeader
        title={t('settings.title')}
        subtitle={t('settings.subtitle')}
        hideTitle
      />

      <Card>
        <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
          <SectionHeader
            icon={<PersonRoundedIcon fontSize="small" />}
            title={t('settings.profileTitle')}
            description={t('settings.profileBody')}
          />
          <Box
            component="form"
            noValidate
            onSubmit={handleProfileSubmit}
            sx={{ display: 'grid', gap: 2, maxWidth: 480 }}
          >
            <TextField
              label={t('settings.name')}
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              fullWidth
            />
            <TextField
              label={t('settings.email')}
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              fullWidth
            />
            {profileError && (
              <Alert severity="error" role="alert">
                {profileError}
              </Alert>
            )}
            <Box>
              <Button
                type="submit"
                variant="contained"
                disabled={profileState.isLoading}
              >
                {profileState.isLoading
                  ? t('common.saving')
                  : t('settings.saveProfile')}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Card>
        <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
          <SectionHeader
            icon={<TranslateRoundedIcon fontSize="small" />}
            title={t('settings.languageTitle')}
            description={t('settings.languageBody')}
          />
          <LanguageSwitcher size="medium" />
        </CardContent>
      </Card>

      <Card>
        <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
          <SectionHeader
            icon={<LockRoundedIcon fontSize="small" />}
            title={
              hasPassword
                ? t('settings.passwordTitle')
                : t('settings.setPasswordTitle')
            }
            description={
              hasPassword
                ? t('settings.passwordBody')
                : t('settings.setPasswordBody')
            }
          />
          <Box
            component="form"
            noValidate
            onSubmit={handlePasswordSubmit}
            sx={{ display: 'grid', gap: 2, maxWidth: 480 }}
          >
            {hasPassword && (
              <TextField
                label={t('settings.currentPassword')}
                type="password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                autoComplete="current-password"
                fullWidth
              />
            )}
            <TextField
              label={t('settings.newPassword')}
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              helperText={t('settings.passwordHint')}
              autoComplete="new-password"
              fullWidth
            />
            <TextField
              label={t('settings.confirmPassword')}
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              autoComplete="new-password"
              fullWidth
            />
            {passwordError && (
              <Alert severity="error" role="alert">
                {passwordError}
              </Alert>
            )}
            <Box>
              <Button
                type="submit"
                variant="contained"
                disabled={passwordState.isLoading}
              >
                {passwordState.isLoading
                  ? t('common.saving')
                  : hasPassword
                    ? t('settings.changePassword')
                    : t('settings.setPassword')}
              </Button>
            </Box>
          </Box>
          <Divider sx={{ my: 3 }} />
          <Typography variant="caption" color="text.secondary">
            {t('settings.accountMeta', { id: user.id })}
          </Typography>
        </CardContent>
      </Card>
    </Stack>
  );
}
