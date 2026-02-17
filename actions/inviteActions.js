'use server';
import { getPocketbase } from "@/database";
import QRCode from 'qrcode';

const database = await getPocketbase();

const QR_OPTIONS = {
  type: 'svg',
  color: {
    dark: '#721F14',
    light: '#E9DDCD',
  },
  margin: 2,
  width: 256,
};

export async function fetchAllInvites() {
  try {
    const records = await database.collection('invites').getFullList({
      sort: 'name',
      expand: 'guest',
    });
    const plainRecords = records.map((record) => {
      const plain = { ...record };
      if (record.expand?.guest) {
        plain.expand = {
          ...record.expand,
          guest: record.expand.guest.map((g) => ({ ...g })),
        };
      }
      return plain;
    });
    return {
      data: plainRecords,
      total: plainRecords.length,
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
      data: { ...record },
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
      data: { ...record },
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
      data: { ...record },
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
    const record = await database.collection('invites').update(inviteId, {
      qr_svg: null,
    });
    return {
      data: { ...record },
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

    const record = await database.collection('invites').update(inviteId, {
      qr_svg: svgString,
    });

    return {
      data: { ...record },
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
    const invites = await database.collection('invites').getFullList();
    const results = [];

    for (const invite of invites) {
      const inviteUrl = `${baseUrl}/invite/${invite.id}`;
      const svgString = await QRCode.toString(inviteUrl, QR_OPTIONS);

      await database.collection('invites').update(invite.id, {
        qr_svg: svgString,
      });

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
