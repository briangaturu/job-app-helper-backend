import { Router } from "express";
import multer from "multer";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { requireAuth } from "../../middleware/auth.js";
import { checkCV } from "./cv-checker.controller.js";

const router = Router();

// Configure multer for file upload (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (_req, file, cb) => {
    // Only accept PDF and TXT files
    if (
      file.mimetype === "application/pdf" ||
      file.mimetype === "text/plain"
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF and TXT files are allowed"));
    }
  },
});

router.post("/check", requireAuth, upload.single("cv"), asyncHandler(checkCV));

export default router;
