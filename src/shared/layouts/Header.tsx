'use client';

import { Box, IconButton, Menu, MenuItem, Tooltip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Link from 'next/link';
import { Dispatch, SetStateAction, useState } from 'react';
import { useRouter } from 'next/navigation';

import { useBreakpoint } from '@/shared/hooks/useBreakpoint';
import { useUserStore } from '@/core/store/useUserStore';
import { getSessionPort } from '@/core/session/sessionPort';
import { appConfig } from '@/config/appConfig';
import { appIcons } from '@/config/appIcons';
import { fontSizes, fontWeights, iconSizes } from '@/styles/designTokens';

interface Props {
  collapsed: boolean;
  setCollapsed: Dispatch<SetStateAction<boolean>>;
  setCollapsedFull: Dispatch<SetStateAction<boolean>>;
}

export default function Header({ collapsed, setCollapsed, setCollapsedFull }: Props) {
  const theme = useTheme();
  const { isXs, isSm } = useBreakpoint();
  const isMobile = isXs || isSm;
  const user = useUserStore((state) => state.user);
  const clearUser = useUserStore((state) => state.clearUser);
  const router = useRouter();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const chromeText = String(theme.customStyleHeader.header.color);
  const brand = theme.palette.primary.main;

  const iconButtonSx = {
    color: chromeText,
    borderRadius: '50%',
    '&:hover': { color: brand, backgroundColor: theme.customStyleMenu.levelTwoMenuHover.backgroundColor },
  };
  const iconSx = { fontSize: iconSizes.lg };

  const {
    home: HomeIcon,
    login: LoginIcon,
    profile: ProfileIcon,
    logout: LogoutIcon,
    menuExpand: MenuExpandIcon,
    menuCollapse: MenuCollapseIcon,
    dropdown: DropdownIcon,
  } = appIcons;

  const handleProfileClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    const port = getSessionPort();
    if (port) {
      await port.logout();
    }
    clearUser();
    router.push('/login');
  };

  return (
    <Box component="header" sx={theme.customStyleHeader.headerContent(isMobile)}>
      <Box sx={{ ml: { xs: 4, sm: 0 }, display: 'flex', alignItems: 'center', flex: 1 }}>
        {!isMobile && (
          <Tooltip title={collapsed ? 'Anclar menú' : 'Ocultar menú'} placement="bottom" arrow>
            <IconButton
              aria-label={collapsed ? 'Anclar menú' : 'Ocultar menú'}
              sx={iconButtonSx}
              onClick={() => {
                setCollapsed(!collapsed);
                setCollapsedFull(collapsed);
              }}
            >
              {collapsed ? <MenuExpandIcon sx={iconSx} /> : <MenuCollapseIcon sx={iconSx} />}
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {!isMobile && (
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            color: chromeText,
            fontWeight: fontWeights.semibold,
            fontSize: fontSizes.lg,
            textAlign: 'center',
            whiteSpace: 'nowrap',
          }}
        >
          {appConfig.name}
        </Box>
      )}

      <Box sx={{ ...theme.customStyleHeader.navLinks, flex: 1, justifyContent: 'flex-end', gap: 1 }}>
        {!isMobile && (
          <Tooltip title="Inicio" placement="bottom" arrow>
            <IconButton component={Link} href="/home" aria-label="Inicio" sx={iconButtonSx}>
              <HomeIcon sx={iconSx} />
            </IconButton>
          </Tooltip>
        )}

        {user ? (
          <>
            <Box
              component="button"
              type="button"
              onClick={handleProfileClick}
              aria-haspopup="menu"
              aria-expanded={open}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                px: 1.5,
                py: 0.75,
                border: 0,
                borderRadius: '9999px',
                background: 'transparent',
                color: chromeText,
                cursor: 'pointer',
                font: 'inherit',
                fontSize: fontSizes.md,
                fontWeight: fontWeights.medium,
                '&:hover': { color: brand, backgroundColor: theme.customStyleMenu.levelTwoMenuHover.backgroundColor },
              }}
            >
              <ProfileIcon sx={iconSx} />
              {!isMobile && <span>{user.name}</span>}
              <DropdownIcon sx={{ fontSize: iconSizes.md }} />
            </Box>
            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <MenuItem onClick={handleLogout} sx={{ gap: 1, fontSize: fontSizes.md }}>
                <LogoutIcon sx={{ fontSize: iconSizes.md }} />
                Cerrar sesión
              </MenuItem>
            </Menu>
          </>
        ) : (
          <Tooltip title="Iniciar sesión" placement="bottom" arrow>
            <IconButton component={Link} href="/login" aria-label="Iniciar sesión" sx={iconButtonSx}>
              <LoginIcon sx={iconSx} />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    </Box>
  );
}
