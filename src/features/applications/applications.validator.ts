import { z } from "zod";

export const createApplicationSchema = z.object({
  generationId: z.number().int().positive().optional(),
  company: z.string().max(200).optional(),
  jobTitle: z.string().min(1).max(200),
  jobText: z.string().max(8000).optional(),
  status: z.enum(["saved", "applied", "interviewing", "offer", "rejected"]).optional(),
  notes: z.string().max(4000).optional(),
});

export const updateApplicationSchema = z.object({
  company: z.string().max(200).optional(),
  jobTitle: z.string().min(1).max(200).optional(),
  status: z.enum(["saved", "applied", "interviewing", "offer", "rejected"]).optional(),
  notes: z.string().max(4000).optional(),
});

export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;
export type UpdateApplicationInput = z.infer<typeof updateApplicationSchema>;