import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import FolderRoundedIcon from '@mui/icons-material/FolderRounded';
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';
import LocalShippingRoundedIcon from '@mui/icons-material/LocalShippingRounded';
import MenuOpenRoundedIcon from '@mui/icons-material/MenuOpenRounded';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import type { ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  DRAWER_WIDTH,
  DRAWER_WIDTH_COLLAPSED,
  SIDEBAR_BG,
  SIDEBAR_BG_ELEVATED,
} from '../../app/theme';
import type { AppTranslationKey } from '../../i18n/useAppTranslation';
import { useAppTranslation } from '../../i18n/useAppTranslation';
import { useLayout } from './LayoutContext';

type NavItem = {
  labelKey: AppTranslationKey;
  path: string;
  icon: ReactNode;
};

const generalNav: NavItem[] = [
  { labelKey: 'nav.dashboard', path: '/dashboard', icon: <DashboardRoundedIcon /> },
  { labelKey: 'nav.projects', path: '/projects', icon: <FolderRoundedIcon /> },
  { labelKey: 'nav.reports', path: '/reports', icon: <InsightsRoundedIcon /> },
];

const managementNav: NavItem[] = [
  { labelKey: 'nav.materials', path: '/materials', icon: <Inventory2RoundedIcon /> },
  { labelKey: 'nav.suppliers', path: '/suppliers', icon: <LocalShippingRoundedIcon /> },
  { labelKey: 'nav.expenses', path: '/expenses', icon: <PaymentsRoundedIcon /> },
  { labelKey: 'nav.revenue', path: '/revenue', icon: <TrendingUpRoundedIcon /> },
];

const systemNav: NavItem[] = [
  { labelKey: 'nav.settings', path: '/settings', icon: <SettingsRoundedIcon /> },
];

type SidebarProps = {
  mobileOpen: boolean;
  onClose: () => void;
};

function BrandMark({ collapsed }: { collapsed: boolean }) {
  const { t } = useAppTranslation();

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.25,
        minWidth: 0,
        px: collapsed ? 0 : 0.5,
        justifyContent: collapsed ? 'center' : 'flex-start',
      }}
    >
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: 2,
          bgcolor: alpha('#fff', 0.12),
          color: '#fff',
          display: 'grid',
          placeItems: 'center',
          fontWeight: 800,
          fontSize: 12,
          letterSpacing: 0.5,
          flexShrink: 0,
          border: `1px solid ${alpha('#fff', 0.16)}`,
        }}
      >
        MBD
      </Box>
      {!collapsed && (
        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="subtitle1"
            noWrap
            sx={{ lineHeight: 1.2, fontWeight: 700, color: '#fff' }}
          >
            {t('app.name')}
          </Typography>
          <Typography
            variant="caption"
            noWrap
            sx={{ color: alpha('#fff', 0.55) }}
          >
            {t('app.tagline')}
          </Typography>
        </Box>
      )}
    </Box>
  );
}

function NavSection({
  titleKey,
  items,
  collapsed,
  onNavigate,
}: {
  titleKey?: AppTranslationKey;
  items: NavItem[];
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const { t } = useAppTranslation();
  const location = useLocation();

  return (
    <Box sx={{ mb: 1 }}>
      {titleKey && !collapsed && (
        <Typography
          variant="overline"
          sx={{
            display: 'block',
            px: 2.5,
            pt: 1.5,
            pb: 0.75,
            color: alpha('#fff', 0.42),
          }}
        >
          {t(titleKey)}
        </Typography>
      )}
      <List sx={{ py: 0.25 }}>
        {items.map((item) => {
          const selected =
            location.pathname === item.path ||
            (item.path !== '/dashboard' &&
              location.pathname.startsWith(item.path));
          const label = t(item.labelKey);

          const button = (
            <ListItemButton
              component={NavLink}
              to={item.path}
              selected={selected}
              onClick={onNavigate}
              sx={{
                justifyContent: collapsed ? 'center' : 'flex-start',
                px: collapsed ? 1 : 1.5,
                mx: 1.25,
                color: selected ? '#fff' : alpha('#fff', 0.72),
                bgcolor: selected ? alpha('#fff', 0.12) : 'transparent',
                border: `1px solid ${selected ? alpha('#fff', 0.08) : 'transparent'}`,
                '&:hover': {
                  bgcolor: alpha('#fff', 0.08),
                  color: '#fff',
                },
                '&.Mui-selected:hover': {
                  bgcolor: alpha('#fff', 0.16),
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: collapsed ? 0 : 40,
                  justifyContent: 'center',
                  color: 'inherit',
                }}
              >
                {item.icon}
              </ListItemIcon>
              {!collapsed && (
                <ListItemText
                  primary={label}
                  sx={{
                    '& .MuiListItemText-primary': {
                      fontWeight: selected ? 650 : 500,
                      fontSize: '0.9rem',
                    },
                  }}
                />
              )}
            </ListItemButton>
          );

          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.35 }}>
              {collapsed ? (
                <Tooltip title={label} placement="right">
                  {button}
                </Tooltip>
              ) : (
                button
              )}
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
}

function SidebarContent({
  collapsed,
  onNavigate,
  showCollapseToggle,
}: {
  collapsed: boolean;
  onNavigate?: () => void;
  showCollapseToggle?: boolean;
}) {
  const { t } = useAppTranslation();
  const { toggleSidebarCollapsed } = useLayout();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        bgcolor: SIDEBAR_BG,
        backgroundImage: `
          radial-gradient(ellipse 120% 80% at 0% 0%, ${alpha('#2b4c7e', 0.45)}, transparent 55%),
          linear-gradient(180deg, ${SIDEBAR_BG_ELEVATED} 0%, ${SIDEBAR_BG} 42%)
        `,
        color: '#fff',
      }}
    >
      <Toolbar
        sx={{
          px: collapsed ? 1 : 2,
          gap: 1,
          minHeight: { xs: 72 },
          justifyContent: collapsed ? 'center' : 'space-between',
        }}
      >
        <BrandMark collapsed={collapsed} />
        {showCollapseToggle && !collapsed && (
          <IconButton
            size="small"
            onClick={toggleSidebarCollapsed}
            aria-label={t('header.collapseNav')}
            sx={{ color: alpha('#fff', 0.7), '&:hover': { color: '#fff' } }}
          >
            <MenuOpenRoundedIcon fontSize="small" />
          </IconButton>
        )}
      </Toolbar>

      <Divider sx={{ borderColor: alpha('#fff', 0.08) }} />

      <Box sx={{ flex: 1, overflowY: 'auto', py: 1 }}>
        <NavSection
          titleKey="nav.sectionGeneral"
          items={generalNav}
          collapsed={collapsed}
          onNavigate={onNavigate}
        />
        <NavSection
          titleKey="nav.sectionManagement"
          items={managementNav}
          collapsed={collapsed}
          onNavigate={onNavigate}
        />
        <Divider sx={{ mx: 2.5, my: 1, borderColor: alpha('#fff', 0.08) }} />
        <NavSection
          titleKey="nav.sectionSystem"
          items={systemNav}
          collapsed={collapsed}
          onNavigate={onNavigate}
        />
      </Box>

      {showCollapseToggle && collapsed && (
        <Box sx={{ p: 1.25, display: 'grid', placeItems: 'center' }}>
          <Tooltip title={t('header.expandNav')} placement="right">
            <IconButton
              size="small"
              onClick={toggleSidebarCollapsed}
              aria-label={t('header.expandNav')}
              sx={{
                color: alpha('#fff', 0.7),
                transform: (theme) =>
                  theme.direction === 'rtl' ? 'none' : 'scaleX(-1)',
              }}
            >
              <MenuOpenRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      )}
    </Box>
  );
}

export function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  const { t } = useAppTranslation();
  const { sidebarCollapsed } = useLayout();
  const desktopWidth = sidebarCollapsed
    ? DRAWER_WIDTH_COLLAPSED
    : DRAWER_WIDTH;

  return (
    <Box
      component="nav"
      sx={{ width: { md: desktopWidth }, flexShrink: { md: 0 } }}
      aria-label={t('nav.aria')}
    >
      <Drawer
        variant="temporary"
        anchor="left"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: DRAWER_WIDTH,
            bgcolor: SIDEBAR_BG,
            border: 'none',
          },
        }}
      >
        <SidebarContent collapsed={false} onNavigate={onClose} />
      </Drawer>

      <Drawer
        variant="permanent"
        anchor="left"
        open
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: desktopWidth,
            overflowX: 'hidden',
            bgcolor: SIDEBAR_BG,
            border: 'none',
            transition: (theme) =>
              theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
          },
        }}
      >
        <SidebarContent collapsed={sidebarCollapsed} showCollapseToggle />
      </Drawer>
    </Box>
  );
}
