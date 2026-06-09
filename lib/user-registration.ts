/**
 * Shared local user creation — NextAuth credentials signup + Google OAuth.
 * Busts insights Redis cache and publishes realtime events for instant UI sync.
 */

import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { invalidateBusinessInsightsCache } from "./redis-cache";
import { publishAppEvent } from "./realtime/publish";

export type UserProvider = "credentials" | "google";

export interface CreateLocalUserInput {
  email: string;
  name?: string | null;
  password?: string | null;
  picture?: string | null;
  provider: UserProvider;
  userId?: string;
}

export interface CreatedLocalUser {
  id: string;
  email: string;
  name: string | null;
  createdAt: Date;
}

/** After user create — stats + cross-tab invalidation */
async function afterUserCreated(): Promise<void> {
  await invalidateBusinessInsightsCache();
  await publishAppEvent("user");
  await publishAppEvent("insights");
}

/**
 * Create a user in PostgreSQL (credentials or OAuth first sign-in).
 * @throws on duplicate email or DB errors
 */
export async function createLocalUser(
  input: CreateLocalUserInput,
): Promise<CreatedLocalUser> {
  const normalizedEmail = input.email.trim().toLowerCase();
  const id =
    input.userId ??
    (input.provider === "google"
      ? `google_${normalizedEmail.split("@")[0]}_${Date.now()}`
      : `user_${normalizedEmail.split("@")[0]}_${Date.now()}`);

  let hashedPassword: string | null = null;
  if (input.password) {
    hashedPassword = await bcrypt.hash(input.password, 10);
  }

  const user = await prisma.user.create({
    data: {
      id,
      email: normalizedEmail,
      name: input.name?.trim() || null,
      picture: input.picture || null,
      password: hashedPassword,
    },
    select: { id: true, email: true, name: true, createdAt: true },
  });

  await afterUserCreated();
  return user;
}
