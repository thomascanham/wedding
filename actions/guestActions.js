'use server';
import { getPocketbase } from "@/database";

const database = await getPocketbase();

//fetch all guests in surname alphabetical order
export async function fetchAllGuests() {
  try {
    const records = await database.collection('guests').getFullList({
      sort: 'surname'
    });
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
    const record = await database.collection('guests').create({
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

export async function toggleGuestHoop(id, currentValue) {
  try {
    const record = await database.collection('guests').update(id, {
      hoop: !currentValue,
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

export async function deleteGuest(id) {
  try {
    await database.collection('guests').delete(id);
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