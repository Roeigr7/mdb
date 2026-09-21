import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import RtlProvider from '@mui/system/RtlProvider';
import { useMemo, type ReactNode } from 'react';
import { useAppTranslation } from './useAppTranslation';
import { prefixer } from 'stylis';
import rtlPlugin from '@mui/stylis-plugin-rtl';
import { createAppTheme } from '../app/theme';
import { directionForLanguage } from './index';

const ltrCache = createCache({ key: 'mui' });
const rtlCache = createCache({
  key: 'muirtl',
  stylisPlugins: [prefixer, rtlPlugin],
});

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const { i18n } = useAppTranslation();
  const direction = directionForLanguage(i18n.language);
  const theme = useMemo(() => createAppTheme(direction), [direction]);

  return (
    <CacheProvider value={direction === 'rtl' ? rtlCache : ltrCache}>
      <RtlProvider value={direction === 'rtl'}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      </RtlProvider>
    </CacheProvider>
  );
}
