'use server';
import { db } from "@/database";
import { guests } from "@/db/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";

export async function fetchAllGuests() {
  try {
    const records = await db.select().from(guests).orderBy(guests.surname);
    return {
      data: records,
      total: records.length,
      error: false,
    }
  } catch (error) {
    return {
      data: error.message,
      total: 0,
      error: true,
    }
  }
}

export async function createGuest(firstname, surname, attendanceType) {
  try {
    const now = new Date().toISOString();
    const id = crypto.randomUUID();
    await db.insert(guests).values({
      id,
      firstname,
      surname,
      name: `${firstname} ${surname}`,
      attendanceType,
      rsvpStatus: null,
      hasCheckedIn: false,
      phone: null,
      email: null,
      starter: null,
      main: null,
      dessert: null,
      dietry: null,
      allergies: null,
      created: now,
      updated: now,
    });
    const [record] = await db.select().from(guests).where(eq(guests.id, id));
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

export async function toggleGuestHoop(id, currentValue) {
  try {
    await db.update(guests)
      .set({ hoop: !currentValue, updated: new Date().toISOString() })
      .where(eq(guests.id, id));
    const [record] = await db.select().from(guests).where(eq(guests.id, id));
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

export async function deleteGuest(id) {
  try {
    await db.delete(guests).where(eq(guests.id, id));
    return {
      success: true,
      error: false,
    }
  } catch (error) {
    return {
      success: false,
      error: { message: error.message },
    }
  }
}
