import { Router } from "express";
import pool from "../db.js";
import { handleDatabaseError } from "../route-utils.js";
import { positiveInteger } from "../validation.js";

const router = Router();

function validarEntrada({ id_categoria, nome }) {
  if (!positiveInteger(id_categoria)) return "Categoria inválida.";
  if (typeof nome !== "string" || !nome.trim()) return "Nome do item é obrigatório.";
  if (nome.trim().length > 150) return "Nome do item deve ter até 150 caracteres.";
  return null;
}

async function obterItem(id) {
  const [rows] = await pool.execute(
    "SELECT i.id_item, i.nome AS nome_item, i.ativo, c.id_categoria, c.nome AS categoria, c.ativo AS categoria_ativa FROM item i JOIN categoria c ON c.id_categoria = i.id_categoria WHERE i.id_item = ?",
    [id],
  );
  return rows[0];
}

router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT i.id_item, i.nome AS nome_item, i.ativo, c.id_categoria, c.nome AS categoria, c.ativo AS categoria_ativa FROM item i JOIN categoria c ON c.id_categoria = i.id_categoria ORDER BY c.nome, i.nome",
    );
    res.json(rows);
  } catch (error) {
    handleDatabaseError(error, res);
  }
});

router.post("/", async (req, res) => {
  const { id_categoria, nome } = req.body ?? {};
  const validationError = validarEntrada({ id_categoria, nome });
  if (validationError) return res.status(400).json({ error: validationError });

  try {
    const [categorias] = await pool.execute(
      "SELECT id_categoria FROM categoria WHERE id_categoria = ? AND ativo = TRUE",
      [Number(id_categoria)],
    );
    if (categorias.length === 0) {
      return res.status(400).json({ error: "Categoria inexistente ou inativa." });
    }

    const [result] = await pool.execute("INSERT INTO item (id_categoria, nome) VALUES (?, ?)", [
      Number(id_categoria),
      nome.trim(),
    ]);
    res.status(201).json(await obterItem(result.insertId));
  } catch (error) {
    if (error?.code === "ER_NO_REFERENCED_ROW_2") {
      return res.status(400).json({ error: "A categoria informada não existe." });
    }
    handleDatabaseError(error, res);
  }
});

router.put("/:id", async (req, res) => {
  if (!positiveInteger(req.params.id)) {
    return res.status(400).json({ error: "Identificador de item inválido." });
  }
  const { id_categoria, nome } = req.body ?? {};
  const validationError = validarEntrada({ id_categoria, nome });
  if (validationError) return res.status(400).json({ error: validationError });

  try {
    const [existing] = await pool.execute(
      "SELECT id_item, id_categoria FROM item WHERE id_item = ?",
      [Number(req.params.id)],
    );
    if (existing.length === 0) {
      return res.status(404).json({ error: "Item não encontrado." });
    }

    const [categorias] = await pool.execute(
      "SELECT id_categoria FROM categoria WHERE id_categoria = ? AND (ativo = TRUE OR id_categoria = ?)",
      [Number(id_categoria), existing[0].id_categoria],
    );
    if (categorias.length === 0) {
      return res.status(400).json({ error: "Categoria inexistente ou inativa." });
    }

    await pool.execute("UPDATE item SET id_categoria = ?, nome = ? WHERE id_item = ?", [
      Number(id_categoria),
      nome.trim(),
      Number(req.params.id),
    ]);
    res.json(await obterItem(Number(req.params.id)));
  } catch (error) {
    if (error?.code === "ER_NO_REFERENCED_ROW_2") {
      return res.status(400).json({ error: "A categoria informada não existe." });
    }
    handleDatabaseError(error, res);
  }
});

router.patch("/:id/inativar", async (req, res) => {
  if (!positiveInteger(req.params.id)) {
    return res.status(400).json({ error: "Identificador de item inválido." });
  }

  try {
    const [existing] = await pool.execute("SELECT id_item FROM item WHERE id_item = ?", [
      Number(req.params.id),
    ]);
    if (existing.length === 0) {
      return res.status(404).json({ error: "Item não encontrado." });
    }
    await pool.execute("UPDATE item SET ativo = FALSE WHERE id_item = ?", [Number(req.params.id)]);
    res.json({ id_item: Number(req.params.id), ativo: false });
  } catch (error) {
    handleDatabaseError(error, res);
  }
});

router.patch("/:id/ativar", async (req, res) => {
  if (!positiveInteger(req.params.id)) {
    return res.status(400).json({ error: "Identificador de item inválido." });
  }

  try {
    const [existing] = await pool.execute(
      `SELECT i.id_item, c.ativo AS categoria_ativa
       FROM item i
       JOIN categoria c ON c.id_categoria = i.id_categoria
       WHERE i.id_item = ?`,
      [Number(req.params.id)],
    );
    if (existing.length === 0) {
      return res.status(404).json({ error: "Item não encontrado." });
    }
    if (!existing[0].categoria_ativa) {
      return res.status(400).json({
        error: "Não é possível reativar um item cuja categoria está inativa.",
      });
    }
    await pool.execute("UPDATE item SET ativo = TRUE WHERE id_item = ?", [Number(req.params.id)]);
    res.json({ id_item: Number(req.params.id), ativo: true });
  } catch (error) {
    handleDatabaseError(error, res);
  }
});

export default router;
