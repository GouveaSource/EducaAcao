import { useEffect, useState } from "react";
import {
  Box,
  Button,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../servicos/api";
import { dataLocalAtual } from "../utils/formatadores";
import { Carregando, Mensagem } from "../componentes/Feedback";

export default function NovaDoacao() {
  const { id } = useParams();
  const navegar = useNavigate();
  const editando = Boolean(id);
  const [doadores, setDoadores] = useState([]);
  const [itens, setItens] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [operando, setOperando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [idDoador, setIdDoador] = useState("");
  const [data, setData] = useState(dataLocalAtual);
  const [descricao, setDescricao] = useState("");
  const [linhas, setLinhas] = useState([{ id_item: "", quantidade: "1" }]);

  useEffect(() => {
    Promise.all([
      api.listarDoadores(),
      api.listarItens(),
      editando ? api.obterDoacao(id) : Promise.resolve(null),
    ])
      .then(([listaDoadores, listaItens, doacao]) => {
        const doadoresPermitidos = listaDoadores.filter(
          (doador) => doador.ativo || (doacao && doador.id_doador === doacao.id_doador),
        );
        setDoadores(doadoresPermitidos);

        const idsItensDaDoacao = new Set(doacao?.itens?.map((item) => item.id_item) ?? []);
        const itensPermitidos = listaItens.filter(
          (item) =>
            (Boolean(item.ativo) && Boolean(item.categoria_ativa)) ||
            idsItensDaDoacao.has(item.id_item),
        );
        setItens(itensPermitidos);

        if (doacao) {
          setIdDoador(String(doacao.id_doador));
          setData(String(doacao.data_doacao).slice(0, 10));
          setDescricao(doacao.descricao);
          setLinhas(
            doacao.itens.map((item) => ({
              id_item: String(item.id_item),
              quantidade: String(item.quantidade),
            })),
          );
          if (doacao.itens.length === 0) {
            setLinhas([{ id_item: "", quantidade: "1" }]);
          }
        }
      })
      .catch((error) => setErro(error.message))
      .finally(() => setCarregando(false));
  }, [editando, id]);

  function limpar() {
    if (editando) {
      setErro("Use Cancelar para sair da edição.");
      return;
    }
    setIdDoador("");
    setData(dataLocalAtual());
    setDescricao("");
    setLinhas([{ id_item: "", quantidade: "1" }]);
  }

  function atualizarLinha(indice, campo, valor) {
    setLinhas((atuais) =>
      atuais.map((linha, posicao) => (posicao === indice ? { ...linha, [campo]: valor } : linha)),
    );
  }

  async function enviar(event) {
    event.preventDefault();
    setErro("");
    setSucesso("");
    if (!idDoador) {
      setErro("Selecione um doador.");
      return;
    }
    if (!data) {
      setErro("Informe a data da doação.");
      return;
    }
    if (!descricao.trim()) {
      setErro("Informe uma descrição.");
      return;
    }
    if (linhas.length === 0) {
      setErro("Informe ao menos um item.");
      return;
    }
    if (linhas.some((linha) => !linha.id_item)) {
      setErro("Selecione todos os itens.");
      return;
    }
    if (
      linhas.some(
        (linha) => !Number.isInteger(Number(linha.quantidade)) || Number(linha.quantidade) < 1,
      )
    ) {
      setErro("As quantidades devem ser números inteiros maiores que zero.");
      return;
    }
    const ids = linhas.map((linha) => Number(linha.id_item));
    if (new Set(ids).size !== ids.length) {
      setErro("Não repita itens na mesma doação.");
      return;
    }

    setOperando(true);
    try {
      const dados = {
        id_doador: Number(idDoador),
        data_doacao: data,
        descricao: descricao.trim(),
        itens: linhas.map((linha) => ({
          id_item: Number(linha.id_item),
          quantidade: Number(linha.quantidade),
        })),
      };
      if (editando) {
        await api.atualizarDoacao(id, dados);
        navegar("/doacoes");
        return;
      }
      await api.criarDoacao(dados);
      setSucesso("Doação registrada com sucesso.");
      setIdDoador("");
      setData(dataLocalAtual());
      setDescricao("");
      setLinhas([{ id_item: "", quantidade: "1" }]);
    } catch (error) {
      setErro(error.message);
    } finally {
      setOperando(false);
    }
  }

  if (carregando) return <Carregando texto="Carregando formulário..." />;

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} mb={1}>
        {editando ? "Editar doação" : "Registrar doação"}
      </Typography>
      <Typography color="text.secondary" mb={3}>
        {editando
          ? "Atualize o doador, a data, a descrição e os itens recebidos."
          : "Informe o doador e os itens recebidos."}
      </Typography>
      <Mensagem tipo="success" texto={sucesso} />
      <Mensagem tipo="error" texto={erro} />
      <Mensagem
        tipo="warning"
        texto={
          doadores.length === 0
            ? "Não há doadores ativos cadastrados. Cadastre um doador antes de registrar uma doação."
            : ""
        }
      />
      {doadores.length === 0 ? (
        <Box />
      ) : (
        <Paper component="form" onSubmit={enviar} variant="outlined" sx={{ p: { xs: 2, sm: 3 } }}>
          <Stack spacing={2.5}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                select
                label="Doador"
                value={idDoador}
                onChange={(e) => setIdDoador(e.target.value)}
                required
                fullWidth
              >
                {doadores.map((doador) => (
                  <MenuItem key={doador.id_doador} value={doador.id_doador}>
                    {doador.nome}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Data da doação"
                type="date"
                value={data}
                onChange={(e) => setData(e.target.value)}
                required
                sx={{ minWidth: { sm: 220 } }}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Stack>
            <TextField
              label="Descrição"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              required
              multiline
              minRows={3}
            />
            <Typography variant="h6">Itens da doação</Typography>
            {linhas.map((linha, indice) => (
              <Stack
                key={indice}
                direction={{ xs: "column", sm: "row" }}
                spacing={1.5}
                sx={{ alignItems: { sm: "center" } }}
              >
                <TextField
                  select
                  label="Item"
                  value={linha.id_item}
                  onChange={(e) => atualizarLinha(indice, "id_item", e.target.value)}
                  required
                  fullWidth
                >
                  {itens.map((item) => (
                    <MenuItem key={item.id_item} value={item.id_item}>
                      {item.nome_item} — {item.categoria}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  label="Quantidade"
                  type="number"
                  value={linha.quantidade}
                  onChange={(e) => atualizarLinha(indice, "quantidade", e.target.value)}
                  required
                  slotProps={{ htmlInput: { min: 1, step: 1 } }}
                  sx={{ minWidth: { sm: 160 } }}
                />
                <IconButton
                  aria-label={`Remover item ${indice + 1}`}
                  color="error"
                  disabled={linhas.length === 1}
                  onClick={() =>
                    setLinhas((atuais) => atuais.filter((_, posicao) => posicao !== indice))
                  }
                >
                  <DeleteIcon />
                </IconButton>
              </Stack>
            ))}
            <Box>
              <Button
                startIcon={<AddIcon />}
                onClick={() => setLinhas((atuais) => [...atuais, { id_item: "", quantidade: "1" }])}
              >
                Adicionar item
              </Button>
            </Box>
            <Stack direction="row" spacing={1} sx={{ justifyContent: "flex-end" }}>
              <Button
                onClick={() => (editando ? navegar("/doacoes") : limpar())}
                disabled={operando}
              >
                {editando ? "Cancelar" : "Limpar"}
              </Button>
              <Button type="submit" variant="contained" disabled={operando}>
                {operando
                  ? editando
                    ? "Salvando..."
                    : "Registrando..."
                  : editando
                    ? "Salvar alterações"
                    : "Registrar doação"}
              </Button>
            </Stack>
          </Stack>
        </Paper>
      )}
    </Box>
  );
}
