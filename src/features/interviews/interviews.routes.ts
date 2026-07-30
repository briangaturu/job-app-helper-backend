import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { requireAuth } from "../../middleware/auth";
import { generate, answer, listForApplication } from "./interviews.controller";

const router = Router();

router.use(requireAuth);

router.post("/questions", asyncHandler(generate));
router.post("/answers", asyncHandler(answer));
router.get("/applications/:applicationId/questions", asyncHandler(listForApplication));

export default router;