import { Router } from "express";
import pool from "../db.js";
import { handleDatabaseError } from "../route-utils.js";
import { positiveInteger } from "../validation.js";

const router = Router();

function validarNome(nome) {
  if (typeof nome !== "string" || !nome.trim()) return "Nome da categoria é obrigatório.";
  if (nome.trim().length > 100) return "Nome da categoria deve ter até 100 caracteres.";
  return null;
}

function responderErro(error, res) {
  if (error?.code === "ER_DUP_ENTRY") {
    return res.status(409).json({ error: "Já existe uma categoria com esse nome." });
  }
  return handleDatabaseError(error, res);
}

router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id_categoria, nome, ativo FROM categoria ORDER BY nome",
    );
    res.json(rows);
  } catch (error) {
    handleDatabaseError(error, res);
  }
});

router.post("/", async (req, res) => {
  const { nome } = req.body ?? {};
  const validationError = validarNome(nome);
  if (validationError) return res.status(400).json({ error: validationError });

  try {
    const nomeNormalizado = nome.trim();
    const [result] = await pool.execute("INSERT INTO categoria (nome) VALUES (?)", [
      nomeNormalizado,
    ]);
    res.status(201).json({
      id_categoria: result.insertId,
      nome: nomeNormalizado,
      ativo: true,
    });
  } catch (error) {
    responderErro(error, res);
  }
});

router.put("/:id", async (req, res) => {
  if (!positiveInteger(req.params.id)) {
    return res.status(400).json({ error: "Identificador de categoria inválido." });
  }
  const { nome } = req.body ?? {};
  const validationError = validarNome(nome);
  if (validationError) return res.status(400).json({ error: validationError });

  try {
    const [existing] = await pool.execute(
      "SELECT id_categoria, ativo FROM categoria WHERE id_categoria = ?",
      [Number(req.params.id)],
    );
    if (existing.length === 0) {
      return res.status(404).json({ error: "Categoria não encontrada." });
    }

    const nomeNormalizado = nome.trim();
    await pool.execute("UPDATE categoria SET nome = ? WHERE id_categoria = ?", [
      nomeNormalizado,
      Number(req.params.id),
    ]);
    res.json({
      id_categoria: Number(req.params.id),
      nome: nomeNormalizado,
      ativo: Boolean(existing[0].ativo),
    });
  } catch (error) {
    responderErro(error, res);
  }
});

router.patch("/:id/inativar", async (req, res) => {
  if (!positiveInteger(req.params.id)) {
    return res.status(400).json({ error: "Identificador de categoria inválido." });
  }

  try {
    const [existing] = await pool.execute(
      "SELECT id_categoria FROM categoria WHERE id_categoria = ?",
      [Number(req.params.id)],
    );
    if (existing.length === 0) {
      return res.status(404).json({ error: "Categoria não encontrada." });
    }
    await pool.execute("UPDATE categoria SET ativo = FALSE WHERE id_categoria = ?", [
      Number(req.params.id),
    ]);
    res.json({ id_categoria: Number(req.params.id), ativo: false });
  } catch (error) {
    handleDatabaseError(error, res);
  }
});

router.patch("/:id/ativar", async (req, res) => {
  if (!positiveInteger(req.params.id)) {
    return res.status(400).json({ error: "Identificador de categoria inválido." });
  }

  try {
    const [existing] = await pool.execute(
      "SELECT id_categoria FROM categoria WHERE id_categoria = ?",
      [Number(req.params.id)],
    );
    if (existing.length === 0) {
      return res.status(404).json({ error: "Categoria não encontrada." });
    }
    await pool.execute("UPDATE categoria SET ativo = TRUE WHERE id_categoria = ?", [
      Number(req.params.id),
    ]);
    res.json({ id_categoria: Number(req.params.id), ativo: true });
  } catch (error) {
    handleDatabaseError(error, res);
  }
});

export default router;
