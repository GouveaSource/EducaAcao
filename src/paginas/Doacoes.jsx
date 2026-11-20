import { useEffect, useState } from "react";
import { Box, Button, Chip, IconButton, Stack, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import { useNavigate } from "react-router-dom";
import { api } from "../servicos/api";
import { formatarData } from "../utils/formatadores";
import { Carregando, Mensagem } from "../componentes/Feedback";
import BaseTable from "../componentes/BaseTable";

export default function Doacoes() {
  const navegar = useNavigate();
  const [doacoes, setDoacoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    api
      .listarDoacoes()
      .then(setDoacoes)
      .catch((error) => setErro(error.message))
      .finally(() => setCarregando(false));
  }, []);

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
            Doações
          </Typography>
          <Typography color="text.secondary">
            {carregando
              ? "Consultando..."
              : `${doacoes.length} doação${doacoes.length === 1 ? "" : "s"} registrada${doacoes.length === 1 ? "" : "s"}`}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navegar("/doacoes/nova")}
        >
          Nova doação
        </Button>
      </Stack>
      <Mensagem tipo="error" texto={erro} />
      {carregando ? (
        <Carregando texto="Carregando doações..." />
      ) : doacoes.length === 0 ? (
        <Mensagem tipo="info" texto="Nenhuma doação foi registrada." />
      ) : (
        <BaseTable
          rows={doacoes}
          getRowId={(doacao) => doacao.id_doacao}
          getRowHeight={() => "auto"}
          columns={[
            {
              field: "nome_doador",
              headerName: "Doador",
              minWidth: 180,
              flex: 1,
            },
            {
              field: "data_doacao",
              headerName: "Data",
              width: 130,
              valueFormatter: (value) => formatarData(value),
            },
            {
              field: "descricao",
              headerName: "Descrição",
              minWidth: 200,
              flex: 1,
            },
            {
              field: "itens",
              headerName: "Itens recebidos",
              minWidth: 280,
              flex: 1.5,
              sortable: false,
              renderCell: ({ row }) =>
                row.itens?.length ? (
                  <Stack spacing={0.75} sx={{ py: 1, width: "100%" }}>
                    {row.itens.map((item) => (
                      <Stack
                        key={item.id_item}
                        direction="row"
                        spacing={1}
                        sx={{ justifyContent: "space-between", alignItems: "center" }}
                      >
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {item.nome}
                          </Typography>
                          {item.categoria && (
                            <Typography variant="caption" color="text.secondary">
                              {item.categoria}
                            </Typography>
                          )}
                        </Box>
                        <Chip
                          label={`${item.quantidade} unidade${Number(item.quantidade) === 1 ? "" : "s"}`}
                          size="small"
                          variant="outlined"
                        />
                      </Stack>
                    ))}
                  </Stack>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Nenhum item informado.
                  </Typography>
                ),
            },
            {
              field: "acoes",
              headerName: "Ações",
              width: 90,
              align: "right",
              headerAlign: "right",
              sortable: false,
              filterable: false,
              renderCell: ({ row }) => (
                <IconButton
                  aria-label={`Editar doação de ${row.nome_doador}`}
                  onClick={() => navegar(`/doacoes/${row.id_doacao}/editar`)}
                >
                  <EditIcon />
                </IconButton>
              ),
            },
          ]}
        />
      )}
    </Box>
  );
}
