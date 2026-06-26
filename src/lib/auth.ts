import { cookies } from "next/headers";
import { createHash, randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { query } from "@/lib/db";
import type { UserSession } from "@/lib/types";

const COOKIE_NAME = "artisan_session";
const SESSION_DAYS = 30;

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_DAYS);

  await query("INSERT INTO sessions (utilisateur_id, token_hash, expires_at) VALUES ($1,$2,$3)", [userId, tokenHash, expiresAt]);

  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt
  });
}

export async function clearSession() {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (token) {
    await query("DELETE FROM sessions WHERE token_hash = $1", [hashToken(token)]).catch(() => undefined);
  }
  store.delete(COOKIE_NAME);
}

export async function getCurrentUser(): Promise<UserSession | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const result = await query<UserSession>(
    `SELECT u.id, u.nom, u.email, u.role, u.entreprise_id, e.nom_commercial AS entreprise_nom
     FROM sessions s
     JOIN utilisateurs u ON u.id = s.utilisateur_id
     JOIN entreprises e ON e.id = u.entreprise_id
     WHERE s.token_hash = $1 AND s.expires_at > now()
     LIMIT 1`,
    [hashToken(token)]
  );

  return result.rows[0] ?? null;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Connexion requise.");
  }
  return user;
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}
