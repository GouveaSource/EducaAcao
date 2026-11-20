import { Router } from "express";
import pool from "../db.js";
import { handleDatabaseError } from "../route-utils.js";
import { validateDonationInput } from "../validation.js";

const router = Router();

router.get("/", async (req, res) => {
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

router.post("/", async (req, res) => {
  const { id_doador, data_doacao, descricao, itens } = req.body ?? {};
  const validationError = validateDonationInput({ id_doador, data_doacao, descricao, itens });
  if (validationError) return res.status(400).json({ error: validationError });

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

export default router;
