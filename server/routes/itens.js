import { Router } from "express";
import pool from "../db.js";
import { handleDatabaseError } from "../route-utils.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT i.id_item, i.nome AS nome_item, c.id_categoria, c.nome AS categoria FROM item i JOIN categoria c ON c.id_categoria = i.id_categoria ORDER BY c.nome, i.nome",
    );
    res.json(rows);
  } catch (error) {
    handleDatabaseError(error, res);
  }
});

export default router;
