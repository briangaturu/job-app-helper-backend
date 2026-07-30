import { z } from "zod";

export const generateQuestionsSchema = z.object({
  applicationId: z.number().int().positive(),
  count: z.number().int().min(1).max(10).optional(),
});

export const submitAnswerSchema = z.object({
  questionId: z.number().int().positive(),
  userAnswer: z.string().min(1).max(4000),
});

export type GenerateQuestionsInput = z.infer<typeof generateQuestionsSchema>;
export type SubmitAnswerInput = z.infer<typeof submitAnswerSchema>;