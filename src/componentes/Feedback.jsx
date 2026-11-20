import { useEffect, useState } from "react";
import { Alert, CircularProgress, Snackbar, Stack, Typography } from "@mui/material";

export function Carregando({ texto = "Carregando..." }) {
  return (
    <Stack
      direction="row"
      spacing={1.5}
      py={5}
      sx={{ justifyContent: "center", alignItems: "center" }}
    >
      <CircularProgress size={24} />
      <Typography>{texto}</Typography>
    </Stack>
  );
}

export function Mensagem({ tipo = "info", texto }) {
  const [aberta, setAberta] = useState(false);

  useEffect(() => {
    setAberta(Boolean(texto));
  }, [texto]);

  return (
    <Snackbar
      open={aberta}
      autoHideDuration={tipo === "error" ? 7000 : 5000}
      onClose={() => setAberta(false)}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
    >
      <Alert
        severity={tipo}
        variant="filled"
        onClose={() => setAberta(false)}
        sx={{ width: "100%" }}
      >
        {texto}
      </Alert>
    </Snackbar>
  );
}
