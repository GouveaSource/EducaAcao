import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
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
import DeleteIcon from "@mui/icons-material/Delete";
import ReplayIcon from "@mui/icons-material/Replay";
import SearchIcon from "@mui/icons-material/Search";
import { api } from "../servicos/api";
import { formatarCpf } from "../utils/formatadores";
import Confirmacao from "../componentes/Confirmacao";
import { Carregando, Mensagem } from "../componentes/Feedback";
import BaseTable from "../componentes/BaseTable";

const vazio = { nome: "", cpf: "", email: "", telefone: "", ativo: true };

export default function Doadores() {
  const [doadores, setDoadores] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [pesquisa, setPesquisa] = useState("");
  const [dialogo, setDialogo] = useState(false);
  const [formulario, setFormulario] = useState(vazio);
  const [editando, setEditando] = useState(null);
  const [erros, setErros] = useState({});
  const [operando, setOperando] = useState(false);
  const [excluir, setExcluir] = useState(null);

  async function carregar() {
    setCarregando(true);
    setErro("");
    try {
      setDoadores(await api.listarDoadores());
    } catch (error) {
      setErro(error.message);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  const filtrados = useMemo(() => {
    const termo = pesquisa.trim().replace(/\D/g, "");
    return doadores.filter((doador) => {
      if (!termo) return doador.nome.toLowerCase().includes(pesquisa.trim().toLowerCase());
      return (
        doador.nome.toLowerCase().includes(pesquisa.trim().toLowerCase()) ||
        String(doador.cpf).replace(/\D/g, "").includes(termo)
      );
    });
  }, [doadores, pesquisa]);

  const colunas = [
    { field: "nome", headerName: "Nome", minWidth: 160, flex: 1 },
    {
      field: "cpf",
      headerName: "CPF",
      width: 140,
      valueFormatter: (value) => formatarCpf(value),
    },
    { field: "email", headerName: "E-mail", minWidth: 200, flex: 1 },
    {
      field: "telefone",
      headerName: "Telefone",
      width: 160,
      valueGetter: (value) => value || "-",
    },
    {
      field: "ativo",
      headerName: "Situação",
      width: 120,
      renderCell: ({ value }) => (
        <Typography
          variant="body2"
          color={value ? "success.main" : "error.main"}
          sx={{
            display: "flex",
            alignItems: "center",
            height: "100%",
            width: "100%",
          }}
        >
          {value ? "Ativo" : "Inativo"}
        </Typography>
      ),
    },
    {
      field: "acoes",
      headerName: "Ações",
      width: 170,
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
              onClick={() => setExcluir(row)}
            >
              <DeleteIcon />
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

  function abrirNovo() {
    setEditando(null);
    setFormulario(vazio);
    setErros({});
    setDialogo(true);
  }
  function abrirEdicao(doador) {
    setEditando(doador);
    setFormulario({
      nome: doador.nome,
      cpf: doador.cpf,
      email: doador.email,
      telefone: doador.telefone || "",
      ativo: Boolean(doador.ativo),
    });
    setErros({});
    setDialogo(true);
  }

  function validar() {
    const novos = {};
    if (!formulario.nome.trim()) novos.nome = "Informe o nome.";
    if (String(formulario.cpf).replace(/\D/g, "").length !== 11)
      novos.cpf = "Informe um CPF com 11 dígitos.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formulario.email))
      novos.email = "Informe um e-mail válido.";
    if (formulario.telefone && formulario.telefone.length > 30)
      novos.telefone = "Use até 30 caracteres.";
    setErros(novos);
    return Object.keys(novos).length === 0;
  }

  async function salvar(event) {
    event.preventDefault();
    if (!validar()) return;
    setOperando(true);
    setErro("");
    setSucesso("");
    const dados = {
      nome: formulario.nome.trim(),
      cpf: formulario.cpf.replace(/\D/g, ""),
      email: formulario.email.trim(),
      telefone: formulario.telefone.trim(),
      ativo: Boolean(formulario.ativo),
    };
    try {
      if (editando) await api.atualizarDoador(editando.id_doador, dados);
      else await api.criarDoador(dados);
      setSucesso(editando ? "Doador atualizado com sucesso." : "Doador cadastrado com sucesso.");
      setDialogo(false);
      await carregar();
    } catch (error) {
      setErro(error.message);
    } finally {
      setOperando(false);
    }
  }

  async function confirmarExclusao() {
    setOperando(true);
    setErro("");
    setSucesso("");
    try {
      await api.excluirDoador(excluir.id_doador);
      setSucesso("Doador inativado com sucesso.");
      setExcluir(null);
      await carregar();
    } catch (error) {
      setErro(error.message);
    } finally {
      setOperando(false);
    }
  }

  async function reativar(doador) {
    setOperando(true);
    setErro("");
    setSucesso("");
    try {
      await api.ativarDoador(doador.id_doador);
      setSucesso("Doador reativado com sucesso.");
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
        mb={3}
        spacing={2}
      >
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Doadores
          </Typography>
          <Typography color="text.secondary">Cadastre e gerencie os doadores.</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={abrirNovo}>
          Novo doador
        </Button>
      </Stack>
      <Mensagem tipo="success" texto={sucesso} />
      <Mensagem tipo="error" texto={erro} />
      <TextField
        fullWidth
        placeholder="Pesquisar por nome ou CPF"
        value={pesquisa}
        onChange={(e) => setPesquisa(e.target.value)}
        slotProps={{
          input: { startAdornment: <SearchIcon sx={{ mr: 1, color: "text.secondary" }} /> },
        }}
        sx={{ mb: 2, bgcolor: "white" }}
      />
      {carregando ? (
        <Carregando texto="Carregando doadores..." />
      ) : filtrados.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography color="text.secondary">Nenhum doador encontrado.</Typography>
        </Paper>
      ) : (
        <BaseTable rows={filtrados} getRowId={(doador) => doador.id_doador} columns={colunas} />
      )}

      <Dialog
        open={dialogo}
        onClose={operando ? undefined : () => setDialogo(false)}
        fullWidth
        maxWidth="sm"
      >
        <form onSubmit={salvar}>
          <DialogTitle>{editando ? "Editar doador" : "Novo doador"}</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ pt: 1 }}>
              <TextField
                label="Nome"
                value={formulario.nome}
                onChange={(e) => setFormulario({ ...formulario, nome: e.target.value })}
                error={Boolean(erros.nome)}
                helperText={erros.nome}
                fullWidth
              />
              <TextField
                label="CPF"
                value={formulario.cpf}
                onChange={(e) => setFormulario({ ...formulario, cpf: e.target.value })}
                error={Boolean(erros.cpf)}
                helperText={erros.cpf}
                slotProps={{ htmlInput: { inputMode: "numeric" } }}
                fullWidth
              />
              <TextField
                label="E-mail"
                type="email"
                value={formulario.email}
                onChange={(e) => setFormulario({ ...formulario, email: e.target.value })}
                error={Boolean(erros.email)}
                helperText={erros.email}
                fullWidth
              />
              <TextField
                label="Telefone"
                value={formulario.telefone}
                onChange={(e) => setFormulario({ ...formulario, telefone: e.target.value })}
                error={Boolean(erros.telefone)}
                helperText={erros.telefone}
                fullWidth
              />
              {editando && (
                <TextField
                  select
                  label="Situação"
                  value={String(formulario.ativo)}
                  onChange={(e) =>
                    setFormulario({ ...formulario, ativo: e.target.value === "true" })
                  }
                >
                  <MenuItem value="true">Ativo</MenuItem>
                  <MenuItem value="false">Inativo</MenuItem>
                </TextField>
              )}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogo(false)} disabled={operando}>
              Cancelar
            </Button>
            <Button type="submit" variant="contained" disabled={operando}>
              {operando ? "Salvando..." : "Salvar"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      <Confirmacao
        aberto={Boolean(excluir)}
        titulo="Inativar doador"
        texto={`Deseja inativar ${excluir?.nome || "este doador"}?`}
        confirmar={confirmarExclusao}
        cancelar={() => setExcluir(null)}
        operando={operando}
      />
    </Box>
  );
}
