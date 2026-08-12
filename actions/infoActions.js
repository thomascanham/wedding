'use server';
import { db } from "@/database";
import { weddingInfo, djSetlists, bridalParty, groomsmen, aisleWalkOrder, speechOrder, canapes, daytimeChecklist, suppliers } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import crypto from "crypto";

const SINGLETON_ID = 'singleton';

export async function fetchWeddingInfo() {
  try {
    const [record] = await db.select().from(weddingInfo).where(eq(weddingInfo.id, SINGLETON_ID));
    return {
      data: record || null,
      error: false,
    }
  } catch (error) {
    return {
      data: null,
      error: { message: error.message },
    }
  }
}

const INFO_COLUMNS = new Set(['masterOfCeremonies', 'ceremonyMusicGuest', 'aisleWalkSong', 'signingSong', 'exitSong', 'firstDanceSong', 'djName', 'djArrivalTime', 'djStartTime', 'boothMeasurements', 'djContractProvided', 'welcomeDrinksCount', 'nonAlcoholicWelcomeDrinksCount', 'toastingDrinksCount', 'nonAlcoholicToastingDrinksCount', 'cakeCut', 'cakeBigFlavour', 'cakeMediumFlavour', 'cakeSmallFlavour', 'cakeAmountSaved', 'sweetCart', 'baristas']);

export async function updateWeddingInfo(data) {
  try {
    const filtered = {};
    for (const key of Object.keys(data)) {
      if (INFO_COLUMNS.has(key)) filtered[key] = data[key];
    }
    const now = new Date().toISOString();

    await db.insert(weddingInfo)
      .values({ id: SINGLETON_ID, ...filtered, created: now, updated: now })
      .onDuplicateKeyUpdate({ set: { ...filtered, updated: now } });

    const [record] = await db.select().from(weddingInfo).where(eq(weddingInfo.id, SINGLETON_ID));
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

export async function fetchDjSetlists() {
  try {
    const records = await db.select().from(djSetlists).orderBy(asc(djSetlists.name));
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

export async function createDjSetlist(name) {
  try {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    await db.insert(djSetlists).values({ id, name, submitted: false, created: now, updated: now });
    const [record] = await db.select().from(djSetlists).where(eq(djSetlists.id, id));
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

export async function toggleDjSetlistSubmitted(id, currentValue) {
  try {
    await db.update(djSetlists)
      .set({ submitted: !currentValue, updated: new Date().toISOString() })
      .where(eq(djSetlists.id, id));
    const [record] = await db.select().from(djSetlists).where(eq(djSetlists.id, id));
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

export async function deleteDjSetlist(id) {
  try {
    await db.delete(djSetlists).where(eq(djSetlists.id, id));
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

export async function fetchBridalParty() {
  try {
    const records = await db.select().from(bridalParty).orderBy(asc(bridalParty.created));
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

export async function createBridalPartyEntry(name, role, breakfastChoice) {
  try {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    await db.insert(bridalParty).values({ id, name, role, breakfastChoice, created: now, updated: now });
    const [record] = await db.select().from(bridalParty).where(eq(bridalParty.id, id));
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

export async function updateBridalPartyEntry(id, name, role, breakfastChoice) {
  try {
    await db.update(bridalParty)
      .set({ name, role, breakfastChoice, updated: new Date().toISOString() })
      .where(eq(bridalParty.id, id));
    const [record] = await db.select().from(bridalParty).where(eq(bridalParty.id, id));
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

export async function deleteBridalPartyEntry(id) {
  try {
    await db.delete(bridalParty).where(eq(bridalParty.id, id));
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

export async function fetchGroomsmen() {
  try {
    const records = await db.select().from(groomsmen).orderBy(asc(groomsmen.created));
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

export async function createGroomsmanEntry(name, role, breakfastChoice) {
  try {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    await db.insert(groomsmen).values({ id, name, role, breakfastChoice, created: now, updated: now });
    const [record] = await db.select().from(groomsmen).where(eq(groomsmen.id, id));
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

export async function updateGroomsmanEntry(id, name, role, breakfastChoice) {
  try {
    await db.update(groomsmen)
      .set({ name, role, breakfastChoice, updated: new Date().toISOString() })
      .where(eq(groomsmen.id, id));
    const [record] = await db.select().from(groomsmen).where(eq(groomsmen.id, id));
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

export async function deleteGroomsmanEntry(id) {
  try {
    await db.delete(groomsmen).where(eq(groomsmen.id, id));
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

export async function fetchAisleWalkOrder() {
  try {
    const records = await db.select().from(aisleWalkOrder).orderBy(asc(aisleWalkOrder.position));
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

export async function createAisleWalkOrderEntry(name) {
  try {
    const existing = await db.select().from(aisleWalkOrder);
    const nextPosition = existing.length;
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    await db.insert(aisleWalkOrder).values({ id, name, position: nextPosition, created: now, updated: now });
    const [record] = await db.select().from(aisleWalkOrder).where(eq(aisleWalkOrder.id, id));
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

export async function updateAisleWalkOrderEntry(id, name) {
  try {
    await db.update(aisleWalkOrder)
      .set({ name, updated: new Date().toISOString() })
      .where(eq(aisleWalkOrder.id, id));
    const [record] = await db.select().from(aisleWalkOrder).where(eq(aisleWalkOrder.id, id));
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

export async function moveAisleWalkOrderEntry(id, direction) {
  try {
    const records = await db.select().from(aisleWalkOrder).orderBy(asc(aisleWalkOrder.position));
    const index = records.findIndex((r) => r.id === id);
    const swapIndex = direction === 'up' ? index - 1 : index + 1;

    if (index === -1 || swapIndex < 0 || swapIndex >= records.length) {
      return { data: records, error: false };
    }

    const current = records[index];
    const swapWith = records[swapIndex];
    const now = new Date().toISOString();

    await db.update(aisleWalkOrder).set({ position: swapWith.position, updated: now }).where(eq(aisleWalkOrder.id, current.id));
    await db.update(aisleWalkOrder).set({ position: current.position, updated: now }).where(eq(aisleWalkOrder.id, swapWith.id));

    const updated = await db.select().from(aisleWalkOrder).orderBy(asc(aisleWalkOrder.position));
    return {
      data: updated,
      error: false,
    }
  } catch (error) {
    return {
      data: null,
      error: { message: error.message },
    }
  }
}

export async function deleteAisleWalkOrderEntry(id) {
  try {
    await db.delete(aisleWalkOrder).where(eq(aisleWalkOrder.id, id));
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

export async function fetchSpeechOrder() {
  try {
    const records = await db.select().from(speechOrder).orderBy(asc(speechOrder.position));
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

export async function createSpeechOrderEntry(name) {
  try {
    const existing = await db.select().from(speechOrder);
    const nextPosition = existing.length;
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    await db.insert(speechOrder).values({ id, name, position: nextPosition, created: now, updated: now });
    const [record] = await db.select().from(speechOrder).where(eq(speechOrder.id, id));
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

export async function updateSpeechOrderEntry(id, name) {
  try {
    await db.update(speechOrder)
      .set({ name, updated: new Date().toISOString() })
      .where(eq(speechOrder.id, id));
    const [record] = await db.select().from(speechOrder).where(eq(speechOrder.id, id));
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

export async function moveSpeechOrderEntry(id, direction) {
  try {
    const records = await db.select().from(speechOrder).orderBy(asc(speechOrder.position));
    const index = records.findIndex((r) => r.id === id);
    const swapIndex = direction === 'up' ? index - 1 : index + 1;

    if (index === -1 || swapIndex < 0 || swapIndex >= records.length) {
      return { data: records, error: false };
    }

    const current = records[index];
    const swapWith = records[swapIndex];
    const now = new Date().toISOString();

    await db.update(speechOrder).set({ position: swapWith.position, updated: now }).where(eq(speechOrder.id, current.id));
    await db.update(speechOrder).set({ position: current.position, updated: now }).where(eq(speechOrder.id, swapWith.id));

    const updated = await db.select().from(speechOrder).orderBy(asc(speechOrder.position));
    return {
      data: updated,
      error: false,
    }
  } catch (error) {
    return {
      data: null,
      error: { message: error.message },
    }
  }
}

export async function deleteSpeechOrderEntry(id) {
  try {
    await db.delete(speechOrder).where(eq(speechOrder.id, id));
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

export async function fetchCanapes() {
  try {
    const records = await db.select().from(canapes).orderBy(asc(canapes.created));
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

export async function createCanapeEntry(name) {
  try {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    await db.insert(canapes).values({ id, name, created: now, updated: now });
    const [record] = await db.select().from(canapes).where(eq(canapes.id, id));
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

export async function updateCanapeEntry(id, name) {
  try {
    await db.update(canapes)
      .set({ name, updated: new Date().toISOString() })
      .where(eq(canapes.id, id));
    const [record] = await db.select().from(canapes).where(eq(canapes.id, id));
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

export async function deleteCanapeEntry(id) {
  try {
    await db.delete(canapes).where(eq(canapes.id, id));
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

export async function fetchDaytimeChecklist() {
  try {
    const records = await db.select().from(daytimeChecklist).orderBy(asc(daytimeChecklist.created));
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

export async function createDaytimeChecklistItem(name) {
  try {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    await db.insert(daytimeChecklist).values({ id, name, completed: false, created: now, updated: now });
    const [record] = await db.select().from(daytimeChecklist).where(eq(daytimeChecklist.id, id));
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

export async function toggleDaytimeChecklistItem(id, currentValue) {
  try {
    await db.update(daytimeChecklist)
      .set({ completed: !currentValue, updated: new Date().toISOString() })
      .where(eq(daytimeChecklist.id, id));
    const [record] = await db.select().from(daytimeChecklist).where(eq(daytimeChecklist.id, id));
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

export async function deleteDaytimeChecklistItem(id) {
  try {
    await db.delete(daytimeChecklist).where(eq(daytimeChecklist.id, id));
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

export async function fetchSuppliers() {
  try {
    const records = await db.select().from(suppliers).orderBy(asc(suppliers.created));
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

export async function createSupplierEntry(name, role, contactInfo) {
  try {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    await db.insert(suppliers).values({ id, name, role, contactInfo, created: now, updated: now });
    const [record] = await db.select().from(suppliers).where(eq(suppliers.id, id));
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

export async function updateSupplierEntry(id, name, role, contactInfo) {
  try {
    await db.update(suppliers)
      .set({ name, role, contactInfo, updated: new Date().toISOString() })
      .where(eq(suppliers.id, id));
    const [record] = await db.select().from(suppliers).where(eq(suppliers.id, id));
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

export async function deleteSupplierEntry(id) {
  try {
    await db.delete(suppliers).where(eq(suppliers.id, id));
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
