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
      profile: true,
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

export async function updateUserProfile(userId: number, profile: any) {
  const [updated] = await db
    .update(users)
    .set({ profile })
    .where(eq(users.id, userId))
    .returning({ id: users.id, name: users.name, email: users.email, profile: users.profile, plan: users.plan });

  if (!updated) {
    const err = new Error("User not found") as Error & { status?: number };
    err.status = 404;
    throw err;
  }

  return updated;
}