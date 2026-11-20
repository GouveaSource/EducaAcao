import { createTheme } from "@mui/material/styles";

const tema = createTheme({
  palette: {
    primary: { main: "#2563eb" },
    secondary: { main: "#0f766e" },
    background: { default: "#f4f7fb", paper: "#ffffff" },
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: 'Inter, "Segoe UI", Roboto, Arial, sans-serif',
  },
  components: {
    MuiButton: { defaultProps: { disableElevation: true } },
  },
});

export default tema;
