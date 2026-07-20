import type { Request, Response } from "express";
import { getUserProfile } from "./users.service.js";

export async function getMe(req: Request, res: Response) {
  const profile = await getUserProfile(req.user!.userId);
  res.status(200).json(profile);
}