export type MenuItemStatus = 'A' | 'I' | 'R';

export interface MenuItem {
  text: string;
  icon?: React.ElementType;
  url?: string;
  external?: boolean;
  subItems?: MenuItem[];
  status?: MenuItemStatus;
  permission?: string;
  onClick?: () => void;
  primarySection?: boolean;
}
