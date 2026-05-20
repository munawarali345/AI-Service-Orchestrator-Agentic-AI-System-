import { Router } from "express";
import { getBookingDetails } from "./booking.controller.js";

const router = Router();

router.get("/:id", getBookingDetails);

export default router;
