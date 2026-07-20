import { z } from "zod";

export const createGenerationSchema = z.object({
  jobTitle: z.string().max(200).optional(),
  jobText: z.string().min(50, "Paste the full job description (at least 50 characters)").max(8000),
});

export type CreateGenerationInput = z.infer<typeof createGenerationSchema>;