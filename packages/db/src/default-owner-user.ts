import { xprisma } from "./xprisma.js";

/** Stable email for the single self-hosted owner row (UI + CLI + FK targets). */
export const DEFAULT_OWNER_EMAIL = "onboarding@innisfailures.pro";

export async function getOrCreateDefaultOwnerUser() {
  const existing = await xprisma.user.findUnique({
    where: { email: DEFAULT_OWNER_EMAIL },
  });
  if (existing) {
    return existing;
  }

  return xprisma.user.create({
    data: {
      email: DEFAULT_OWNER_EMAIL,
      displayName: "innisfailures",
      role: "Admin",
    },
  });
}
