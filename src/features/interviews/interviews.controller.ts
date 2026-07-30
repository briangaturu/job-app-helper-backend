import type { Request, Response } from "express";
import { parseIdParam } from "../../utils/parseIdParam";
import { generateQuestionsSchema, submitAnswerSchema } from "./interviews.validator";
import { createQuestionSet, submitAnswer, listQuestionsForApplication } from "./interviews.service";

export async function generate(req: Request, res: Response) {
  const input = generateQuestionsSchema.parse(req.body);
  const result = await createQuestionSet(req.user!.userId, input);
  res.status(201).json(result);
}

export async function answer(req: Request, res: Response) {
  const input = submitAnswerSchema.parse(req.body);
  const result = await submitAnswer(req.user!.userId, input);
  res.status(200).json(result);
}

export async function listForApplication(req: Request, res: Response) {
  const applicationId = parseIdParam(req.params.applicationId, "applicationId");
  const result = await listQuestionsForApplication(req.user!.userId, applicationId);
  res.status(200).json(result);
}