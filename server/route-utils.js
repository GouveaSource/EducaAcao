export function handleDatabaseError(error, res) {
  if (error?.code === "ER_DUP_ENTRY") {
    return res.status(409).json({ error: "Já existe um registro com esses dados." });
  }
  if (error?.code === "ER_NO_REFERENCED_ROW_2") {
    return res.status(400).json({ error: "Há um relacionamento inválido nos dados informados." });
  }
  console.error("Erro na API:", error);
  return res.status(500).json({ error: "Não foi possível processar a operação." });
}
