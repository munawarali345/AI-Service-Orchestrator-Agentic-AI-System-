import { Router } from "express";
import { getBaselineComparison } from "./comparison.controller.js";

const router = Router();

router.post("/", getBaselineComparison);

export default router;
