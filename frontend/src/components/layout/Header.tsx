import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import AppBar from '@mui/material/AppBar';
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Link from '@mui/material/Link';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import type { FormEvent } from 'react';
import { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { useLogoutMutation } from '../../app/features/auth/authApi';
import {
  clearCredentials,
  selectCurrentUser,
} from '../../app/features/auth/authSlice';
import type { AppDispatch, RootState } from '../../app/store';
import {
  DRAWER_WIDTH,
  DRAWER_WIDTH_COLLAPSED,
} from '../../app/theme';
import { LanguageSwitcher } from '../i18n/LanguageSwitcher';
import { useAppTranslation } from '../../i18n/useAppTranslation';
import { useLayout } from './LayoutContext';

type HeaderProps = {
  title: string;
  onMenuClick: () => void;
};

function useBreadcrumbs(pathname: string) {
  const { t } = useAppTranslation();

  return useMemo(() => {
    const crumbs: Array<{ label: string; to?: string }> = [
      { label: t('nav.dashboard'), to: '/dashboard' },
    ];

    if (pathname.startsWith('/projects/') && pathname !== '/projects') {
      crumbs.push({ label: t('nav.projects'), to: '/projects' });
      crumbs.push({ label: t('projectDetails.title') });
      return crumbs;
    }
    if (pathname.startsWith('/projects')) {
      crumbs.push({ label: t('nav.projects') });
      return crumbs;
    }
    if (pathname.startsWith('/materials')) {
      crumbs.push({ label: t('nav.materials') });
      return crumbs;
    }
    if (pathname.startsWith('/suppliers')) {
      crumbs.push({ label: t('nav.suppliers') });
      return crumbs;
    }
    if (pathname.startsWith('/expenses')) {
      crumbs.push({ label: t('nav.expenses') });
      return crumbs;
    }
    if (pathname.startsWith('/revenue')) {
      crumbs.push({ label: t('nav.revenue') });
      return crumbs;
    }
    if (pathname.startsWith('/reports') || pathname.startsWith('/analytics')) {
      crumbs.push({ label: t('nav.reports') });
      return crumbs;
    }
    if (pathname.startsWith('/settings')) {
      crumbs.push({ label: t('nav.settings') });
      return crumbs;
    }
    if (pathname.startsWith('/dashboard')) {
      return [{ label: t('nav.dashboard') }];
    }
    return crumbs;
  }, [pathname, t]);
}

export function Header({ title, onMenuClick }: HeaderProps) {
  const { t } = useAppTranslation();
  const theme = useTheme();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { sidebarCollapsed } = useLayout();
  const user = useSelector(selectCurrentUser);
  const refreshToken = useSelector(
    (state: RootState) => state.auth.refreshToken,
  );
  const [logout] = useLogoutMutation();
  const breadcrumbs = useBreadcrumbs(location.pathname);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notifAnchor, setNotifAnchor] = useState<null | HTMLElement>(null);
  const [search, setSearch] = useState('');
  const menuSide = theme.direction === 'rtl' ? 'left' : 'right';
  const drawerWidth = sidebarCollapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH;

  async function handleLogout() {
    setAnchorEl(null);
    if (refreshToken) {
      try {
        await logout({ refreshToken }).unwrap();
      } catch {
        // Local logout still proceeds when the revoke call fails.
      }
    }
    dispatch(clearCredentials());
    navigate('/login', { replace: true });
  }

  function handleSearchSubmit(event: FormEvent) {
    event.preventDefault();
    const q = search.trim();
    if (!q) return;
    navigate(`/projects?search=${encodeURIComponent(q)}`);
  }

  const initials = user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : 'MB';

  return (
    <AppBar
      position="fixed"
      color="inherit"
      sx={{
        width: { md: `calc(100% - ${drawerWidth}px)` },
        marginInlineStart: { md: `${drawerWidth}px` },
        bgcolor: 'rgba(255,255,255,0.9)',
        color: 'text.primary',
        transition: (muiTheme) =>
          muiTheme.transitions.create(['width', 'margin'], {
            easing: muiTheme.transitions.easing.sharp,
            duration: muiTheme.transitions.duration.enteringScreen,
          }),
      }}
    >
      <Toolbar sx={{ gap: 1.5, minHeight: { xs: 64 } }}>
        <IconButton
          color="inherit"
          edge="start"
          onClick={onMenuClick}
          sx={{ display: { md: 'none' } }}
          aria-label={t('header.openNav')}
        >
          <MenuIcon />
        </IconButton>

        <Box sx={{ minWidth: 0, flexGrow: 1 }}>
          <Typography variant="h6" noWrap sx={{ fontWeight: 700, lineHeight: 1.2 }}>
            {title}
          </Typography>
          <Breadcrumbs
            aria-label={t('header.breadcrumbs')}
            sx={{
              display: { xs: 'none', sm: 'flex' },
              '& .MuiBreadcrumbs-separator': { mx: 0.75 },
            }}
          >
            {breadcrumbs.map((crumb, index) => {
              const isLast = index === breadcrumbs.length - 1;
              if (isLast || !crumb.to) {
                return (
                  <Typography
                    key={`${crumb.label}-${index}`}
                    variant="caption"
                    color="text.secondary"
                    noWrap
                  >
                    {crumb.label}
                  </Typography>
                );
              }
              return (
                <Link
                  key={crumb.to}
                  component={RouterLink}
                  to={crumb.to}
                  underline="hover"
                  color="text.secondary"
                  variant="caption"
                >
                  {crumb.label}
                </Link>
              );
            })}
          </Breadcrumbs>
        </Box>

        <Box
          component="form"
          onSubmit={handleSearchSubmit}
          sx={{ display: { xs: 'none', md: 'block' }, width: 260 }}
        >
          <TextField
            size="small"
            fullWidth
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t('header.searchPlaceholder')}
            aria-label={t('header.search')}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: 'background.default',
              },
            }}
          />
        </Box>

        <LanguageSwitcher />

        <Tooltip title={t('header.notifications')}>
          <IconButton
            color="inherit"
            aria-label={t('header.notifications')}
            onClick={(event) => setNotifAnchor(event.currentTarget)}
          >
            <Badge color="primary" variant="dot" invisible>
              <NotificationsNoneRoundedIcon />
            </Badge>
          </IconButton>
        </Tooltip>
        <Menu
          anchorEl={notifAnchor}
          open={Boolean(notifAnchor)}
          onClose={() => setNotifAnchor(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: menuSide }}
          transformOrigin={{ vertical: 'top', horizontal: menuSide }}
        >
          <MenuItem disabled sx={{ opacity: '1 !important', typography: 'body2' }}>
            {t('header.noNotifications')}
          </MenuItem>
        </Menu>

        <IconButton
          color="inherit"
          onClick={(event) => setAnchorEl(event.currentTarget)}
          aria-label={t('header.account')}
          sx={{ p: 0.5 }}
        >
          <Avatar
            sx={{
              width: 34,
              height: 34,
              bgcolor: 'primary.main',
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            {user ? initials : <PersonOutlineRoundedIcon fontSize="small" />}
          </Avatar>
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: menuSide }}
          transformOrigin={{ vertical: 'top', horizontal: menuSide }}
        >
          {user?.email && (
            <MenuItem disabled sx={{ opacity: '1 !important', typography: 'body2' }}>
              {user.email}
            </MenuItem>
          )}
          <MenuItem
            onClick={() => {
              setAnchorEl(null);
              navigate('/settings');
            }}
          >
            {t('nav.settings')}
          </MenuItem>
          <MenuItem onClick={() => void handleLogout()}>
            <LogoutRoundedIcon fontSize="small" sx={{ marginInlineEnd: 1 }} />
            {t('header.logout')}
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
