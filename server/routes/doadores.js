import { Router } from "express";
import pool from "../db.js";
import { handleDatabaseError } from "../route-utils.js";
import { normalizeCpf, positiveInteger, validateDonorInput } from "../validation.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id_doador, nome, cpf, email, telefone, ativo, data_cadastro FROM doador ORDER BY id_doador DESC",
    );
    res.json(rows);
  } catch (error) {
    handleDatabaseError(error, res);
  }
});

router.get("/:id", async (req, res) => {
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

router.post("/", async (req, res) => {
  const { nome, cpf, email, telefone, ativo } = req.body ?? {};

  const validationError = validateDonorInput({ nome, cpf, email, telefone, ativo });
  if (validationError) return res.status(400).json({ error: validationError });

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

router.put("/:id", async (req, res) => {
  if (!positiveInteger(req.params.id))
    return res.status(400).json({ error: "Identificador inválido." });
  const { nome, cpf, email, telefone, ativo } = req.body ?? {};

  const validationError = validateDonorInput({ nome, cpf, email, telefone, ativo }, true);
  if (validationError) return res.status(400).json({ error: validationError });

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

router.delete("/:id", async (req, res) => {
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

router.patch("/:id/ativar", async (req, res) => {
  if (!positiveInteger(req.params.id))
    return res.status(400).json({ error: "Identificador inválido." });

  try {
    const [existing] = await pool.execute("SELECT id_doador FROM doador WHERE id_doador = ?", [
      Number(req.params.id),
    ]);
    if (existing.length === 0) return res.status(404).json({ error: "Doador não encontrado." });

    await pool.execute("UPDATE doador SET ativo = TRUE WHERE id_doador = ?", [
      Number(req.params.id),
    ]);
    res.json({ id_doador: Number(req.params.id), ativo: true });
  } catch (error) {
    handleDatabaseError(error, res);
  }
});

export default router;
