/**
 * One-time migration script: PocketBase → MySQL
 *
 * Usage:
 *   1. Make sure PocketBase is still running and .env has DATABASE_URL etc.
 *   2. Make sure DB_MYSQL is set in .env
 *   3. Run `npm run db:push` first to create the MySQL tables.
 *   4. Run `node db/seed.js`
 */
import 'dotenv/config';
import PocketBase from 'pocketbase';
import mysql from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import { guests, invites, inviteGuests } from './schema.js';

const pool = mysql.createPool(process.env.DB_MYSQL);
const db = drizzle(pool);

async function main() {
  const pb = new PocketBase(process.env.DATABASE_URL);
  pb.autoCancellation(false);

  if (process.env.PB_SUPERUSER_TOKEN) {
    pb.authStore.save(process.env.PB_SUPERUSER_TOKEN, null);
  } else {
    await pb.collection('_superusers').authWithPassword(
      process.env.DATABASE_USERNAME,
      process.env.DATABASE_SECRET
    );
  }

  // --- Migrate guests ---
  const pbGuests = await pb.collection('guests').getFullList({ sort: 'surname' });
  console.log(`Found ${pbGuests.length} guests in PocketBase`);

  for (const g of pbGuests) {
    await db.insert(guests).values({
      id: g.id,
      firstname: g.firstname || null,
      surname: g.surname || null,
      name: g.name || null,
      attendanceType: g.attendanceType || null,
      rsvpStatus: g.rsvpStatus || null,
      hasCheckedIn: Boolean(g.hasCheckedIn),
      hoop: Boolean(g.hoop),
      phone: g.phone || null,
      email: g.email || null,
      starter: g.starter || null,
      main: g.main || null,
      dessert: g.dessert || null,
      dietry: g.dietry || null,
      allergies: g.allergies || null,
      created: g.created || new Date().toISOString(),
      updated: g.updated || new Date().toISOString(),
    });
  }
  console.log(`Inserted ${pbGuests.length} guests into MySQL`);

  // --- Migrate invites ---
  const pbInvites = await pb.collection('invites').getFullList({ sort: 'name' });
  console.log(`Found ${pbInvites.length} invites in PocketBase`);

  for (const inv of pbInvites) {
    await db.insert(invites).values({
      id: inv.id,
      name: inv.name || null,
      attendance: inv.attendance || null,
      sent: Boolean(inv.sent),
      qr_svg: inv.qr_svg || null,
      created: inv.created || new Date().toISOString(),
      updated: inv.updated || new Date().toISOString(),
    });

    // Create join table rows from PocketBase relation array
    const guestIds = inv.guest || [];
    for (const gid of guestIds) {
      await db.insert(inviteGuests).values({
        invite_id: inv.id,
        guest_id: gid,
      });
    }
  }
  console.log(`Inserted ${pbInvites.length} invites into MySQL`);

  const joinRows = await db.select().from(inviteGuests);
  console.log(`Created ${joinRows.length} invite-guest relationships`);

  console.log('\nMigration complete!');
  await pool.end();
}

main().catch(async (err) => {
  console.error('Migration failed:', err);
  await pool.end();
  process.exit(1);
});
