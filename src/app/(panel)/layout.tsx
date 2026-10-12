"use client";

import { useEffect, useState } from "react";
import {
  Box,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import AppDialog from "@/shared/ui/Modal/AppDialog";
import { useTheme } from "@mui/material/styles";
import Header from "@/shared/layouts/Header";
import { ResponsiveSidebarMenu } from "@/shared/layouts/ResponsiveSidebarMenu";
import { useBreadcrumbs } from "@/shared/hooks/useBreadcrumbs";
import { Breadcrumb } from "@/shared/components/Breadcrumb";
import { usePathname, useRouter } from "next/navigation";
import { useBreakpoint } from "@/shared/hooks/useBreakpoint";
import { LoaderGlobal } from "@/shared/ui/LoaderGlobal";
import { useUserStore } from "@/core/store/useUserStore";
import { useMenuItems, useAllMenuItems } from "@/shared/layouts/menuItems";
import { useRouteModal } from "@/shared/hooks/useRouteModal";
import HoverIconButton from "@/shared/ui/mui/HoverIconButton";
import { useSessionStore } from "@/core/store/useSessionStore";

function normalizePathname(pathname: string | null): string {
  if (!pathname) return "";
  if (pathname.endsWith("/") && pathname.length > 1) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

export default function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <InnerLayout>{children}</InnerLayout>
      <LoaderGlobal />
    </>
  );
}

function InnerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const normalizedPath = normalizePathname(pathname);
  const isBarePage =
    normalizedPath === "/login" || normalizedPath === "/cambiar-clave";
  const isLoginPage = isBarePage;
  const router = useRouter();
  const { isXs, isSm } = useBreakpoint();
  const isMobile = isXs || isSm;
  const noPadding = isLoginPage && !isMobile;
  const theme = useTheme();
  const [collapsed, setCollapsed] = useState(true);
  const [, setCollapsedFull] = useState(false);
  const breadcrumbs = useBreadcrumbs();
  const user = useUserStore((state) => state.user);
  const loadUser = useUserStore((state) => state.loadUser);
  const [loadingUser, setLoadingUser] = useState(true);
  const menuItems = useMenuItems();
  const allMenuItems = useAllMenuItems();

  const [openDialog, setOpenDialog] = useState(false);
  const [accessChecked, setAccessChecked] = useState(false);
  const [dialogMessage, setDialogMessage] = useState(
    "Debes iniciar sesión para acceder a esta página.",
  );

  // Route-based modal configuration
  const { shouldShowModal } = useRouteModal();

  const handleGoLogin = () => {
    setOpenDialog(false);
    if (!user) {
      router.push("/login");
    } else {
      router.replace("/");
    }
  };

  // Most specific menu item status that matches the URL (nested tree).
  const getMenuItemStatusFromList = (
    url: string,
    list: any[],
  ): "A" | "I" | "R" | null => {
    if (url === "/") return "A";

    // Base module (e.g. "/contratos/valores-horarios" -> "/contratos")
    const urlSegments = url.split("/").filter(Boolean);
    const baseModule = urlSegments.length > 0 ? `/${urlSegments[0]}` : url;
    const findInTree = (items: any[]): "A" | "I" | "R" | null => {
      for (const item of items) {
        if (item.subItems?.length) {
          const nested = findInTree(item.subItems);
          if (nested !== null) return nested;
        }
      }
      for (const item of items) {
        if (!item.url) continue;
        if (url === item.url || url.startsWith(`${item.url}/`)) {
          return item.status || "A";
        }
        if (item.url.startsWith(baseModule)) {
          return item.status || "A";
        }
      }
      return null;
    };

    return findInTree(list);
  };

  useEffect(() => {
    loadUser();
    setLoadingUser(false);
  }, [loadUser]);

  useEffect(() => {
    if (!pathname) return;

    if (isBarePage) {
      setAccessChecked(true);
      return;
    }

    if (user?.mustChangePassword) {
      router.replace("/cambiar-clave");
      return;
    }

    const statusInUserMenu = getMenuItemStatusFromList(
      normalizedPath,
      menuItems,
    );
    const statusInAllMenu = getMenuItemStatusFromList(
      normalizedPath,
      allMenuItems,
    );

    if (statusInAllMenu === "I" || statusInUserMenu === "I") {
      router.replace("/");
      // keep accessChecked false so this page does not render
    } else if (
      (statusInUserMenu === "R" || statusInAllMenu === "R") &&
      !user?.email
    ) {
      setDialogMessage("Debes iniciar sesión para acceder a esta página.");
      setOpenDialog(true);
      // keep accessChecked false
    } else if (statusInAllMenu !== null && statusInUserMenu === null) {
      // Route exists in the full menu but not in the current user's menu
      setDialogMessage("Acceso no permitido por tu rol.");
      setOpenDialog(true);
    } else {
      // allowed
      setAccessChecked(true);
    }
  }, [pathname, user, router, menuItems, allMenuItems, normalizedPath, isBarePage]);

  useEffect(() => {
    if (normalizedPath !== "/login") return;
    const current = useSessionStore.getState().toast;
    if (
      current?.duration === 0 &&
      (!current?.buttons || current.buttons.length === 0)
    ) {
      useSessionStore.getState().hideToast();
    }
  }, [normalizedPath]);

  if (isLoginPage) {
    return (
      <Box
        sx={{
          height: "100vh",
          background: theme.palette.primary.main,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box
          component="svg"
          sx={{
            position: "absolute",
            bottom: 0,
            right: 0,
            width: "100%",
            height: "100%",
            zIndex: 0,
            overflow: "visible",
            transform: "scaleY(-1) scaleX(-1)",
          }}
          preserveAspectRatio="none"
          viewBox="-10 -10 120 120"
        >
          <g transform="translate(50, 50) rotate(-20) translate(-50, -50)">
            <path
              d="M130,-30 L-30,-30 L-25,50 Q-1,30 50,50 T120,55 L140,-30 Z"
              fill={theme.palette.secondary.main}
            />
          </g>
        </Box>
        <Box sx={{ position: "relative", zIndex: 1 }}>
          {!shouldShowModal && children}
        </Box>
      </Box>
    );
  }

  if (loadingUser || !accessChecked) {
    return (
      <AppDialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Acceso restringido</DialogTitle>
        <DialogContent>{dialogMessage}</DialogContent>
        <DialogActions>
          <HoverIconButton
            text="Aceptar"
            type="button"
            onClick={handleGoLogin}
            width={100}
            sx={theme.customButtons.primary}
          />
        </DialogActions>
      </AppDialog>
    );
  }

  return (
    <Box sx={theme.customStyleBody.bodyContent(isMobile)}>
      {/* Header */}
      <Box
        sx={
          collapsed
            ? theme.customStyleHeader.headerContainerCollapsed(isMobile)
            : theme.customStyleHeader.headerContainer
        }
      >
        <Header
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          setCollapsedFull={setCollapsedFull}
        />
      </Box>

      <Box sx={theme.customStyleBody.container}>
        {/* Sidebar Menu */}
        <ResponsiveSidebarMenu
          collapsed={collapsed}
          setCollapsed={setCollapsed}
        />

        {/* Main Content */}
        <Box
          sx={
            noPadding
              ? theme.customStyleBody.mainContent2(theme, isMobile, collapsed)
              : theme.customStyleBody.mainContent(theme, isMobile, collapsed)
          }
        >
          {breadcrumbs.length > 1 && <Breadcrumb items={breadcrumbs} />}
          {/* Render page content only when no route modal is active */}
          {!shouldShowModal && children}
        </Box>
      </Box>
    </Box>
  );
}
