import type { Request, Response } from "express";
import { createGenerationSchema } from "./generations.validator.js";
import { createGeneration, listGenerationsForUser } from "./generations.service.js";

export async function create(req: Request, res: Response) {
  const input = createGenerationSchema.parse(req.body);
  const result = await createGeneration(req.user!.userId, input);
  res.status(201).json(result);
}

export async function list(req: Request, res: Response) {
  const result = await listGenerationsForUser(req.user!.userId);
  res.status(200).json(result);
}