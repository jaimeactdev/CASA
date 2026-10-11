'use client';

import { useMemo } from 'react';
import HomeIcon from '@mui/icons-material/Home';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import CardGiftcardOutlinedIcon from '@mui/icons-material/CardGiftcardOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import ManageAccountsOutlinedIcon from '@mui/icons-material/ManageAccountsOutlined';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import { useUserStore } from '@/core/store/useUserStore';
import { MenuItem } from '@/types/menu';
import { filterMenuItemsBySession } from '@/shared/layouts/filterMenuItems';

export const templateMenuSections: MenuItem[] = [
  {
    text: 'Inicio',
    url: '/home',
    icon: HomeIcon,
    status: 'R',
  },
  {
    text: 'Afiliados',
    url: '/afiliados',
    icon: PeopleAltOutlinedIcon,
    status: 'R',
    permission: 'members.view',
  },
  {
    text: 'Pagos',
    url: '/pagos',
    icon: PaymentsOutlinedIcon,
    status: 'R',
    permission: 'fees.view',
  },
  {
    text: 'Beneficios',
    url: '/beneficios',
    icon: CardGiftcardOutlinedIcon,
    status: 'R',
    permission: 'benefits.view',
    subItems: [
      {
        text: 'Entregas',
        url: '/beneficios/entregas',
        status: 'R',
        permission: 'benefits.view',
      },
    ],
  },
  {
    text: 'Perfiles',
    url: '/perfiles',
    icon: BadgeOutlinedIcon,
    status: 'R',
    permission: 'profiles.view',
  },
  {
    text: 'Usuarios',
    url: '/usuarios',
    icon: ManageAccountsOutlinedIcon,
    status: 'R',
    permission: 'users.view',
  },
  {
    text: 'Roles',
    url: '/roles',
    icon: AdminPanelSettingsOutlinedIcon,
    status: 'R',
    permission: 'roles.view',
  },
  {
    text: 'Parámetros',
    url: '/parametros',
    icon: TuneOutlinedIcon,
    status: 'R',
    permission: 'settings.view',
  },
];

export const useAllMenuItems = (): MenuItem[] => templateMenuSections;

export const useMenuItems = (): MenuItem[] => {
  const user = useUserStore((state) => state.user);

  return useMemo(
    () =>
      filterMenuItemsBySession(
        templateMenuSections,
        Boolean(user?.email),
        user?.permissions ?? [],
      ),
    [user?.email, user?.permissions],
  );
};
