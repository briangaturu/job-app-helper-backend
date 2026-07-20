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

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  plan: planEnum("plan").notNull().default("free"),
  dailyGenerationCount: integer("daily_generation_count").notNull().default(0),
  usageResetAt: date("usage_reset_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
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