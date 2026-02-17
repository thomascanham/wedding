'use server';
import { db } from "@/database";
import { invites, inviteGuests, guests } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import QRCode from 'qrcode';
import crypto from "crypto";

const QR_OPTIONS = {
  type: 'svg',
  color: {
    dark: '#721F14',
    light: '#E9DDCD',
  },
  margin: 2,
  width: 256,
};

function enrichInvitesWithGuests(inviteRows) {
  if (inviteRows.length === 0) return [];

  const inviteIds = inviteRows.map((i) => i.id);
  const joinRows = db.select().from(inviteGuests).where(inArray(inviteGuests.invite_id, inviteIds)).all();

  const guestIdsByInvite = {};
  for (const row of joinRows) {
    if (!guestIdsByInvite[row.invite_id]) guestIdsByInvite[row.invite_id] = [];
    guestIdsByInvite[row.invite_id].push(row.guest_id);
  }

  const allGuestIds = [...new Set(joinRows.map((r) => r.guest_id))];
  const guestRows = allGuestIds.length > 0
    ? db.select().from(guests).where(inArray(guests.id, allGuestIds)).all()
    : [];
  const guestMap = Object.fromEntries(guestRows.map((g) => [g.id, g]));

  return inviteRows.map((invite) => {
    const ids = guestIdsByInvite[invite.id] || [];
    return {
      ...invite,
      guest: ids,
      expand: {
        guest: ids.map((gid) => guestMap[gid]).filter(Boolean),
      },
    };
  });
}

export async function fetchAllInvites() {
  try {
    const records = db.select().from(invites).orderBy(invites.name).all();
    const enriched = enrichInvitesWithGuests(records);
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

export async function createInvite(name, guestIds = [], attendance = 'ceremony') {
  try {
    const now = new Date().toISOString();
    const inviteId = crypto.randomUUID();
    const record = db.insert(invites).values({
      id: inviteId,
      name,
      attendance,
      sent: false,
      created: now,
      updated: now,
    }).returning().get();

    if (guestIds.length > 0) {
      db.insert(inviteGuests).values(
        guestIds.map((gid) => ({ invite_id: inviteId, guest_id: gid }))
      ).run();
    }

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

const INVITE_COLUMNS = new Set(['name', 'attendance', 'sent', 'qr_svg']);

export async function updateInvite(id, data) {
  try {
    const filtered = {};
    for (const key of Object.keys(data)) {
      if (INVITE_COLUMNS.has(key)) filtered[key] = data[key];
    }
    filtered.updated = new Date().toISOString();

    const record = db.update(invites)
      .set(filtered)
      .where(eq(invites.id, id))
      .returning()
      .get();
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

export async function deleteInvite(id) {
  try {
    db.delete(invites).where(eq(invites.id, id)).run();
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

export async function addGuestToInvite(inviteId, guestIds) {
  try {
    db.delete(inviteGuests).where(eq(inviteGuests.invite_id, inviteId)).run();

    if (guestIds.length > 0) {
      db.insert(inviteGuests).values(
        guestIds.map((gid) => ({ invite_id: inviteId, guest_id: gid }))
      ).run();
    }

    db.update(invites)
      .set({ updated: new Date().toISOString() })
      .where(eq(invites.id, inviteId))
      .run();

    const record = db.select().from(invites).where(eq(invites.id, inviteId)).get();
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

export async function deleteQRCode(inviteId) {
  try {
    const record = db.update(invites)
      .set({ qr_svg: null, updated: new Date().toISOString() })
      .where(eq(invites.id, inviteId))
      .returning()
      .get();
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

export async function generateQRCode(inviteId, baseUrl) {
  try {
    const inviteUrl = `${baseUrl}/invite/${inviteId}`;
    const svgString = await QRCode.toString(inviteUrl, QR_OPTIONS);

    const record = db.update(invites)
      .set({ qr_svg: svgString, updated: new Date().toISOString() })
      .where(eq(invites.id, inviteId))
      .returning()
      .get();

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

export async function generateAllQRCodes(baseUrl) {
  try {
    const allInvites = db.select().from(invites).all();
    const results = [];

    for (const invite of allInvites) {
      const inviteUrl = `${baseUrl}/invite/${invite.id}`;
      const svgString = await QRCode.toString(inviteUrl, QR_OPTIONS);

      db.update(invites)
        .set({ qr_svg: svgString, updated: new Date().toISOString() })
        .where(eq(invites.id, invite.id))
        .run();

      results.push({ id: invite.id, name: invite.name });
    }

    return {
      data: results,
      total: results.length,
      error: false,
    }
  } catch (error) {
    return {
      data: null,
      error: { message: error.message },
    }
  }
}
