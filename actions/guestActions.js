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