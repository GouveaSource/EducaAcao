import "dotenv/config";
import express from "express";
import routes from "./routes/index.js";

const app = express();
app.use(express.json({ limit: "1mb" }));
app.use("/api", routes);

app.use((req, res) => {
  res.status(404).json({ error: "Rota não encontrada." });
});

app.use((error, req, res, _next) => {
  if (error?.type === "entity.parse.failed") {
    return res.status(400).json({ error: "JSON inválido no corpo da requisição." });
  }
  if (error?.type === "entity.too.large") {
    return res.status(413).json({ error: "Corpo da requisição excede o tamanho permitido." });
  }
  console.error("Erro não tratado:", error);
  return res.status(500).json({ error: "Não foi possível processar a requisição." });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API rodando em http://localhost:${PORT}`);
});
