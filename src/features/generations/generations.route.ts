import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { requireAuth } from "../../middleware/auth.js";
import { create, list } from "./generations.controller.js";

const router = Router();

router.post("/", requireAuth, asyncHandler(create));
router.get("/", requireAuth, asyncHandler(list));

export default router;