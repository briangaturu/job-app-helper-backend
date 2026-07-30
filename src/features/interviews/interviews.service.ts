import { eq, and, desc } from "drizzle-orm";
import { db } from "../../db/index";
import { interviewQuestions, applications } from "../../db/schema";
import { generateInterviewQuestions, scoreInterviewAnswer } from "./interview.ai";
import type { GenerateQuestionsInput, SubmitAnswerInput } from "./interviews.validator";

export async function createQuestionSet(userId: number, input: GenerateQuestionsInput) {
  const application = await db.query.applications.findFirst({
    where: and(eq(applications.id, input.applicationId), eq(applications.userId, userId)),
  });

  if (!application) {
    const err = new Error("Application not found") as Error & { status?: number };
    err.status = 404;
    throw err;
  }

  if (!application.jobText) {
    const err = new Error(
      "This application has no job description saved to generate questions from"
    ) as Error & { status?: number };
    err.status = 400;
    throw err;
  }

  const questions = await generateInterviewQuestions(application.jobText, input.count ?? 6);

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

  const feedback = await scoreInterviewAnswer(existing.question, input.userAnswer);

  const [updated] = await db
    .update(interviewQuestions)
    .set({ userAnswer: input.userAnswer, feedback })
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