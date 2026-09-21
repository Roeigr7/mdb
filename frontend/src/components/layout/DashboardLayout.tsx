import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import { useMemo, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import {
  DRAWER_WIDTH,
  DRAWER_WIDTH_COLLAPSED,
} from '../../app/theme';
import { useAppTranslation } from '../../i18n/useAppTranslation';
import { Header } from './Header';
import { LayoutProvider, useLayout } from './LayoutContext';
import { Sidebar } from './Sidebar';

function LayoutShell() {
  const { t } = useAppTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { sidebarCollapsed } = useLayout();
  const drawerWidth = sidebarCollapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH;

  const title = useMemo(() => {
    const pathname = location.pathname;
    if (pathname.startsWith('/projects/') && pathname !== '/projects') {
      return t('projectDetails.title');
    }
    if (pathname.startsWith('/projects')) return t('projects.title');
    if (pathname.startsWith('/materials')) return t('materials.title');
    if (pathname.startsWith('/suppliers')) return t('comingSoon.suppliersTitle');
    if (pathname.startsWith('/expenses')) return t('expenses.title');
    if (pathname.startsWith('/revenue')) return t('revenue.title');
    if (pathname.startsWith('/reports') || pathname.startsWith('/analytics')) {
      return t('analytics.title');
    }
    if (pathname.startsWith('/settings')) return t('comingSoon.settingsTitle');
    if (pathname.startsWith('/dashboard')) return t('dashboard.title');
    return t('header.fallbackTitle');
  }, [location.pathname, t]);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Header
        title={title}
        onMenuClick={() => setMobileOpen((open) => !open)}
      />
      <Sidebar
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          bgcolor: 'background.default',
          minHeight: '100vh',
          transition: (theme) =>
            theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
        }}
      >
        <Toolbar />
        <Box sx={{ p: { xs: 2, sm: 3 } }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}

export function DashboardLayout() {
  return (
    <LayoutProvider>
      <LayoutShell />
    </LayoutProvider>
  );
}
