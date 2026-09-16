import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { requireAuth } from "../../middleware/auth.js";
import { getMe, updateMe } from "./users.controller.js";

const router = Router();

router.get("/me", requireAuth, asyncHandler(getMe));
router.put("/me", requireAuth, asyncHandler(updateMe));

export default router;