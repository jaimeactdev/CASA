/**
 * Shell icons (header and generic actions). Swap any entry for another
 * @mui/icons-material icon or a custom SVG component to rebrand the template.
 * Menu icons live with each entry in src/shared/layouts/menuItems.ts.
 */
import type { ElementType } from "react";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import LoginOutlinedIcon from "@mui/icons-material/LoginOutlined";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import MenuIcon from "@mui/icons-material/Menu";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

export const appIcons = {
  home: HomeOutlinedIcon,
  login: LoginOutlinedIcon,
  profile: AccountCircleOutlinedIcon,
  logout: LogoutOutlinedIcon,
  menuExpand: MenuIcon,
  menuCollapse: MenuOpenIcon,
  dropdown: KeyboardArrowDownIcon,
} satisfies Record<string, ElementType>;

export type AppIconKey = keyof typeof appIcons;
