import { cookies } from "next/headers";
import { prisma } from "./db";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  verifySession,
} from "./auth";

export interface CurrentAdmin {
  id: string;
  email: string;
}

export async function getCurrentAdmin(): Promise<CurrentAdmin | null> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const payload = await verifySession(token);
  if (!payload) return null;

  const user = await prisma.adminUser.findUnique({
    where: { id: payload.sub },
    select: { id: true, email: true, tokenVersion: true },
  });
  if (!user || user.tokenVersion !== payload.tokenVersion) return null;

  return { id: user.id, email: user.email };
}

export function setSessionCookie(token: string) {
  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export function clearSessionCookie() {
  cookies().delete(SESSION_COOKIE);
}
