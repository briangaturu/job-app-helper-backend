import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { requireAuth } from "../../middleware/auth.js";
import { getMe } from "./users.controller.js";

const router = Router();

router.get("/me", requireAuth, asyncHandler(getMe));

export default router;