import { Router } from "express";
import { getProviderDetails } from "./providerDetail.controller.js";

const router = Router();

router.get("/:id", getProviderDetails);

export default router;
