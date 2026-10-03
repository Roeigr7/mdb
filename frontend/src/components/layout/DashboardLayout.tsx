import Box from '@mui/material/Box';
import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import {
  DRAWER_WIDTH,
  DRAWER_WIDTH_COLLAPSED,
  HEADER_HEIGHT,
} from '../../app/theme';
import { Header } from './Header';
import { LayoutProvider, useLayout } from './LayoutContext';
import { Sidebar } from './Sidebar';
import { usePageMeta } from './usePageMeta';

function LayoutShell() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { sidebarCollapsed } = useLayout();
  const drawerWidth = sidebarCollapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH;
  const { title, breadcrumbs } = usePageMeta();

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Header
        title={title}
        breadcrumbs={breadcrumbs}
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
          width: { lg: `calc(100% - ${drawerWidth}px)` },
          bgcolor: 'background.default',
          minHeight: '100vh',
          transition: (theme) =>
            theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
        }}
      >
        <Box sx={{ height: HEADER_HEIGHT, flexShrink: 0 }} />
        <Box
          className="mbd-page-enter"
          key={location.pathname}
          sx={{
            p: { xs: 2, sm: 2.5, lg: 3 },
            maxWidth: 1440,
            mx: 'auto',
            width: '100%',
          }}
        >
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
