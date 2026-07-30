import { z } from "zod";

export const generateQuestionsSchema = z.object({
  jobText: z.string().min(50).max(8000),
  applicationId: z.number().int().positive().optional(),
});

export const submitAnswerSchema = z.object({
  questionId: z.number().int().positive(),
  answer: z.string().min(1).max(4000),
});

export type GenerateQuestionsInput = z.infer<typeof generateQuestionsSchema>;
export type SubmitAnswerInput = z.infer<typeof submitAnswerSchema>;