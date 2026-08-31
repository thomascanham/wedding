'use server';
import { db } from "@/database";
import { seatingTables } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function fetchSeatingTables() {
  try {
    const records = await db.select().from(seatingTables);
    return {
      data: records,
      error: false,
    }
  } catch (error) {
    return {
      data: [],
      error: { message: error.message },
    }
  }
}

export async function updateSeatingTableName(tableIndex, name) {
  try {
    const trimmed = name ? name.trim() : '';
    const now = new Date().toISOString();

    const [existing] = await db.select().from(seatingTables).where(eq(seatingTables.tableIndex, tableIndex));
    if (existing) {
      await db.update(seatingTables)
        .set({ name: trimmed || null, updated: now })
        .where(eq(seatingTables.tableIndex, tableIndex));
    } else {
      await db.insert(seatingTables).values({
        tableIndex,
        name: trimmed || null,
        created: now,
        updated: now,
      });
    }

    const [record] = await db.select().from(seatingTables).where(eq(seatingTables.tableIndex, tableIndex));
    return {
      data: record,
      error: false,
    }
  } catch (error) {
    return {
      data: null,
      error: { message: error.message },
    }
  }
}
