/**
 * One-time migration script: PocketBase → SQLite
 *
 * Usage:
 *   1. Make sure PocketBase is still running and .env has DATABASE_URL etc.
 *   2. Run `npm run db:push` first to create the SQLite tables.
 *   3. Run `node db/seed.js`
 */
import 'dotenv/config';
import PocketBase from 'pocketbase';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { guests, invites, inviteGuests } from './schema.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, 'wedding.db');

const sqlite = new Database(dbPath);
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');
const db = drizzle(sqlite);

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
    db.insert(guests).values({
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
    }).run();
  }
  console.log(`Inserted ${pbGuests.length} guests into SQLite`);

  // --- Migrate invites ---
  const pbInvites = await pb.collection('invites').getFullList({ sort: 'name' });
  console.log(`Found ${pbInvites.length} invites in PocketBase`);

  for (const inv of pbInvites) {
    db.insert(invites).values({
      id: inv.id,
      name: inv.name || null,
      attendance: inv.attendance || null,
      sent: Boolean(inv.sent),
      qr_svg: inv.qr_svg || null,
      created: inv.created || new Date().toISOString(),
      updated: inv.updated || new Date().toISOString(),
    }).run();

    // Create join table rows from PocketBase relation array
    const guestIds = inv.guest || [];
    for (const gid of guestIds) {
      db.insert(inviteGuests).values({
        invite_id: inv.id,
        guest_id: gid,
      }).run();
    }
  }
  console.log(`Inserted ${pbInvites.length} invites into SQLite`);

  const joinCount = db.select().from(inviteGuests).all().length;
  console.log(`Created ${joinCount} invite-guest relationships`);

  console.log('\nMigration complete!');
  sqlite.close();
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
