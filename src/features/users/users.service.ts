import { eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { users } from "../../db/schema.js";

export async function getUserProfile(userId: number) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: {
      id: true,
      name: true,
      email: true,
      plan: true,
      dailyGenerationCount: true,
      usageResetAt: true,
      createdAt: true,
    },
  });

  if (!user) {
    const err = new Error("User not found") as Error & { status?: number };
    err.status = 404;
    throw err;
  }

  return user;
}