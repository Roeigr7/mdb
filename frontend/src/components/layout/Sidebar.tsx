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
import { NavLink, useLocation } from 'react-router-dom';
import {
  DRAWER_WIDTH,
  DRAWER_WIDTH_COLLAPSED,
} from '../../app/theme';
import { useAppTranslation } from '../../i18n/useAppTranslation';
import type { AppTranslationKey } from '../../i18n/useAppTranslation';
import { useLayout } from './LayoutContext';

const mainNav: Array<{
  labelKey: AppTranslationKey;
  path: string;
  icon: React.ReactNode;
}> = [
  { labelKey: 'nav.dashboard', path: '/dashboard', icon: <DashboardRoundedIcon /> },
  { labelKey: 'nav.projects', path: '/projects', icon: <FolderRoundedIcon /> },
  { labelKey: 'nav.materials', path: '/materials', icon: <Inventory2RoundedIcon /> },
  { labelKey: 'nav.suppliers', path: '/suppliers', icon: <LocalShippingRoundedIcon /> },
  { labelKey: 'nav.expenses', path: '/expenses', icon: <PaymentsRoundedIcon /> },
  { labelKey: 'nav.revenue', path: '/revenue', icon: <TrendingUpRoundedIcon /> },
  { labelKey: 'nav.reports', path: '/reports', icon: <InsightsRoundedIcon /> },
];

const secondaryNav: Array<{
  labelKey: AppTranslationKey;
  path: string;
  icon: React.ReactNode;
}> = [
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
          width: 34,
          height: 34,
          borderRadius: 1.5,
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          display: 'grid',
          placeItems: 'center',
          fontWeight: 700,
          fontSize: 12,
          letterSpacing: 0.4,
          flexShrink: 0,
        }}
      >
        MBD
      </Box>
      {!collapsed && (
        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="subtitle1"
            noWrap
            sx={{ lineHeight: 1.2, fontWeight: 700 }}
          >
            {t('app.name')}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {t('app.tagline')}
          </Typography>
        </Box>
      )}
    </Box>
  );
}

function NavSection({
  items,
  collapsed,
  onNavigate,
}: {
  items: Array<{
    labelKey: AppTranslationKey;
    path: string;
    icon: React.ReactNode;
  }>;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const { t } = useAppTranslation();
  const location = useLocation();

  return (
    <List sx={{ py: 1 }}>
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
              mx: collapsed ? 1 : 1,
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: collapsed ? 0 : 40,
                justifyContent: 'center',
                color: selected ? 'primary.main' : 'text.secondary',
              }}
            >
              {item.icon}
            </ListItemIcon>
            {!collapsed && <ListItemText primary={label} />}
          </ListItemButton>
        );

        return (
          <ListItem key={item.path} disablePadding sx={{ mb: 0.25 }}>
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
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Toolbar
        sx={{
          px: collapsed ? 1 : 2,
          gap: 1,
          minHeight: { xs: 64 },
          justifyContent: collapsed ? 'center' : 'space-between',
        }}
      >
        <BrandMark collapsed={collapsed} />
        {showCollapseToggle && !collapsed && (
          <IconButton
            size="small"
            onClick={toggleSidebarCollapsed}
            aria-label={t('header.collapseNav')}
          >
            <MenuOpenRoundedIcon fontSize="small" />
          </IconButton>
        )}
      </Toolbar>

      <Divider />

      <Box sx={{ flex: 1, overflowY: 'auto', py: 0.5 }}>
        <NavSection
          items={mainNav}
          collapsed={collapsed}
          onNavigate={onNavigate}
        />
        <Divider sx={{ mx: 2, my: 0.5 }} />
        <NavSection
          items={secondaryNav}
          collapsed={collapsed}
          onNavigate={onNavigate}
        />
      </Box>

      {showCollapseToggle && collapsed && (
        <Box sx={{ p: 1, display: 'grid', placeItems: 'center' }}>
          <Tooltip title={t('header.expandNav')} placement="right">
            <IconButton
              size="small"
              onClick={toggleSidebarCollapsed}
              aria-label={t('header.expandNav')}
              sx={{
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
