import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { register, login } from "./auth.controller.js";

const router = Router();

router.post("/register", asyncHandler(register));
router.post("/login", asyncHandler(login));

export default router;