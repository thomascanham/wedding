import PocketBase from "pocketbase";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

// --- PocketBase (auth only) ---
let superUserClient = null;

export async function getPocketbase() {
  if (!superUserClient) {
    superUserClient = new PocketBase(process.env.DATABASE_URL);
    superUserClient.autoCancellation(false);

    if (process.env.PB_SUPERUSER_TOKEN) {
      superUserClient.authStore.save(process.env.PB_SUPERUSER_TOKEN, null);
    } else {
      await superUserClient
        .collection("_superusers")
        .authWithPassword(
          process.env.DATABASE_USERNAME,
          process.env.DATABASE_SECRET
        );
    }
  }
  return superUserClient;
}

// --- SQLite + Drizzle ---
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, "db", "wedding.db");

const sqlite = new Database(dbPath);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

export const db = drizzle(sqlite);
