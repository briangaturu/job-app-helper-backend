import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

interface HttpError extends Error {
  status?: number;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: HttpError, req: Request, res: Response, next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json({ error: "Validation failed", issues: err.issues });
  }

  const status = err.status ?? 500;
  if (status >= 500) {
    console.error(err);
  }

  res.status(status).json({ error: err.message || "Internal server error" });
}