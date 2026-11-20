async function requisitar(caminho, opcoes = {}) {
  let resposta;
  try {
    resposta = await fetch(caminho, opcoes);
  } catch {
    throw new Error("Não foi possível conectar à API.");
  }

  let dados = null;
  const texto = await resposta.text();
  if (texto) {
    try {
      dados = JSON.parse(texto);
    } catch {
      throw new Error("A API respondeu em um formato inválido.");
    }
  }

  if (!resposta.ok) {
    throw new Error(
      dados?.error || dados?.message || dados?.mensagem || `Erro na API (${resposta.status}).`,
    );
  }
  return dados;
}

const json = (metodo, corpo) => ({
  method: metodo,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(corpo),
});

export const api = {
  verificarSaude: () => requisitar("/api/health"),
  listarDoadores: () => requisitar("/api/doadores"),
  criarDoador: (doador) => requisitar("/api/doadores", json("POST", doador)),
  atualizarDoador: (id, doador) => requisitar(`/api/doadores/${id}`, json("PUT", doador)),
  excluirDoador: (id) => requisitar(`/api/doadores/${id}`, { method: "DELETE" }),
  ativarDoador: (id) => requisitar(`/api/doadores/${id}/ativar`, { method: "PATCH" }),
  listarCategorias: () => requisitar("/api/categorias"),
  criarCategoria: (categoria) => requisitar("/api/categorias", json("POST", categoria)),
  atualizarCategoria: (id, categoria) =>
    requisitar(`/api/categorias/${id}`, json("PUT", categoria)),
  inativarCategoria: (id) => requisitar(`/api/categorias/${id}/inativar`, { method: "PATCH" }),
  ativarCategoria: (id) => requisitar(`/api/categorias/${id}/ativar`, { method: "PATCH" }),
  listarItens: () => requisitar("/api/itens"),
  criarItem: (item) => requisitar("/api/itens", json("POST", item)),
  atualizarItem: (id, item) => requisitar(`/api/itens/${id}`, json("PUT", item)),
  inativarItem: (id) => requisitar(`/api/itens/${id}/inativar`, { method: "PATCH" }),
  ativarItem: (id) => requisitar(`/api/itens/${id}/ativar`, { method: "PATCH" }),
  listarDoacoes: () => requisitar("/api/doacoes"),
  criarDoacao: (doacao) => requisitar("/api/doacoes", json("POST", doacao)),
  obterDoacao: (id) => requisitar(`/api/doacoes/${id}`),
  atualizarDoacao: (id, doacao) => requisitar(`/api/doacoes/${id}`, json("PUT", doacao)),
};
