import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import crypto from 'crypto';

export const guests = sqliteTable('guests', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  firstname: text('firstname'),
  surname: text('surname'),
  name: text('name'),
  attendanceType: text('attendanceType'),
  rsvpStatus: text('rsvpStatus'),
  hasCheckedIn: integer('hasCheckedIn', { mode: 'boolean' }).default(false),
  hoop: integer('hoop', { mode: 'boolean' }).default(false),
  phone: text('phone'),
  email: text('email'),
  starter: text('starter'),
  main: text('main'),
  dessert: text('dessert'),
  dietry: text('dietry'),
  allergies: text('allergies'),
  created: text('created').$defaultFn(() => new Date().toISOString()),
  updated: text('updated').$defaultFn(() => new Date().toISOString()),
});

export const invites = sqliteTable('invites', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name'),
  attendance: text('attendance'),
  sent: integer('sent', { mode: 'boolean' }).default(false),
  qr_svg: text('qr_svg'),
  created: text('created').$defaultFn(() => new Date().toISOString()),
  updated: text('updated').$defaultFn(() => new Date().toISOString()),
});

export const inviteGuests = sqliteTable('invite_guests', {
  invite_id: text('invite_id').notNull().references(() => invites.id, { onDelete: 'cascade' }),
  guest_id: text('guest_id').notNull().references(() => guests.id, { onDelete: 'cascade' }),
});
