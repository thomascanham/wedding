'use server';
import { getPocketbase } from "@/database";

const database = await getPocketbase();

export async function fetchAllInvites() {
  try {
    const records = await database.collection('invites').getFullList({
      sort: 'name',
      expand: 'guest',
    });
    return {
      data: records,
      total: records.length,
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
    const record = await database.collection('invites').create({
      name,
      guest: guestIds,
      attendance,
      sent: false,
    });
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

export async function updateInvite(id, data) {
  try {
    const record = await database.collection('invites').update(id, data);
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
    await database.collection('invites').delete(id);
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
    const record = await database.collection('invites').update(inviteId, {
      guest: guestIds,
    });
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
