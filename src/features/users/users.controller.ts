import type { Request, Response } from "express";
import { getUserProfile, updateUserProfile } from "./users.service.js";

export async function getMe(req: Request, res: Response) {
  const profile = await getUserProfile(req.user!.userId);
  res.status(200).json(profile);
}

export async function updateMe(req: Request, res: Response) {
  const input = req.body;
  const updated = await updateUserProfile(req.user!.userId, input);
  res.status(200).json(updated);
}