import { Router } from "express";
import pool from "../db.js";

const router = Router();

router.get("/", async (req, res) => {
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

export default router;
