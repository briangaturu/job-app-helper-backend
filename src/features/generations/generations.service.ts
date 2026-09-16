import { eq, desc } from "drizzle-orm";
import { db } from "../../db/index.js";
import { users, generations } from "../../db/schema.js";
import { generateApplicationAssets } from "./ai.service.js";
import type { CreateGenerationInput } from "./generations.validator.js";

const FREE_DAILY_LIMIT = 100; // Increased for testing - change back to 2 for production

function isNewDay(usageResetAt: string) {
  const resetDate = new Date(usageResetAt).toDateString();
  const today = new Date().toDateString();
  return resetDate !== today;
}

async function checkAndConsumeUsage(userId: number) {
  const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
  if (!user) {
    const err = new Error("User not found") as Error & { status?: number };
    err.status = 404;
    throw err;
  }

  if (user.plan === "pro") return; // unlimited

  const resetNeeded = isNewDay(String(user.usageResetAt));
  const currentCount = resetNeeded ? 0 : user.dailyGenerationCount;

  if (currentCount >= FREE_DAILY_LIMIT) {
    const err = new Error(
      `Free plan limit reached (${FREE_DAILY_LIMIT}/day). Upgrade to Pro for unlimited generations.`
    ) as Error & { status?: number };
    err.status = 429;
    throw err;
  }

  await db
    .update(users)
    .set({
      dailyGenerationCount: currentCount + 1,
      usageResetAt: new Date().toISOString().slice(0, 10),
    })
    .where(eq(users.id, userId));
  return user;
}

export async function createGeneration(userId: number, input: CreateGenerationInput) {
  const user = await checkAndConsumeUsage(userId);

  const output = await generateApplicationAssets(input.jobText, (user as any).profile);

  const [saved] = await db
    .insert(generations)
    .values({
      userId,
      jobTitle: input.jobTitle,
      jobText: input.jobText,
      outputJson: output,
      matchScore: output.matchScore,
    })
    .returning();

  return saved;
}

export async function listGenerationsForUser(userId: number) {
  return db.query.generations.findMany({
    where: eq(generations.userId, userId),
    orderBy: desc(generations.createdAt),
    limit: 50,
  });
}