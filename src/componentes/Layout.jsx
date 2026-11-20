import {
  AppBar,
  Box,
  Button,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import PeopleIcon from "@mui/icons-material/People";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import ListAltIcon from "@mui/icons-material/ListAlt";
import CategoryIcon from "@mui/icons-material/Category";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "../servicos/api";

const navegacao = [
  { texto: "Doadores", caminho: "/doadores", icone: <PeopleIcon /> },
  { texto: "Registrar doação", caminho: "/doacoes/nova", icone: <VolunteerActivismIcon /> },
  { texto: "Doações", caminho: "/doacoes", icone: <ListAltIcon /> },
  { texto: "Categorias", caminho: "/categorias", icone: <CategoryIcon /> },
  { texto: "Itens", caminho: "/itens", icone: <Inventory2Icon /> },
];

export default function Layout() {
  const tema = useTheme();
  const pequeno = useMediaQuery(tema.breakpoints.down("md"));
  const [menuAberto, setMenuAberto] = useState(false);
  const [saude, setSaude] = useState(null);
  const localizacao = useLocation();

  useEffect(() => {
    setMenuAberto(false);
  }, [localizacao.pathname]);
  useEffect(() => {
    api
      .verificarSaude()
      .then((dados) => setSaude(dados))
      .catch(() => setSaude({ status: "unavailable", database: "disconnected" }));
  }, []);

  const menu = (
    <List sx={{ px: 1, pt: 1 }}>
      {navegacao.map((item) => (
        <ListItemButton
          key={item.caminho}
          component={NavLink}
          to={item.caminho}
          sx={{
            borderRadius: 2,
            mb: 0.5,
            "&.active": {
              bgcolor: "primary.main",
              color: "white",
              "& .MuiListItemIcon-root": { color: "white" },
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 42 }}>{item.icone}</ListItemIcon>
          <ListItemText primary={item.texto} />
        </ListItemButton>
      ))}
    </List>
  );

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar
        position="sticky"
        color="inherit"
        elevation={0}
        sx={{ borderBottom: 1, borderColor: "divider" }}
      >
        <Toolbar>
          {pequeno && (
            <IconButton
              aria-label="Abrir menu"
              onClick={() => setMenuAberto(true)}
              edge="start"
              sx={{ mr: 1 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" sx={{ flexGrow: 1, color: "primary.main", fontWeight: 800 }}>
            EducaAcao
          </Typography>
          {!pequeno &&
            navegacao.map((item) => (
              <Button
                key={item.caminho}
                component={NavLink}
                to={item.caminho}
                startIcon={item.icone}
                sx={{
                  mx: 0.5,
                  color: "text.secondary",
                  "&.active": { color: "primary.main", bgcolor: "primary.50" },
                }}
              >
                {item.texto}
              </Button>
            ))}
        </Toolbar>
      </AppBar>
      <Drawer open={menuAberto} onClose={() => setMenuAberto(false)}>
        {menu}
      </Drawer>
      <Box component="main" sx={{ maxWidth: 1200, mx: "auto", px: { xs: 2, sm: 3 }, py: 3 }}>
        <Outlet />
      </Box>
      <Box
        component="footer"
        sx={{
          borderTop: 1,
          borderColor: "divider",
          px: 2,
          py: 1.5,
          display: "flex",
          justifyContent: "center",
          gap: 1,
          bgcolor: "white",
        }}
      >
        <Typography variant="caption" color="text.secondary">
          API: {saude?.status === "ok" ? "conectada" : "fora do ar"} · Banco:{" "}
          {saude?.database === "connected" ? "conectado" : "indisponível"}
        </Typography>
      </Box>
    </Box>
  );
}
