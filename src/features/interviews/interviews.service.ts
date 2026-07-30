import { eq, and, desc } from "drizzle-orm";
import { db } from "../../db/index";
import { interviewQuestions } from "../../db/schema";
import { generateInterviewQuestions, scoreInterviewAnswer } from "./interview.ai";
import type { GenerateQuestionsInput, SubmitAnswerInput } from "./interviews.validator";

export async function createQuestionSet(userId: number, input: GenerateQuestionsInput) {
  const questions = await generateInterviewQuestions(input.jobText);

  const rows = await db
    .insert(interviewQuestions)
    .values(
      questions.map((question) => ({
        userId,
        applicationId: input.applicationId,
        question,
      }))
    )
    .returning();

  return rows;
}

export async function submitAnswer(userId: number, input: SubmitAnswerInput) {
  const existing = await db.query.interviewQuestions.findFirst({
    where: and(
      eq(interviewQuestions.id, input.questionId),
      eq(interviewQuestions.userId, userId)
    ),
  });

  if (!existing) {
    const err = new Error("Question not found") as Error & { status?: number };
    err.status = 404;
    throw err;
  }

  const feedback = await scoreInterviewAnswer(existing.question, input.answer);

  const [updated] = await db
    .update(interviewQuestions)
    .set({ userAnswer: input.answer, feedback })
    .where(eq(interviewQuestions.id, input.questionId))
    .returning();

  return updated;
}

export async function listQuestionsForApplication(userId: number, applicationId: number) {
  return db.query.interviewQuestions.findMany({
    where: and(
      eq(interviewQuestions.userId, userId),
      eq(interviewQuestions.applicationId, applicationId)
    ),
    orderBy: desc(interviewQuestions.createdAt),
  });
}