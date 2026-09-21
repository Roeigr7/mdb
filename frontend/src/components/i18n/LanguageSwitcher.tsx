import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { useAppTranslation } from '../../i18n/useAppTranslation';
import { isAppLanguage, type AppLanguage } from '../../i18n';

type LanguageSwitcherProps = {
  size?: 'small' | 'medium';
};

export function LanguageSwitcher({ size = 'small' }: LanguageSwitcherProps) {
  const { t, i18n } = useAppTranslation();
  const value: AppLanguage = i18n.language.startsWith('en') ? 'en' : 'he';

  return (
    <ToggleButtonGroup
      exclusive
      size={size}
      value={value}
      aria-label={t('language.label')}
      onChange={(_event, next: AppLanguage | null) => {
        if (isAppLanguage(next)) {
          void i18n.changeLanguage(next);
        }
      }}
    >
      <ToggleButton value="he">{t('language.he')}</ToggleButton>
      <ToggleButton value="en">{t('language.en')}</ToggleButton>
    </ToggleButtonGroup>
  );
}
