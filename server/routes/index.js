import { Router } from "express";
import doadoresRoutes from "./doadores.js";
import doacoesRoutes from "./doacoes.js";
import healthRoutes from "./health.js";
import itensRoutes from "./itens.js";
import categoriasRoutes from "./categorias.js";

const router = Router();

router.use("/health", healthRoutes);
router.use("/doadores", doadoresRoutes);
router.use("/itens", itensRoutes);
router.use("/categorias", categoriasRoutes);
router.use("/doacoes", doacoesRoutes);

export default router;
