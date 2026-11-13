import "dotenv/config";
import express from "express";
import pool from "./db.js";

const app = express();
app.use(express.json({ limit: "1mb" }));

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function positiveInteger(value, maximum = 4294967295) {
  return Number.isSafeInteger(Number(value)) && Number(value) > 0 && Number(value) <= maximum;
}

function validEmail(value) {
  return typeof value === "string" && value.trim().length <= 150 && emailRegex.test(value.trim());
}

function validCpf(value) {
  if (typeof value !== "string") return false;
  const cpf = value.replace(/\D/g, "");
  if (cpf.length !== 11 || /^([0-9])\1+$/.test(cpf)) return false;

  for (let checkIndex = 9; checkIndex < 11; checkIndex++) {
    let sum = 0;
    for (let i = 0; i < checkIndex; i++) sum += Number(cpf[i]) * (checkIndex + 1 - i);
    const remainder = (sum * 10) % 11;
    const digit = remainder === 10 ? 0 : remainder;
    if (digit !== Number(cpf[checkIndex])) return false;
  }
  return true;
}

function normalizeCpf(value) {
  return String(value).replace(/\D/g, "");
}

function validDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function handleDatabaseError(error, res) {
  if (error?.code === "ER_DUP_ENTRY") {
    return res.status(409).json({ error: "Já existe um registro com esses dados." });
  }
  if (error?.code === "ER_NO_REFERENCED_ROW_2") {
    return res.status(400).json({ error: "Há um relacionamento inválido nos dados informados." });
  }
  console.error("Erro na API:", error);
  return res.status(500).json({ error: "Não foi possível processar a operação." });
}

app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({
      status: "ok",
      app: "EducaAcao",
      hora: new Date().toISOString(),
      database: "connected",
    });
  } catch {
    res.status(503).json({
      status: "unavailable",
      app: "EducaAcao",
      hora: new Date().toISOString(),
      database: "disconnected",
    });
  }
});

app.get("/api/doadores", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id_doador, nome, cpf, email, telefone, ativo, data_cadastro FROM doador ORDER BY id_doador DESC",
    );
    res.json(rows);
  } catch (error) {
    handleDatabaseError(error, res);
  }
});

app.get("/api/doadores/:id", async (req, res) => {
  if (!positiveInteger(req.params.id))
    return res.status(400).json({ error: "Identificador inválido." });

  try {
    const [rows] = await pool.execute(
      "SELECT id_doador, nome, cpf, email, telefone, ativo, data_cadastro FROM doador WHERE id_doador = ?",
      [Number(req.params.id)],
    );
    if (rows.length === 0) return res.status(404).json({ error: "Doador não encontrado." });
    res.json(rows[0]);
  } catch (error) {
    handleDatabaseError(error, res);
  }
});

app.post("/api/doadores", async (req, res) => {
  const { nome, cpf, email, telefone, ativo } = req.body ?? {};

  if (typeof nome !== "string" || !nome.trim())
    return res.status(400).json({ error: "Nome é obrigatório." });
  if (nome.trim().length > 150)
    return res.status(400).json({ error: "Nome deve ter até 150 caracteres." });
  if (!validCpf(cpf) || String(cpf).replace(/\D/g, "").length !== 11)
    return res.status(400).json({ error: "CPF inválido." });
  if (!validEmail(email)) return res.status(400).json({ error: "E-mail inválido." });
  if (telefone !== undefined && (typeof telefone !== "string" || telefone.trim().length > 30))
    return res.status(400).json({ error: "Telefone deve ser texto com até 30 caracteres." });
  if (ativo !== undefined && typeof ativo !== "boolean")
    return res.status(400).json({ error: "Ativo deve ser verdadeiro ou falso." });

  try {
    const [result] = await pool.execute(
      "INSERT INTO doador (nome, cpf, email, telefone, ativo) VALUES (?, ?, ?, ?, ?)",
      [
        nome.trim(),
        normalizeCpf(cpf),
        email.trim().toLowerCase(),
        telefone?.trim() || null,
        ativo ?? true,
      ],
    );
    res.status(201).json({
      id_doador: result.insertId,
      nome: nome.trim(),
      cpf: normalizeCpf(cpf),
      email: email.trim().toLowerCase(),
      telefone: telefone?.trim() || null,
      ativo: ativo ?? true,
    });
  } catch (error) {
    handleDatabaseError(error, res);
  }
});

app.put("/api/doadores/:id", async (req, res) => {
  if (!positiveInteger(req.params.id))
    return res.status(400).json({ error: "Identificador inválido." });
  const { nome, cpf, email, telefone, ativo } = req.body ?? {};

  if (typeof nome !== "string" || !nome.trim())
    return res.status(400).json({ error: "Nome é obrigatório." });
  if (nome.trim().length > 150)
    return res.status(400).json({ error: "Nome deve ter até 150 caracteres." });
  if (!validCpf(cpf) || String(cpf).replace(/\D/g, "").length !== 11)
    return res.status(400).json({ error: "CPF inválido." });
  if (!validEmail(email)) return res.status(400).json({ error: "E-mail inválido." });
  if (telefone !== undefined && (typeof telefone !== "string" || telefone.trim().length > 30))
    return res.status(400).json({ error: "Telefone deve ser texto com até 30 caracteres." });
  if (typeof ativo !== "boolean")
    return res.status(400).json({ error: "Ativo deve ser verdadeiro ou falso." });

  try {
    const [existing] = await pool.execute("SELECT id_doador FROM doador WHERE id_doador = ?", [
      Number(req.params.id),
    ]);
    if (existing.length === 0) return res.status(404).json({ error: "Doador não encontrado." });

    await pool.execute(
      "UPDATE doador SET nome = ?, cpf = ?, email = ?, telefone = ?, ativo = ? WHERE id_doador = ?",
      [
        nome.trim(),
        normalizeCpf(cpf),
        email.trim().toLowerCase(),
        telefone?.trim() || null,
        ativo,
        Number(req.params.id),
      ],
    );
    res.json({
      id_doador: Number(req.params.id),
      nome: nome.trim(),
      cpf: normalizeCpf(cpf),
      email: email.trim().toLowerCase(),
      telefone: telefone?.trim() || null,
      ativo,
    });
  } catch (error) {
    handleDatabaseError(error, res);
  }
});

app.delete("/api/doadores/:id", async (req, res) => {
  if (!positiveInteger(req.params.id))
    return res.status(400).json({ error: "Identificador inválido." });

  try {
    const [existing] = await pool.execute("SELECT id_doador FROM doador WHERE id_doador = ?", [
      Number(req.params.id),
    ]);
    if (existing.length === 0) return res.status(404).json({ error: "Doador não encontrado." });

    await pool.execute("UPDATE doador SET ativo = FALSE WHERE id_doador = ?", [
      Number(req.params.id),
    ]);
    res.status(204).send();
  } catch (error) {
    handleDatabaseError(error, res);
  }
});

app.get("/api/itens", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT i.id_item, i.nome AS nome_item, c.id_categoria, c.nome AS categoria FROM item i JOIN categoria c ON c.id_categoria = i.id_categoria ORDER BY c.nome, i.nome",
    );
    res.json(rows);
  } catch (error) {
    handleDatabaseError(error, res);
  }
});

app.get("/api/doacoes", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT d.id_doacao, d.data_doacao, d.descricao,
             doa.id_doador, doa.nome AS nome_doador, doa.email AS email_doador,
             i.id_item, i.nome AS nome_item, c.nome AS categoria,
             di.quantidade
      FROM doacao d
      JOIN doador doa ON doa.id_doador = d.id_doador
      LEFT JOIN doacao_item di ON di.id_doacao = d.id_doacao
      LEFT JOIN item i ON i.id_item = di.id_item
      LEFT JOIN categoria c ON c.id_categoria = i.id_categoria
      ORDER BY d.id_doacao DESC, i.nome
    `);

    const doacoes = new Map();
    for (const row of rows) {
      if (!doacoes.has(row.id_doacao)) {
        doacoes.set(row.id_doacao, {
          id_doacao: row.id_doacao,
          id_doador: row.id_doador,
          nome_doador: row.nome_doador,
          email_doador: row.email_doador,
          data_doacao: row.data_doacao,
          descricao: row.descricao,
          itens: [],
        });
      }
      if (row.id_item) {
        doacoes.get(row.id_doacao).itens.push({
          id_item: row.id_item,
          nome: row.nome_item,
          categoria: row.categoria,
          quantidade: row.quantidade,
        });
      }
    }
    res.json([...doacoes.values()]);
  } catch (error) {
    handleDatabaseError(error, res);
  }
});

app.post("/api/doacoes", async (req, res) => {
  const { id_doador, data_doacao, descricao, itens } = req.body ?? {};
  if (!positiveInteger(id_doador)) return res.status(400).json({ error: "Doador inválido." });
  if (!validDate(data_doacao)) return res.status(400).json({ error: "Data da doação inválida." });
  if (typeof descricao !== "string" || !descricao.trim())
    return res.status(400).json({ error: "Descrição é obrigatória." });
  if (descricao.trim().length > 65535)
    return res.status(400).json({ error: "Descrição deve ter até 65.535 caracteres." });
  if (!Array.isArray(itens) || itens.length === 0)
    return res.status(400).json({ error: "Informe ao menos um item." });
  if (itens.length > 1000)
    return res.status(400).json({ error: "Uma doação pode conter até 1.000 itens diferentes." });

  const itemIds = new Set();
  for (const item of itens) {
    if (!item || !positiveInteger(item.id_item))
      return res.status(400).json({ error: "Identificador de item inválido." });
    if (
      !positiveInteger(item.quantidade, 4294967295) ||
      !Number.isInteger(Number(item.quantidade)) ||
      Number(item.quantidade) < 1
    ) {
      return res
        .status(400)
        .json({ error: "Quantidade deve ser um número inteiro maior que zero." });
    }
    if (itemIds.has(Number(item.id_item)))
      return res.status(400).json({ error: "Não informe itens repetidos na mesma doação." });
    itemIds.add(Number(item.id_item));
  }

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [doadores] = await connection.execute(
      "SELECT id_doador FROM doador WHERE id_doador = ?",
      [Number(id_doador)],
    );
    if (doadores.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: "Doador não encontrado." });
    }

    for (const item of itens) {
      const [existingItems] = await connection.execute(
        "SELECT id_item FROM item WHERE id_item = ?",
        [Number(item.id_item)],
      );
      if (existingItems.length === 0) {
        await connection.rollback();
        return res.status(400).json({ error: "Existe um item inválido na doação." });
      }
    }

    const [result] = await connection.execute(
      "INSERT INTO doacao (id_doador, data_doacao, descricao) VALUES (?, ?, ?)",
      [Number(id_doador), data_doacao, descricao.trim()],
    );
    for (const item of itens) {
      await connection.execute(
        "INSERT INTO doacao_item (id_doacao, id_item, quantidade) VALUES (?, ?, ?)",
        [result.insertId, Number(item.id_item), Number(item.quantidade)],
      );
    }
    await connection.commit();
    res.status(201).json({ id_doacao: result.insertId });
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error("Falha ao desfazer transação:", rollbackError);
      }
    }
    handleDatabaseError(error, res);
  } finally {
    if (connection) connection.release();
  }
});

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
