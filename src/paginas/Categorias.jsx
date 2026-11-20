import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import BlockIcon from "@mui/icons-material/Block";
import ReplayIcon from "@mui/icons-material/Replay";
import { api } from "../servicos/api";
import Confirmacao from "../componentes/Confirmacao";
import { Carregando, Mensagem } from "../componentes/Feedback";
import BaseTable from "../componentes/BaseTable";

export default function Categorias() {
  const [categorias, setCategorias] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [operando, setOperando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [aberto, setAberto] = useState(false);
  const [categoriaEditada, setCategoriaEditada] = useState(null);
  const [nome, setNome] = useState("");
  const [erroNome, setErroNome] = useState("");
  const [erroDialogo, setErroDialogo] = useState("");
  const [categoriaInativar, setCategoriaInativar] = useState(null);

  async function carregar() {
    setCarregando(true);
    setErro("");
    try {
      setCategorias(await api.listarCategorias());
    } catch (error) {
      setErro(error.message);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  function abrirCadastro() {
    setCategoriaEditada(null);
    setNome("");
    setErroNome("");
    setErroDialogo("");
    setAberto(true);
  }

  function abrirEdicao(categoria) {
    setCategoriaEditada(categoria);
    setNome(categoria.nome);
    setErroNome("");
    setErroDialogo("");
    setAberto(true);
  }

  async function salvar(event) {
    event.preventDefault();
    const nomeLimpo = nome.trim();
    if (!nomeLimpo) {
      setErroNome("Informe o nome da categoria.");
      return;
    }
    if (nomeLimpo.length > 100) {
      setErroNome("O nome deve ter até 100 caracteres.");
      return;
    }

    setOperando(true);
    setErro("");
    setSucesso("");
    setErroDialogo("");
    try {
      if (categoriaEditada) {
        await api.atualizarCategoria(categoriaEditada.id_categoria, { nome: nomeLimpo });
        setSucesso("Categoria atualizada com sucesso.");
      } else {
        await api.criarCategoria({ nome: nomeLimpo });
        setSucesso("Categoria cadastrada com sucesso.");
      }
      setAberto(false);
      await carregar();
    } catch (error) {
      setErro(error.message);
      setErroDialogo(error.message);
    } finally {
      setOperando(false);
    }
  }

  async function inativar() {
    setOperando(true);
    setErro("");
    setSucesso("");
    try {
      await api.inativarCategoria(categoriaInativar.id_categoria);
      setCategoriaInativar(null);
      setSucesso("Categoria inativada. Os itens e doações existentes foram preservados.");
      await carregar();
    } catch (error) {
      setErro(error.message);
      setCategoriaInativar(null);
    } finally {
      setOperando(false);
    }
  }

  async function reativar(categoria) {
    setOperando(true);
    setErro("");
    setSucesso("");
    try {
      await api.ativarCategoria(categoria.id_categoria);
      setSucesso("Categoria reativada com sucesso.");
      await carregar();
    } catch (error) {
      setErro(error.message);
    } finally {
      setOperando(false);
    }
  }

  function Situacao({ ativo }) {
    return (
      <Chip
        size="small"
        label={ativo ? "Ativa" : "Inativa"}
        color={ativo ? "success" : "default"}
      />
    );
  }

  const colunas = [
    { field: "nome", headerName: "Nome", minWidth: 200, flex: 1 },
    {
      field: "ativo",
      headerName: "Situação",
      width: 140,
      renderCell: ({ value }) => <Situacao ativo={Boolean(value)} />,
    },
    {
      field: "acoes",
      headerName: "Ações",
      width: 170,
      align: "right",
      headerAlign: "right",
      sortable: false,
      filterable: false,
      renderCell: ({ row }) => (
        <Stack direction="row">
          <IconButton aria-label={`Editar ${row.nome}`} onClick={() => abrirEdicao(row)}>
            <EditIcon />
          </IconButton>
          {row.ativo ? (
            <IconButton
              aria-label={`Inativar ${row.nome}`}
              color="error"
              onClick={() => setCategoriaInativar(row)}
            >
              <BlockIcon />
            </IconButton>
          ) : (
            <Button
              color="success"
              disabled={operando}
              size="small"
              startIcon={<ReplayIcon />}
              onClick={() => reativar(row)}
            >
              Reativar
            </Button>
          )}
        </Stack>
      ),
    },
  ];

  return (
    <Box>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        sx={{ justifyContent: "space-between", alignItems: { xs: "stretch", sm: "center" } }}
        spacing={2}
        mb={3}
      >
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Categorias
          </Typography>
          <Typography color="text.secondary">Organize os itens por categoria.</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={abrirCadastro}>
          Nova categoria
        </Button>
      </Stack>
      <Mensagem tipo="success" texto={sucesso} />
      <Mensagem tipo="error" texto={erro} />
      {carregando ? (
        <Carregando texto="Carregando categorias..." />
      ) : categorias.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 4, textAlign: "center" }}>
          <Typography color="text.secondary">Nenhuma categoria cadastrada.</Typography>
        </Paper>
      ) : (
        <BaseTable
          rows={categorias}
          getRowId={(categoria) => categoria.id_categoria}
          columns={colunas}
        />
      )}

      <Dialog
        open={aberto}
        onClose={operando ? undefined : () => setAberto(false)}
        fullWidth
        maxWidth="xs"
      >
        <Box component="form" onSubmit={salvar}>
          <DialogTitle>{categoriaEditada ? "Editar categoria" : "Nova categoria"}</DialogTitle>
          <DialogContent>
            <Mensagem tipo="error" texto={erroDialogo} />
            <TextField
              autoFocus
              fullWidth
              label="Nome"
              value={nome}
              onChange={(event) => {
                setNome(event.target.value);
                setErroNome("");
              }}
              error={Boolean(erroNome)}
              helperText={erroNome}
              slotProps={{ htmlInput: { maxLength: 100 } }}
              sx={{ mt: 1 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAberto(false)} disabled={operando}>
              Cancelar
            </Button>
            <Button type="submit" variant="contained" disabled={operando}>
              {operando ? "Salvando..." : "Salvar"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
      <Confirmacao
        aberto={Boolean(categoriaInativar)}
        titulo="Inativar categoria"
        texto={`Deseja inativar "${categoriaInativar?.nome || ""}"? Itens e doações existentes serão mantidos.`}
        confirmar={inativar}
        cancelar={() => setCategoriaInativar(null)}
        operando={operando}
        confirmarTexto="Inativar"
        operandoTexto="Inativando..."
      />
    </Box>
  );
}
