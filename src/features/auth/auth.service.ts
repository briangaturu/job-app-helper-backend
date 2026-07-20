import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { users } from "../../db/schema.js";
import type { RegisterInput, LoginInput } from "./auth.validator.js";

const SALT_ROUNDS = 10;
const TOKEN_EXPIRY = "7d";

function signToken(userId: number, email: string) {
  return jwt.sign({ userId, email }, process.env.JWT_SECRET as string, {
    expiresIn: TOKEN_EXPIRY,
  });
}

export async function registerUser(input: RegisterInput) {
  const existing = await db.query.users.findFirst({
    where: eq(users.email, input.email),
  });

  if (existing) {
    const err = new Error("An account with this email already exists") as Error & {
      status?: number;
    };
    err.status = 409;
    throw err;
  }

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

  const [user] = await db
    .insert(users)
    .values({ name: input.name, email: input.email, passwordHash })
    .returning({ id: users.id, name: users.name, email: users.email, plan: users.plan });

  const token = signToken(user.id, user.email);
  return { user, token };
}

export async function loginUser(input: LoginInput) {
  const user = await db.query.users.findFirst({
    where: eq(users.email, input.email),
  });

  const invalidCredsErr = new Error("Invalid email or password") as Error & { status?: number };
  invalidCredsErr.status = 401;

  if (!user) throw invalidCredsErr;

  const passwordMatches = await bcrypt.compare(input.password, user.passwordHash);
  if (!passwordMatches) throw invalidCredsErr;

  const token = signToken(user.id, user.email);
  return {
    user: { id: user.id, name: user.name, email: user.email, plan: user.plan },
    token,
  };
}