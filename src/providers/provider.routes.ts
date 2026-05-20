import { Router } from "express";
import { getRankedProviders } from "./provider.controller.js";

const router = Router();

router.post("/list", getRankedProviders);

export default router;
