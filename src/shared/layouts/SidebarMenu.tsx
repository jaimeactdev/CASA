"use client";

import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
  Divider,
  Tooltip,
  IconButton,
  Box,
  Typography,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import AppDialog from "@/shared/ui/Modal/AppDialog";
import {
  Menu as MenuIcon,
  ExpandLess,
  ExpandMore,
  Mail as MailIcon,
} from "@mui/icons-material";
import { useState, useEffect, Fragment, type ReactNode } from "react";
import Link from "next/link";
import { useTheme } from "@mui/material/styles";
import { Dispatch, SetStateAction } from "react";
import { useUserStore } from "@/core/store/useUserStore";
import NextLink from "next/link";
import CloseIcon from "@mui/icons-material/Close";
import { usePathname, useRouter } from "next/navigation";
import { useMenuItems } from "./menuItems";
import type { MenuItem } from "@/types/menu";
import { fontSizes, fontWeights, iconSizes } from "@/styles/designTokens";
import { BrandLogo } from "@/shared/ui/brand/BrandLogo";

function normalizeMenuPath(path: string): string {
  if (path.endsWith("/") && path.length > 1) {
    return path.slice(0, -1);
  }
  return path;
}

/** Parent node paths that must expand so the active page is visible. */
function findOpenPathsForActiveRoute(
  items: MenuItem[],
  targetUrl: string,
  prefix = "",
): string[] | null {
  const target = normalizeMenuPath(targetUrl);

  for (let index = 0; index < items.length; index++) {
    const item = items[index];
    if (item.status === "I") continue;

    const path = prefix === "" ? String(index) : `${prefix}-${index}`;

    if (item.subItems?.length) {
      const nested = findOpenPathsForActiveRoute(
        item.subItems,
        targetUrl,
        path,
      );
      if (nested !== null) {
        return [path, ...nested];
      }
    }

    if (item.url) {
      const itemUrl = normalizeMenuPath(item.url);
      if (target === itemUrl || target.startsWith(`${itemUrl}/`)) {
        return [];
      }
    }
  }

  return null;
}

/** Path chain from level 1 down to the given node (inclusive). */
function getPathChainToNode(path: string): string[] {
  const parts = path.split("-");
  const chain: string[] = [];
  for (let i = 1; i <= parts.length; i++) {
    chain.push(parts.slice(0, i).join("-"));
  }
  return chain;
}

interface SidebarMenuProps {
  collapsed: boolean;

  ismobile: boolean;
  setCollapsed: Dispatch<SetStateAction<boolean>>;
  onCloseMobile?: () => void;
}

export function SidebarMenu({
  collapsed,
  ismobile,
  setCollapsed,
  onCloseMobile,
}: SidebarMenuProps) {
  const user = useUserStore((state) => state.user);
  const menuItems = useMenuItems();
  // Expandable menu paths
  const [openMenus, setOpenMenus] = useState<string[]>([]);

  const pathname = usePathname();
  const [openDialog, setOpenDialog] = useState(false);
  const theme = useTheme();
  const router = useRouter();
  // Expand only the active branch; keep the rest collapsed
  useEffect(() => {
    if (!menuItems.length || !pathname) return;
    const paths = findOpenPathsForActiveRoute(menuItems, pathname);
    setOpenMenus(paths ?? []);
  }, [menuItems, pathname]);

  if (!user?.email) {
    return null;
  }

  const toggleCollapse = () => {
    setCollapsed((prev) => !prev);
  };

  const handleRequireLogin = () => {
    setOpenDialog(true);
  };

  const handleGoLogin = () => {
    setOpenDialog(false);
    router.push("/login");
  };

  const handleItemClick = () => {
    if (onCloseMobile) {
      onCloseMobile(); // Cierra el drawer en mobile
    }
  };

  const handleMenuPathClick = (path: string) => {
    setOpenMenus((prev) => {
      if (prev.includes(path)) {
        return prev.filter((p) => p !== path && !p.startsWith(`${path}-`));
      }

      // Accordion: one open branch per main area; nested areas stay collapsed.
      return getPathChainToNode(path);
    });
  };

  const renderMenuNode = (
    item: MenuItem,
    path: string,
    depth: number,
    parentIsOpen: boolean,
  ): ReactNode => {
    if (item.status === "I") return null;

    const hasChildren = (item.subItems?.length ?? 0) > 0;
    const isOpen = openMenus.includes(path);
    const isActive = Boolean(item.url && pathname === `${item.url}/`);
    const primary = Boolean(item.primarySection);
    const brand = theme.palette.primary.main;

    const iconColor =
      isActive || primary ? brand : theme.customStyleMenu.iconMenu.color;

    const content = (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "flex-start",
          gap: 1.5,
          width: collapsed ? "100%" : "260px",
          pl: collapsed ? 0 : 1,
        }}
      >
        <ListItemIcon
          onClick={toggleCollapse}
          sx={{
            color: iconColor,
            justifyContent: "center",
            minWidth: 0,
          }}
        >
          {item.icon ? (
            <item.icon
              style={{
                width: iconSizes.md,
                height: iconSizes.md,
                fill: "currentColor",
              }}
            />
          ) : null}
        </ListItemIcon>

        {!collapsed && (
          <ListItemText
            primary={item.text}
            primaryTypographyProps={{
              sx: {
                ...theme.customStyleMenu.levelOneMenu,
                ...(isActive ? { fontWeight: fontWeights.semibold } : {}),
                ...(primary ? { color: brand, fontWeight: fontWeights.semibold } : {}),
              },
            }}
          />
        )}
        {hasChildren &&
          !collapsed &&
          (isOpen ? (
            <ExpandLess sx={{ cursor: "pointer" }} />
          ) : (
            <ExpandMore sx={{ cursor: "pointer" }} />
          ))}
      </Box>
    );

    const Wrapper = item.external ? "a" : Link;
    const linkProps = item.external
      ? {
          href: item.url || "#",
          target: "_blank" as const,
          rel: "noopener noreferrer",
        }
      : { href: item.url || "#" };

    const sectionRowSx = primary
      ? {
          "&:hover": {
            backgroundColor:
              theme.customStyleMenu.levelTwoMenuHover.backgroundColor,
            "& .MuiListItemText-primary": { color: brand },
            "& .MuiSvgIcon-root": { color: brand },
          },
        }
      : {};

    if (item.url && !hasChildren) {
      return (
        <div key={path} style={{ background: "transparent" }}>
          <ListItem
            component={Wrapper as React.ElementType}
            onClick={() => {
              if (item.onClick) item.onClick();
              handleItemClick();
            }}
            {...linkProps}
            sx={{
              px: 2,
              py: 1,
              minHeight: 44,
              mx: collapsed ? 0 : 1,
              width: collapsed ? "70px" : "290px",
              justifyContent: collapsed ? "center" : "flex-start",
              borderRadius: collapsed ? 0 : "15px",
              transition: "all 0.3s ease",
              boxShadow: isActive
                ? `inset 3px 0 0 ${theme.palette.primary.main}`
                : "none",
              backgroundColor: isActive
                ? theme.customStyleMenu.levelTwoMenuActive.backgroundColor
                : "transparent",
              color: isActive
                ? theme.customStyleMenu.levelTwoMenuActive.color
                : theme.customStyleMenu.levelOneMenu.color,
              "& .MuiListItemText-primary": {
                color: isActive
                  ? theme.customStyleMenu.levelTwoMenuActive.color
                  : theme.customStyleMenu.levelOneMenu.color,
              },
              "& .MuiSvgIcon-root": {
                color: isActive
                  ? theme.customStyleMenu.levelTwoMenuActive.color
                  : theme.customStyleMenu.iconMenu.color,
              },
              "&:hover": {
                backgroundColor:
                  theme.customStyleMenu.levelTwoMenuHover.backgroundColor,
                "& .MuiListItemText-primary": {
                  color: theme.customStyleMenu.levelTwoMenuHover.color,
                },
                "& .MuiSvgIcon-root": {
                  color: theme.customStyleMenu.levelTwoMenuActive.color,
                },
              },
            }}
          >
            {collapsed ? (
              <Tooltip title={item.text} placement="right">
                {content}
              </Tooltip>
            ) : (
              content
            )}
          </ListItem>
        </div>
      );
    }

    return (
      <div key={path} style={{ background: "transparent" }}>
        <>
          <ListItem
            onClick={() => {
              if (hasChildren) handleMenuPathClick(path);
            }}
            sx={{
              px: 2,
              py: 1,
              minHeight: 44,
              mx: collapsed ? 0 : 1,
              width: collapsed ? "70px" : "290px",
              borderRadius: collapsed ? "0px" : "15px",
              justifyContent: collapsed ? "center" : "flex-start",
              transition: "all 0.3s ease",
              cursor: hasChildren ? "pointer" : "default",
              ...sectionRowSx,
              ...(!primary
                ? {
                    "&:hover": {
                      backgroundColor:
                        theme.customStyleMenu.levelTwoMenuHover.backgroundColor,
                      "& .MuiListItemText-primary": {
                        color: theme.customStyleMenu.levelTwoMenuHover.color,
                      },
                      "& .MuiSvgIcon-root": {
                        color: theme.customStyleMenu.levelTwoMenuHover.color,
                      },
                    },
                  }
                : {}),
            }}
          >
            {collapsed ? (
              <Tooltip title={item.text} placement="right">
                {content}
              </Tooltip>
            ) : (
              content
            )}
          </ListItem>
          {!collapsed && hasChildren && (
            <Collapse in={isOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {item.subItems!.map((subItem, subIndex) => {
                  const childPath = `${path}-${subIndex}`;
                  const childHasChildren = (subItem.subItems?.length ?? 0) > 0;

                  if (childHasChildren) {
                    return (
                      <Fragment key={childPath}>
                        {renderMenuNode(subItem, childPath, depth + 1, isOpen)}
                      </Fragment>
                    );
                  }

                  if (subItem.status === "I") return null;

                  const isSubActive = Boolean(
                    subItem.url && pathname === `${subItem.url}`,
                  );
                  const canAccess =
                    subItem.status === "A" ||
                    (subItem.status === "R" && user?.email);
                  const subProps = canAccess
                    ? subItem.external
                      ? {
                          href: subItem.url || "#",
                          target: "_blank" as const,
                          rel: "noopener noreferrer",
                        }
                      : { href: subItem.url || "#" }
                    : {};

                  return (
                    <Box key={childPath} sx={{ display: "block" }}>
                      <ListItem
                        component={
                          canAccess ? (subItem.external ? "a" : Link) : "div"
                        }
                        {...(subItem.status === "A" ? subProps : {})}
                        onClick={
                          subItem.status === "R" && !user?.email
                            ? handleRequireLogin
                            : () => {
                                if (subItem.onClick) subItem.onClick();
                                handleItemClick();
                              }
                        }
                        href={subItem.url || "#"}
                        target={subItem.external ? "_blank" : undefined}
                        rel={
                          subItem.external ? "noopener noreferrer" : undefined
                        }
                        sx={{
                          cursor: "pointer",
                          pl: 1 + Math.min(depth + 1, 4),
                          py: 1,
                          mx: 1,
                          width: collapsed ? "70px" : "290px",
                          backgroundColor: isSubActive
                            ? theme.customStyleMenu.levelTwoMenuActive
                                .backgroundColor
                            : theme.customStyleMenu.levelTwoMenu
                                .backgroundColor,
                          color: isSubActive
                            ? theme.customStyleMenu.levelTwoTextMenuActive.color
                            : theme.customStyleMenu.iconMenu.color,
                          borderRadius: collapsed ? 0 : "15px",
                          boxShadow: isSubActive
                            ? `inset 3px 0 0 ${theme.palette.primary.main}`
                            : "none",
                          transition: "all 0.3s",
                          "& .subitem-icon": {
                            opacity: isSubActive ? 1 : 0,
                            transform: isSubActive ? "scale(1)" : "scale(0.7)",
                            transition:
                              "opacity 0.3s ease, transform 0.3s ease",
                          },
                          ...(isSubActive
                            ? {}
                            : {
                                "&:hover": {
                                  color:
                                    theme.customStyleMenu.iconMenuActive.color,
                                  backgroundColor:
                                    theme.customStyleMenu.levelTwoMenuHover
                                      .backgroundColor,
                                  "& .MuiListItemText-primary": {
                                    color:
                                      theme.customStyleMenu.iconMenuActive
                                        .color,
                                  },
                                  "& .subitem-icon": {
                                    opacity: 1,
                                    transform: "scale(1)",
                                  },
                                },
                              }),
                        }}
                      >
                        <ListItemIcon
                          className="subitem-icon"
                          sx={{
                            minWidth: 32,
                            mr: "2px",
                            marginLeft: 3,
                            color: isSubActive
                              ? theme.customStyleMenu.levelTwoTextMenuActive
                                  .color
                              : "inherit",
                          }}
                        >
                          {subItem.icon ? (
                            <subItem.icon
                              style={{
                                width: iconSizes.sm,
                                height: iconSizes.sm,
                                fill: "currentColor",
                              }}
                            />
                          ) : (
                            <MailIcon
                              sx={{ color: "inherit" }}
                            />
                          )}
                        </ListItemIcon>
                        <ListItemText
                          primary={subItem.text}
                          primaryTypographyProps={{
                            sx: {
                              color: "inherit",
                              ...(isSubActive
                                ? theme.customStyleMenu.levelTwoTextMenuActive
                                : theme.customStyleMenu.levelTwoTextMenu),
                            },
                          }}
                        />
                      </ListItem>
                      {subIndex === item.subItems!.length - 1 &&
                        isOpen &&
                        parentIsOpen && (
                          <Box
                            sx={{ display: "flex", justifyContent: "center" }}
                          >
                            <Divider
                              sx={{
                                width: collapsed ? "70px" : "290px",
                                borderRadius: "10px",
                                mt: 1,
                                borderColor: theme.palette.divider,
                              }}
                            />
                          </Box>
                        )}
                    </Box>
                  );
                })}
              </List>
            </Collapse>
          )}
        </>
      </div>
    );
  };

  return (
    <Box
      sx={{
        width: collapsed
          ? theme.customStyleMenu.menuCollapsed.width
          : theme.customStyleMenu.menu.width,
        bgcolor: theme.customStyleMenu.menu.backgroundColor,
        height: "100dvh",
        display: "flex",
        flexDirection: "column",
        transition: "width 0.3s",
        borderRight: "1px solid",
        borderColor: "divider",
      }}
    >
      <Box
        className="logo"
        sx={{
          height: "70px",
          display: "flex",
          backgroundColor: theme.customStyleHeader.header.backgroundColor,
          borderBottom: "1px solid",
          borderColor: "divider",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "flex-start",
          px: collapsed ? 0 : 3,
        }}
      >
        <NextLink href="/" passHref style={{ display: "flex" }}>
          <BrandLogo variant={collapsed ? "mark" : "full"} height={40} />
        </NextLink>
      </Box>
      <List sx={{ flex: 1, overflowY: "auto" }}>
        {ismobile && (
          <ListItem
            onClick={() => {
              handleItemClick();
              toggleCollapse();
            }}
            sx={{
              justifyContent: collapsed ? "center" : "flex-start",
              cursor: "pointer",
              "&:hover": {
                backgroundColor:
                  theme.customStyleMenu.levelTwoMenuHover.backgroundColor, // fondo al pasar mouse
                "& .MuiListItemText-primary": {
                  color: theme.customStyleMenu.levelTwoMenuHover.color, // color texto al pasar mouse
                },
                "& .MuiSvgIcon-root": {
                  color: theme.customStyleMenu.levelTwoMenuHover.color, // color icono al pasar mouse
                },
              },
            }}
          >
            {!collapsed && ismobile && (
              <ListItemText
                primary="Cerrar menú"
                primaryTypographyProps={{
                  sx: {
                    fontSize: theme.customStyleMenu.levelOneMenu.fontSize,
                    fontWeight: theme.customStyleMenu.levelOneMenu.fontWeight,
                    color: theme.customStyleMenu.levelOneMenu.color,
                    marginLeft: "20px",
                  },
                }}
              />
            )}
            <IconButton
              edge="start"
              sx={{
                color: theme.customStyleMenu.iconMenu.color,
                mx: collapsed ? "auto" : 0,
                display: "flex",
                justifyContent: "center",
                paddingRight: collapsed ? "0px" : "25px",
              }}
            >
              {collapsed ? (
                <MenuIcon color="primary" />
              ) : ismobile ? (
                <CloseIcon />
              ) : (
                <></>
              )}
            </IconButton>
          </ListItem>
        )}
        {/*  Divider between logo and menu <Divider /> */}

        {!collapsed ? (
          <>
            <Typography
              variant="body1"
              sx={{
                fontSize: fontSizes.md,
                fontWeight: fontWeights.semibold,
                color: theme.customStyleMenu.levelOneMenu.color,
                px: 3,
              }}
              mb={1.5}
              mt={2}
              noWrap
            >
              {user?.name}
            </Typography>
          </>
        ) : (
          <></>
        )}
        {!collapsed ? <Divider /> : <></>}

        {menuItems.map((item, index) =>
          renderMenuNode(item, String(index), 0, true),
        )}
      </List>
      {/* 🔹 Dialog al final del componente, no dentro del map */}
      <AppDialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Acceso restringido</DialogTitle>
        <DialogContent>
          Debes iniciar sesión para acceder a esta opción.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleGoLogin}>
            Iniciar sesión
          </Button>
        </DialogActions>
      </AppDialog>
    </Box>
  );
}
