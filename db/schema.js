import { mysqlTable, varchar, text, boolean, timestamp } from 'drizzle-orm/mysql-core';
import crypto from 'crypto';

export const guests = mysqlTable('guests', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  firstname: varchar('firstname', { length: 255 }),
  surname: varchar('surname', { length: 255 }),
  name: varchar('name', { length: 255 }),
  attendanceType: varchar('attendanceType', { length: 255 }),
  rsvpStatus: varchar('rsvpStatus', { length: 255 }),
  hasCheckedIn: boolean('hasCheckedIn').default(false),
  hoop: boolean('hoop').default(false),
  phone: varchar('phone', { length: 255 }),
  email: varchar('email', { length: 255 }),
  starter: varchar('starter', { length: 255 }),
  main: varchar('main', { length: 255 }),
  dessert: varchar('dessert', { length: 255 }),
  dietry: text('dietry'),
  allergies: text('allergies'),
  created: varchar('created', { length: 255 }).$defaultFn(() => new Date().toISOString()),
  updated: varchar('updated', { length: 255 }).$defaultFn(() => new Date().toISOString()),
});

export const invites = mysqlTable('invites', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: varchar('name', { length: 255 }),
  attendance: varchar('attendance', { length: 255 }),
  sent: boolean('sent').default(false),
  qr_svg: text('qr_svg'),
  created: varchar('created', { length: 255 }).$defaultFn(() => new Date().toISOString()),
  updated: varchar('updated', { length: 255 }).$defaultFn(() => new Date().toISOString()),
});

export const inviteGuests = mysqlTable('invite_guests', {
  invite_id: varchar('invite_id', { length: 36 }).notNull().references(() => invites.id, { onDelete: 'cascade' }),
  guest_id: varchar('guest_id', { length: 36 }).notNull().references(() => guests.id, { onDelete: 'cascade' }),
});
