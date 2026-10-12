"use client";

import { useState } from "react";
import { Drawer, IconButton, Box } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { SidebarMenu } from "./SidebarMenu";
import { Dispatch, SetStateAction } from "react";
//import { getSidebarBoxStyles } from '@/styles/sidebarStyles';
import { useTheme } from "@mui/material/styles";

import { useBreakpoint } from "@/shared/hooks/useBreakpoint";

interface Props {
  collapsed: boolean;
  setCollapsed: Dispatch<SetStateAction<boolean>>;
}

export function ResponsiveSidebarMenu({
  collapsed,
  setCollapsed,
}: Props) {
  const theme = useTheme();
  const { isXs, isSm } = useBreakpoint();
  const isMobile = isXs || isSm;
  const [openDrawer, setOpenDrawer] = useState(false);

  const handleToggleDrawer = () => {
    setOpenDrawer(!openDrawer);
  };

  const handleCloseDrawer = () => {
    setOpenDrawer(false);
  };

  return (
    <>
      {isMobile ? (
        <Box>
          {/* Botón  Drawer */}
          <IconButton
            onClick={handleToggleDrawer}
            sx={theme.customStyleHeader.drawerMenuMobile}
          >
            {!openDrawer && <MenuIcon fontSize="inherit" />}
          </IconButton>

          {/* Drawer  */}
          <Drawer
            anchor="left"
            open={openDrawer}
            onClose={handleToggleDrawer}
            PaperProps={{ sx: theme.customStyleMenu.menuMobile }}
          >
            <SidebarMenu
              collapsed={false}
              ismobile={isMobile}
              setCollapsed={() => {}}
              onCloseMobile={handleCloseDrawer}
            />
          </Drawer>
        </Box>
      ) : (
        <Box
          sx={{
            ...theme.customStyleMenu.slidebarBoxStyles(theme, collapsed),
            transition: "width 0.3s ease", // smooth width animation
          }}
        >
          <SidebarMenu
            collapsed={collapsed}
            ismobile={isMobile}
            setCollapsed={setCollapsed}
          />
        </Box>
      )}
    </>
  );
}
