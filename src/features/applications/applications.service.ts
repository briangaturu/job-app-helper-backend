import { eq, and, desc, sql } from "drizzle-orm";
import { db } from "../../db/index.js";
import { applications } from "../../db/schema.js";
import type { CreateApplicationInput, UpdateApplicationInput } from "./applications.validator.js";

export async function createApplication(userId: number, input: CreateApplicationInput) {
  const [saved] = await db
    .insert(applications)
    .values({ userId, ...input })
    .returning();
  return saved;
}

export async function listApplications(userId: number) {
  return db.query.applications.findMany({
    where: eq(applications.userId, userId),
    orderBy: desc(applications.updatedAt),
  });
}

async function getOwnedApplication(userId: number, applicationId: number) {
  const app = await db.query.applications.findFirst({
    where: and(eq(applications.id, applicationId), eq(applications.userId, userId)),
  });

  if (!app) {
    const err = new Error("Application not found") as Error & { status?: number };
    err.status = 404;
    throw err;
  }

  return app;
}

export async function updateApplication(
  userId: number,
  applicationId: number,
  input: UpdateApplicationInput
) {
  await getOwnedApplication(userId, applicationId);

  const [updated] = await db
    .update(applications)
    .set({ ...input, updatedAt: new Date() })
    .where(and(eq(applications.id, applicationId), eq(applications.userId, userId)))
    .returning();

  return updated;
}

export async function deleteApplication(userId: number, applicationId: number) {
  await getOwnedApplication(userId, applicationId);
  await db
    .delete(applications)
    .where(and(eq(applications.id, applicationId), eq(applications.userId, userId)));
}

// Powers the progress-tracking view: counts per status
export async function getApplicationStats(userId: number) {
  const rows = await db
    .select({
      status: applications.status,
      count: sql<number>`count(*)::int`,
    })
    .from(applications)
    .where(eq(applications.userId, userId))
    .groupBy(applications.status);

  const stats = {
    total: 0,
    saved: 0,
    applied: 0,
    interviewing: 0,
    offer: 0,
    rejected: 0,
  };

  for (const row of rows) {
    stats[row.status] = row.count;
    stats.total += row.count;
  }

  return stats;
}