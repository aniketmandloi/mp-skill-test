import { createAuth as createConfiguredAuth } from "@mp-skill-test/auth";
import { type Database, createDb } from "@mp-skill-test/db";

import { env } from "./env.server";

const db = createDb(env);

export function getDb(): Database {
  return db;
}
export const auth = createConfiguredAuth(env, db);
