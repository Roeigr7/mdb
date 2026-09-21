import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { useEffect, useRef, type ReactNode } from 'react';
import { useDispatch, useSelector, useStore } from 'react-redux';
import { bootstrapAuth } from '../../app/features/auth/authBootstrap';
import { selectIsAuthInitializing } from '../../app/features/auth/authSlice';
import type { AppDispatch, RootState } from '../../app/store';
import { useAppTranslation } from '../../i18n/useAppTranslation';

type AuthBootstrapProps = {
  children: ReactNode;
};

/**
 * Restores the session from stored tokens via GET /users/me before routing.
 */
export function AuthBootstrap({ children }: AuthBootstrapProps) {
  const { t } = useAppTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const store = useStore<RootState>();
  const isInitializing = useSelector(selectIsAuthInitializing);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    void bootstrapAuth(dispatch, store.getState);
  }, [dispatch, store]);

  if (isInitializing) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
        }}
        role="status"
        aria-label={t('common.pleaseWait')}
      >
        <CircularProgress />
      </Box>
    );
  }

  return children;
}
