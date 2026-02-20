import PocketBase from "pocketbase";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

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

// --- MySQL + Drizzle ---
const pool = mysql.createPool(process.env.DB_MYSQL);

export const db = drizzle(pool);
