// types/menu.ts
export type MenuItemStatus = "A" | "I" | "R"; // A = active, I = inactive, R = requires session

export interface MenuItem {
  text: string;
  icon?: React.ElementType;
  url?: string;
  external?: boolean;
  subItems?: MenuItem[];
  status?: MenuItemStatus;
  onClick?: () => void;
  /** Top-level menu section (corporate orange style) */
  primarySection?: boolean;
}
