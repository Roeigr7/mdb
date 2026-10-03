import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import FolderRoundedIcon from '@mui/icons-material/FolderRounded';
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';
import KeyboardDoubleArrowLeftRoundedIcon from '@mui/icons-material/KeyboardDoubleArrowLeftRounded';
import LocalShippingRoundedIcon from '@mui/icons-material/LocalShippingRounded';
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
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import type { ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  DRAWER_WIDTH,
  DRAWER_WIDTH_COLLAPSED,
  HEADER_HEIGHT,
  SIDEBAR_BG,
  SIDEBAR_BG_ELEVATED,
  tokens,
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
  { labelKey: 'nav.dashboard', path: '/dashboard', icon: <DashboardRoundedIcon fontSize="small" /> },
  { labelKey: 'nav.projects', path: '/projects', icon: <FolderRoundedIcon fontSize="small" /> },
  { labelKey: 'nav.reports', path: '/reports', icon: <InsightsRoundedIcon fontSize="small" /> },
];

const managementNav: NavItem[] = [
  { labelKey: 'nav.materials', path: '/materials', icon: <Inventory2RoundedIcon fontSize="small" /> },
  { labelKey: 'nav.suppliers', path: '/suppliers', icon: <LocalShippingRoundedIcon fontSize="small" /> },
  { labelKey: 'nav.expenses', path: '/expenses', icon: <PaymentsRoundedIcon fontSize="small" /> },
  { labelKey: 'nav.revenue', path: '/revenue', icon: <TrendingUpRoundedIcon fontSize="small" /> },
];

const systemNav: NavItem[] = [
  { labelKey: 'nav.settings', path: '/settings', icon: <SettingsRoundedIcon fontSize="small" /> },
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
        gap: 1.5,
        minWidth: 0,
        px: collapsed ? 0 : 0.25,
        justifyContent: collapsed ? 'center' : 'flex-start',
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
          letterSpacing: 0.6,
          flexShrink: 0,
          boxShadow: `0 2px 8px ${alpha(tokens.teal[600], 0.35)}`,
        }}
      >
        MBD
      </Box>
      {!collapsed && (
        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="subtitle2"
            noWrap
            sx={{
              lineHeight: 1.15,
              fontWeight: 700,
              color: '#fff',
              fontSize: '0.875rem',
              letterSpacing: '-0.01em',
            }}
          >
            {t('app.name')}
          </Typography>
          <Typography
            variant="caption"
            noWrap
            sx={{ color: alpha('#fff', 0.45), fontSize: '0.6875rem' }}
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
    <Box sx={{ mb: 0.5 }}>
      {titleKey && !collapsed && (
        <Typography
          variant="overline"
          sx={{
            display: 'block',
            px: 2.25,
            pt: 1.75,
            pb: 0.75,
            color: alpha('#fff', 0.32),
            fontSize: '0.625rem',
            letterSpacing: '0.1em',
          }}
        >
          {t(titleKey)}
        </Typography>
      )}
      {collapsed && titleKey && (
        <Box
          sx={{
            mx: 'auto',
            my: 1.25,
            width: 20,
            height: 1,
            bgcolor: alpha('#fff', 0.1),
          }}
        />
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
                position: 'relative',
                justifyContent: collapsed ? 'center' : 'flex-start',
                px: collapsed ? 1 : 1.25,
                mx: collapsed ? 1 : 1.25,
                my: 0.15,
                minHeight: 40,
                color: selected ? '#fff' : alpha('#fff', 0.62),
                bgcolor: selected ? alpha('#fff', 0.09) : 'transparent',
                '&::before': selected
                  ? {
                      content: '""',
                      position: 'absolute',
                      insetInlineStart: 0,
                      top: '20%',
                      bottom: '20%',
                      width: 2.5,
                      borderRadius: 99,
                      bgcolor: tokens.teal[500],
                      boxShadow: `0 0 8px ${alpha(tokens.teal[500], 0.5)}`,
                    }
                  : undefined,
                '&:hover': {
                  bgcolor: alpha('#fff', 0.06),
                  color: '#fff',
                },
                '&.Mui-selected:hover': {
                  bgcolor: alpha('#fff', 0.12),
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: collapsed ? 0 : 36,
                  justifyContent: 'center',
                  color: selected ? tokens.teal[500] : 'inherit',
                  opacity: selected ? 1 : 0.85,
                  '& .MuiSvgIcon-root': {
                    fontSize: 20,
                  },
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
                      fontSize: '0.8125rem',
                      letterSpacing: '-0.01em',
                    },
                  }}
                />
              )}
            </ListItemButton>
          );

          return (
            <ListItem key={item.path} disablePadding>
              {collapsed ? (
                <Tooltip title={label} placement="right" enterDelay={300}>
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
          radial-gradient(ellipse 100% 60% at 0% -10%, ${alpha(tokens.teal[600], 0.22)}, transparent 50%),
          linear-gradient(180deg, ${SIDEBAR_BG_ELEVATED} 0%, ${SIDEBAR_BG} 38%)
        `,
        color: '#fff',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          px: collapsed ? 1 : 2,
          gap: 1,
          height: HEADER_HEIGHT,
          justifyContent: collapsed ? 'center' : 'space-between',
          flexShrink: 0,
        }}
      >
        <BrandMark collapsed={collapsed} />
        {showCollapseToggle && !collapsed && (
          <IconButton
            size="small"
            onClick={toggleSidebarCollapsed}
            aria-label={t('header.collapseNav')}
            sx={{
              color: alpha('#fff', 0.5),
              '&:hover': { color: '#fff', bgcolor: alpha('#fff', 0.08) },
            }}
          >
            <KeyboardDoubleArrowLeftRoundedIcon
              fontSize="small"
              sx={{
                transform: (theme) =>
                  theme.direction === 'rtl' ? 'scaleX(-1)' : 'none',
              }}
            />
          </IconButton>
        )}
      </Box>

      <Divider sx={{ borderColor: alpha('#fff', 0.06), mx: collapsed ? 1.5 : 2 }} />

      <Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', py: 1.25 }}>
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
        <Box sx={{ px: collapsed ? 1.5 : 2, my: 1 }}>
          <Divider sx={{ borderColor: alpha('#fff', 0.06) }} />
        </Box>
        <NavSection
          titleKey="nav.sectionSystem"
          items={systemNav}
          collapsed={collapsed}
          onNavigate={onNavigate}
        />
      </Box>

      {showCollapseToggle && collapsed && (
        <Box sx={{ p: 1.25, display: 'grid', placeItems: 'center', pb: 2 }}>
          <Tooltip title={t('header.expandNav')} placement="right">
            <IconButton
              size="small"
              onClick={toggleSidebarCollapsed}
              aria-label={t('header.expandNav')}
              sx={{
                color: alpha('#fff', 0.55),
                bgcolor: alpha('#fff', 0.05),
                '&:hover': { color: '#fff', bgcolor: alpha('#fff', 0.1) },
                transform: (theme) =>
                  theme.direction === 'rtl' ? 'none' : 'scaleX(-1)',
              }}
            >
              <KeyboardDoubleArrowLeftRoundedIcon fontSize="small" />
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
      sx={{ width: { lg: desktopWidth }, flexShrink: { lg: 0 } }}
      aria-label={t('nav.aria')}
    >
      <Drawer
        variant="temporary"
        anchor="left"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', lg: 'none' },
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
          display: { xs: 'none', lg: 'block' },
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
