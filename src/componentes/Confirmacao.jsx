import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";

export default function Confirmacao({
  aberto,
  titulo,
  texto,
  confirmar,
  cancelar,
  operando = false,
  confirmarTexto = "Confirmar",
  operandoTexto = "Excluindo...",
}) {
  return (
    <Dialog open={aberto} onClose={operando ? undefined : cancelar} fullWidth maxWidth="xs">
      <DialogTitle>{titulo}</DialogTitle>
      <DialogContent>
        <Typography>{texto}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={cancelar} disabled={operando}>
          Cancelar
        </Button>
        <Button color="error" variant="contained" onClick={confirmar} disabled={operando}>
          {operando ? operandoTexto : confirmarTexto}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
