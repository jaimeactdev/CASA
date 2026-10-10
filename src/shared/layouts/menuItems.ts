"use client";

import { useMemo } from "react";
import HomeIcon from "@mui/icons-material/Home";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import { useUserStore } from "@/core/store/useUserStore";
import { MenuItem } from "@/types/menu";
import { filterMenuItemsBySession } from "@/shared/layouts/filterMenuItems";

/** Minimal template menu. Replace or extend it when starting a new product. */
export const templateMenuSections: MenuItem[] = [
  {
    text: "Inicio",
    url: "/home",
    icon: HomeIcon,
    status: "A",
  },
  {
    text: "Ejemplo",
    url: "/ejemplo",
    icon: DashboardIcon,
    status: "A",
  },
  {
    text: "Formulario",
    url: "/form",
    icon: AssignmentOutlinedIcon,
    status: "A",
  },
];

export const useAllMenuItems = (): MenuItem[] => templateMenuSections;

export const useMenuItems = (): MenuItem[] => {
  const user = useUserStore((state) => state.user);

  return useMemo(
    () => filterMenuItemsBySession(templateMenuSections, Boolean(user?.email)),
    [user?.email],
  );
};
