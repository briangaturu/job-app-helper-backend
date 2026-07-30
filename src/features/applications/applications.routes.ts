import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { requireAuth } from "../../middleware/auth.js";
import { create, list, update, remove, stats } from "./applications.controller.js";

const router = Router();

router.use(requireAuth);

router.post("/", asyncHandler(create));
router.get("/", asyncHandler(list));
router.get("/stats", asyncHandler(stats));
router.patch("/:id", asyncHandler(update));
router.delete("/:id", asyncHandler(remove));

export default router;