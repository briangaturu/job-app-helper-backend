import {
  pgTable,
  serial,
  text,
  varchar,
  timestamp,
  integer,
  jsonb,
  date,
  pgEnum,
} from "drizzle-orm/pg-core";

export const planEnum = pgEnum("plan", ["free", "pro"]);
export const applicationStatusEnum = pgEnum("application_status", [
  "saved",
  "applied",
  "interviewing",
  "offer",
  "rejected",
]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  plan: planEnum("plan").notNull().default("free"),
  // usage_limits folded onto users for MVP — one row, no join
  dailyGenerationCount: integer("daily_generation_count").notNull().default(0),
  usageResetAt: date("usage_reset_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  // flexible JSON blob for storing profile details and certifications
  profile: jsonb("profile"),
});

export const generations = pgTable("generations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  jobTitle: varchar("job_title", { length: 200 }),
  jobText: text("job_text").notNull(),
  outputJson: jsonb("output_json").notNull(),
  matchScore: integer("match_score"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  generationId: integer("generation_id").references(() => generations.id, {
    onDelete: "set null",
  }),
  company: varchar("company", { length: 200 }),
  jobTitle: varchar("job_title", { length: 200 }).notNull(),
  jobText: text("job_text"),
  status: applicationStatusEnum("status").notNull().default("saved"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const interviewQuestions = pgTable("interview_questions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  applicationId: integer("application_id").references(() => applications.id, {
    onDelete: "cascade",
  }),
  question: text("question").notNull(),
  userAnswer: text("user_answer"),
  feedback: text("feedback"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// payments table stubbed for later — not wired up in MVP
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  provider: varchar("provider", { length: 40 }).notNull(),
  status: varchar("status", { length: 40 }).notNull(),
  amount: integer("amount").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const cvChecks = pgTable("cv_checks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  cvText: text("cv_text").notNull(),
  analysis: jsonb("analysis").notNull(),
  improvedCv: text("improved_cv"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});