import type { Request, Response } from "express";
import { parseIdParam } from "../../utils/parseIdParam.js";
import { createApplicationSchema, updateApplicationSchema } from "./applications.validator.js";
import {
  createApplication,
  listApplications,
  updateApplication,
  deleteApplication,
  getApplicationStats,
} from "./applications.service.js";

export async function create(req: Request, res: Response) {
  const input = createApplicationSchema.parse(req.body);
  const result = await createApplication(req.user!.userId, input);
  res.status(201).json(result);
}

export async function list(req: Request, res: Response) {
  const result = await listApplications(req.user!.userId);
  res.status(200).json(result);
}

export async function update(req: Request, res: Response) {
  const id = parseIdParam(req.params.id);
  const input = updateApplicationSchema.parse(req.body);
  const result = await updateApplication(req.user!.userId, id, input);
  res.status(200).json(result);
}

export async function remove(req: Request, res: Response) {
  const id = parseIdParam(req.params.id);
  await deleteApplication(req.user!.userId, id);
  res.status(204).send();
}

export async function stats(req: Request, res: Response) {
  const result = await getApplicationStats(req.user!.userId);
  res.status(200).json(result);
}