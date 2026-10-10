import { useEffect, useState } from "react";
import { Box, Typography, useTheme } from "@mui/material";

interface AnimatedStepIconProps {
  active?: boolean;
  completed?: boolean;
  icon?: React.ReactNode;
}

export function AnimatedStepIcon({  completed, icon }: AnimatedStepIconProps) {
  const theme = useTheme();
  const [phase, setPhase] = useState<"border" | "fill" | "idle">("idle");

  useEffect(() => {
    if (completed) {       
      setPhase("border"); // primero borde
      const t = setTimeout(() => setPhase("fill"), 400); // luego relleno
      return () => clearTimeout(t);
    } else {
      setPhase("idle");
    }
  }, [completed]); 

  // Determinar colores según fase SOLO, sin usar completed
  const borderColor = phase === "border" || phase === "fill"
      ? theme.palette.primary.main
      : theme.palette.grey[400];

  const bgColor = phase === "fill" ? theme.palette.primary.main : "transparent";

  const textColor = phase === "fill" ? "#fff" : theme.palette.grey[700];

  return (
    <Box
      sx={{
        width: 40,
        height: 40,
        borderRadius: "50%",
        border: `3px solid ${borderColor}`,
        backgroundColor: bgColor,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.4s ease",
      }}
    >
      <Typography
        sx={{
          fontWeight: "bold",
          fontSize: 16,
          color: textColor,
          transition: "color 0.4s ease",
        }}
      >
        {icon}
      </Typography>
    </Box>
  );
}
