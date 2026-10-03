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
import { alpha, useTheme } from '@mui/material/styles';
import type { FormEvent } from 'react';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useLogoutMutation } from '../../app/features/auth/authApi';
import {
  clearCredentials,
  selectCurrentUser,
} from '../../app/features/auth/authSlice';
import type { AppDispatch, RootState } from '../../app/store';
import {
  DRAWER_WIDTH,
  DRAWER_WIDTH_COLLAPSED,
  HEADER_HEIGHT,
  tokens,
} from '../../app/theme';
import { LanguageSwitcher } from '../i18n/LanguageSwitcher';
import { useAppTranslation } from '../../i18n/useAppTranslation';
import { useLayout } from './LayoutContext';
import type { BreadcrumbCrumb } from './usePageMeta';

type HeaderProps = {
  title: string;
  breadcrumbs: BreadcrumbCrumb[];
  onMenuClick: () => void;
};

export function Header({ title, breadcrumbs, onMenuClick }: HeaderProps) {
  const { t } = useAppTranslation();
  const theme = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { sidebarCollapsed } = useLayout();
  const user = useSelector(selectCurrentUser);
  const refreshToken = useSelector(
    (state: RootState) => state.auth.refreshToken,
  );
  const [logout] = useLogoutMutation();

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
        color: 'text.primary',
        transition: (muiTheme) =>
          muiTheme.transitions.create(['width', 'margin'], {
            easing: muiTheme.transitions.easing.sharp,
            duration: muiTheme.transitions.duration.enteringScreen,
          }),
      }}
    >
      <Toolbar
        sx={{
          gap: 1.5,
          minHeight: { xs: HEADER_HEIGHT },
          height: HEADER_HEIGHT,
          px: { xs: 2, sm: 3 },
        }}
      >
        <IconButton
          color="inherit"
          edge="start"
          onClick={onMenuClick}
          sx={{
            display: { md: 'none' },
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1.5,
          }}
          aria-label={t('header.openNav')}
        >
          <MenuIcon fontSize="small" />
        </IconButton>

        <Box sx={{ minWidth: 0, flexGrow: 1 }}>
          <Typography
            variant="h6"
            noWrap
            sx={{
              fontWeight: 700,
              lineHeight: 1.2,
              fontSize: '1rem',
              letterSpacing: '-0.02em',
            }}
          >
            {title}
          </Typography>
          <Breadcrumbs
            aria-label={t('header.breadcrumbs')}
            sx={{
              display: { xs: 'none', sm: 'flex' },
              mt: 0.15,
              '& .MuiBreadcrumbs-ol': { flexWrap: 'nowrap' },
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
                    sx={{ fontWeight: 500 }}
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
                  sx={{ fontWeight: 500 }}
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
          sx={{ display: { xs: 'none', md: 'block' }, width: 240 }}
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
                    <SearchRoundedIcon
                      sx={{ fontSize: 18, color: 'text.secondary' }}
                    />
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: alpha(tokens.ink[900], 0.025),
                borderRadius: 2,
                height: 36,
                '& fieldset': {
                  borderColor: 'transparent',
                },
                '&:hover': {
                  bgcolor: alpha(tokens.ink[900], 0.04),
                  '& fieldset': {
                    borderColor: alpha(tokens.ink[900], 0.08),
                  },
                },
                '&.Mui-focused': {
                  bgcolor: '#fff',
                  boxShadow: `0 0 0 3px ${alpha(tokens.teal[600], 0.12)}`,
                  '& fieldset': {
                    borderColor: alpha(tokens.teal[600], 0.35),
                  },
                },
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
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              width: 36,
              height: 36,
            }}
          >
            <Badge color="primary" variant="dot" invisible>
              <NotificationsNoneRoundedIcon sx={{ fontSize: 20 }} />
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
          sx={{
            p: 0.25,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
          }}
        >
          <Avatar
            sx={{
              width: 30,
              height: 30,
              bgcolor: tokens.ink[800],
              fontSize: 11,
              fontWeight: 700,
            }}
          >
            {user ? initials : <PersonOutlineRoundedIcon sx={{ fontSize: 16 }} />}
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
            <MenuItem
              disabled
              sx={{
                opacity: '1 !important',
                typography: 'caption',
                color: 'text.secondary',
                fontWeight: 500,
              }}
            >
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
