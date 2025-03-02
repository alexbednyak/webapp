import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#FF9800", // Orange
    },
    secondary: {
      main: "#9C27B0", // Purple
    },
    background: {
      default: "#F3E5F5", // Light Purple background
      paper: "#FFF3E0", // Light Orange paper background
    },
  },
  typography: {
    fontFamily: "Arial, sans-serif",
    h4: { fontWeight: 700, color: "#FF9800" }, // Orange Title
    h5: { fontWeight: 600, color: "#9C27B0" }, // Purple Subtitles
  },
});

export default theme;
