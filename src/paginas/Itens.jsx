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
  MenuItem,
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

export default function Itens() {
  const [itens, setItens] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [operando, setOperando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [aberto, setAberto] = useState(false);
  const [itemEditado, setItemEditado] = useState(null);
  const [nome, setNome] = useState("");
  const [idCategoria, setIdCategoria] = useState("");
  const [erros, setErros] = useState({});
  const [erroDialogo, setErroDialogo] = useState("");
  const [itemInativar, setItemInativar] = useState(null);

  async function carregar() {
    setCarregando(true);
    setErro("");
    try {
      const [listaItens, listaCategorias] = await Promise.all([
        api.listarItens(),
        api.listarCategorias(),
      ]);
      setItens(listaItens);
      setCategorias(listaCategorias);
    } catch (error) {
      setErro(error.message);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  const categoriasAtivas = categorias.filter((categoria) => Boolean(categoria.ativo));
  const categoriaAtualInativa =
    itemEditado &&
    categorias.find(
      (categoria) => Number(categoria.id_categoria) === Number(idCategoria) && !categoria.ativo,
    );

  const colunas = [
    { field: "nome_item", headerName: "Nome", minWidth: 200, flex: 1 },
    { field: "categoria", headerName: "Categoria", minWidth: 180, flex: 1 },
    {
      field: "ativo",
      headerName: "Situação",
      width: 130,
      renderCell: ({ value }) => (
        <Chip
          size="small"
          label={value ? "Ativo" : "Inativo"}
          color={value ? "success" : "default"}
        />
      ),
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
          <IconButton aria-label={`Editar ${row.nome_item}`} onClick={() => editarItem(row)}>
            <EditIcon />
          </IconButton>
          {Boolean(row.ativo) && (
            <IconButton
              aria-label={`Inativar ${row.nome_item}`}
              color="error"
              onClick={() => setItemInativar(row)}
            >
              <BlockIcon />
            </IconButton>
          )}
          {!row.ativo && (
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

  function novoItem() {
    setItemEditado(null);
    setNome("");
    setIdCategoria("");
    setErros({});
    setErroDialogo("");
    setAberto(true);
  }

  function editarItem(item) {
    setItemEditado(item);
    setNome(item.nome_item);
    setIdCategoria(String(item.id_categoria));
    setErros({});
    setErroDialogo("");
    setAberto(true);
  }

  async function salvar(event) {
    event.preventDefault();
    const novosErros = {};
    if (!nome.trim()) novosErros.nome = "Informe o nome do item.";
    if (nome.trim().length > 150) novosErros.nome = "O nome deve ter até 150 caracteres.";
    if (!idCategoria) novosErros.categoria = "Selecione uma categoria.";
    setErros(novosErros);
    if (Object.keys(novosErros).length) return;

    setOperando(true);
    setErro("");
    setSucesso("");
    setErroDialogo("");
    const dados = { nome: nome.trim(), id_categoria: Number(idCategoria) };
    try {
      if (itemEditado) {
        await api.atualizarItem(itemEditado.id_item, dados);
        setSucesso("Item atualizado com sucesso.");
      } else {
        await api.criarItem(dados);
        setSucesso("Item cadastrado com sucesso.");
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
      await api.inativarItem(itemInativar.id_item);
      setItemInativar(null);
      setSucesso("Item inativado. O histórico de doações foi preservado.");
      await carregar();
    } catch (error) {
      setErro(error.message);
      setItemInativar(null);
    } finally {
      setOperando(false);
    }
  }

  async function reativar(item) {
    setOperando(true);
    setErro("");
    setSucesso("");
    try {
      await api.ativarItem(item.id_item);
      setSucesso("Item reativado com sucesso.");
      await carregar();
    } catch (error) {
      setErro(error.message);
    } finally {
      setOperando(false);
    }
  }

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
            Itens
          </Typography>
          <Typography color="text.secondary">
            Cadastre itens e associe-os a uma categoria.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={novoItem}
          disabled={categoriasAtivas.length === 0 && !carregando}
        >
          Novo item
        </Button>
      </Stack>
      <Mensagem tipo="success" texto={sucesso} />
      <Mensagem tipo="error" texto={erro} />
      <Mensagem
        tipo="warning"
        texto={
          !carregando && categorias.length === 0
            ? "Cadastre uma categoria antes de cadastrar itens."
            : !carregando && categoriasAtivas.length === 0
              ? "Não há categorias ativas. Ative ou cadastre uma categoria antes de cadastrar itens."
              : ""
        }
      />
      {carregando ? (
        <Carregando texto="Carregando itens..." />
      ) : itens.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 4, textAlign: "center" }}>
          <Typography color="text.secondary">Nenhum item cadastrado.</Typography>
        </Paper>
      ) : (
        <BaseTable rows={itens} getRowId={(item) => item.id_item} columns={colunas} />
      )}

      <Dialog
        open={aberto}
        onClose={operando ? undefined : () => setAberto(false)}
        fullWidth
        maxWidth="sm"
      >
        <Box component="form" onSubmit={salvar}>
          <DialogTitle>{itemEditado ? "Editar item" : "Novo item"}</DialogTitle>
          <DialogContent>
            <Mensagem tipo="error" texto={erroDialogo} />
            <Stack spacing={2} sx={{ pt: 1 }}>
              <TextField
                autoFocus
                label="Nome do item"
                value={nome}
                onChange={(event) => {
                  setNome(event.target.value);
                  setErros((atuais) => ({ ...atuais, nome: "" }));
                }}
                error={Boolean(erros.nome)}
                helperText={erros.nome}
                slotProps={{ htmlInput: { maxLength: 150 } }}
                fullWidth
              />
              <TextField
                select
                label="Categoria"
                value={idCategoria}
                onChange={(event) => {
                  setIdCategoria(event.target.value);
                  setErros((atuais) => ({ ...atuais, categoria: "" }));
                }}
                error={Boolean(erros.categoria)}
                helperText={erros.categoria}
                fullWidth
              >
                {categoriaAtualInativa && (
                  <MenuItem value={String(categoriaAtualInativa.id_categoria)}>
                    {categoriaAtualInativa.nome} (inativa — categoria atual)
                  </MenuItem>
                )}
                {categoriasAtivas.map((categoria) => (
                  <MenuItem key={categoria.id_categoria} value={String(categoria.id_categoria)}>
                    {categoria.nome}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
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
        aberto={Boolean(itemInativar)}
        titulo="Inativar item"
        texto={`Deseja inativar "${itemInativar?.nome_item || ""}"? O item permanecerá no histórico das doações já registradas.`}
        confirmar={inativar}
        cancelar={() => setItemInativar(null)}
        operando={operando}
        confirmarTexto="Inativar"
        operandoTexto="Inativando..."
      />
    </Box>
  );
}
