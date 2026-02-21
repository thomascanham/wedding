'use server';
import { db } from "@/database";
import { rooms, roomGuests, guests } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import crypto from "crypto";

async function enrichRoomsWithGuests(roomRows) {
  if (roomRows.length === 0) return [];

  const roomIds = roomRows.map((r) => r.id);
  const joinRows = await db.select().from(roomGuests).where(inArray(roomGuests.room_id, roomIds));

  const guestIdsByRoom = {};
  for (const row of joinRows) {
    if (!guestIdsByRoom[row.room_id]) guestIdsByRoom[row.room_id] = [];
    guestIdsByRoom[row.room_id].push(row.guest_id);
  }

  const allGuestIds = [...new Set(joinRows.map((r) => r.guest_id))];
  const guestRows = allGuestIds.length > 0
    ? await db.select().from(guests).where(inArray(guests.id, allGuestIds))
    : [];
  const guestMap = Object.fromEntries(guestRows.map((g) => [g.id, g]));

  return roomRows.map((room) => {
    const ids = guestIdsByRoom[room.id] || [];
    return {
      ...room,
      guest: ids,
      expand: {
        guest: ids.map((gid) => guestMap[gid]).filter(Boolean),
      },
    };
  });
}

export async function fetchAllRooms() {
  try {
    const records = await db.select().from(rooms).orderBy(rooms.name);
    const enriched = await enrichRoomsWithGuests(records);
    return {
      data: enriched,
      total: enriched.length,
      error: false,
    }
  } catch (error) {
    return {
      data: [],
      total: 0,
      error: { message: error.message },
    }
  }
}

export async function createRoom(name, description, block, capacity, guestIds = []) {
  try {
    const now = new Date().toISOString();
    const roomId = crypto.randomUUID();
    await db.insert(rooms).values({
      id: roomId,
      name,
      description,
      block,
      capacity,
      created: now,
      updated: now,
    });

    if (guestIds.length > 0) {
      await db.insert(roomGuests).values(
        guestIds.map((gid) => ({ room_id: roomId, guest_id: gid }))
      );
    }

    const [record] = await db.select().from(rooms).where(eq(rooms.id, roomId));
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

const ROOM_COLUMNS = new Set(['name', 'description', 'block', 'capacity']);

export async function updateRoom(id, data) {
  try {
    const filtered = {};
    for (const key of Object.keys(data)) {
      if (ROOM_COLUMNS.has(key)) filtered[key] = data[key];
    }
    filtered.updated = new Date().toISOString();

    await db.update(rooms).set(filtered).where(eq(rooms.id, id));
    const [record] = await db.select().from(rooms).where(eq(rooms.id, id));
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

export async function addGuestToRoom(roomId, guestIds) {
  try {
    await db.delete(roomGuests).where(eq(roomGuests.room_id, roomId));

    if (guestIds.length > 0) {
      await db.insert(roomGuests).values(
        guestIds.map((gid) => ({ room_id: roomId, guest_id: gid }))
      );
    }

    await db.update(rooms)
      .set({ updated: new Date().toISOString() })
      .where(eq(rooms.id, roomId));

    const [record] = await db.select().from(rooms).where(eq(rooms.id, roomId));
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

export async function deleteRoom(id) {
  try {
    await db.delete(rooms).where(eq(rooms.id, id));
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
