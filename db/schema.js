import { mysqlTable, varchar, text, boolean, timestamp, int } from 'drizzle-orm/mysql-core';
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
  seatNumber: varchar('seatNumber', { length: 255 }),
  phone: varchar('phone', { length: 255 }),
  email: varchar('email', { length: 255 }),
  starter: varchar('starter', { length: 255 }),
  main: varchar('main', { length: 255 }),
  dessert: varchar('dessert', { length: 255 }),
  dietry: text('dietry'),
  allergies: text('allergies'),
  eveningMeal: varchar('eveningMeal', { length: 255 }),
  songRequest: varchar('songRequest', { length: 500 }),
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

export const rooms = mysqlTable('rooms', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: varchar('name', { length: 255 }),
  description: text('description'),
  block: varchar('block', { length: 255 }),
  capacity: int('capacity'),
  created: varchar('created', { length: 255 }).$defaultFn(() => new Date().toISOString()),
  updated: varchar('updated', { length: 255 }).$defaultFn(() => new Date().toISOString()),
});

export const roomGuests = mysqlTable('room_guests', {
  room_id: varchar('room_id', { length: 36 }).notNull().references(() => rooms.id, { onDelete: 'cascade' }),
  guest_id: varchar('guest_id', { length: 36 }).notNull().references(() => guests.id, { onDelete: 'cascade' }),
});

export const weddingInfo = mysqlTable('wedding_info', {
  id: varchar('id', { length: 36 }).primaryKey().default('singleton'),
  masterOfCeremonies: varchar('masterOfCeremonies', { length: 255 }),
  ceremonyMusicGuest: varchar('ceremonyMusicGuest', { length: 255 }),
  aisleWalkSong: varchar('aisleWalkSong', { length: 255 }),
  signingSong: varchar('signingSong', { length: 255 }),
  exitSong: varchar('exitSong', { length: 255 }),
  firstDanceSong: varchar('firstDanceSong', { length: 255 }),
  djName: varchar('djName', { length: 255 }),
  djArrivalTime: varchar('djArrivalTime', { length: 255 }),
  djStartTime: varchar('djStartTime', { length: 255 }),
  boothMeasurements: varchar('boothMeasurements', { length: 255 }),
  djContractProvided: boolean('djContractProvided').default(false),
  welcomeDrinksCount: varchar('welcomeDrinksCount', { length: 255 }),
  nonAlcoholicWelcomeDrinksCount: varchar('nonAlcoholicWelcomeDrinksCount', { length: 255 }),
  toastingDrinksCount: varchar('toastingDrinksCount', { length: 255 }),
  nonAlcoholicToastingDrinksCount: varchar('nonAlcoholicToastingDrinksCount', { length: 255 }),
  cakeCut: varchar('cakeCut', { length: 255 }),
  cakeBigFlavour: varchar('cakeBigFlavour', { length: 255 }),
  cakeMediumFlavour: varchar('cakeMediumFlavour', { length: 255 }),
  cakeSmallFlavour: varchar('cakeSmallFlavour', { length: 255 }),
  cakeAmountSaved: varchar('cakeAmountSaved', { length: 255 }),
  sweetCart: varchar('sweetCart', { length: 255 }),
  baristas: varchar('baristas', { length: 255 }),
  created: varchar('created', { length: 255 }).$defaultFn(() => new Date().toISOString()),
  updated: varchar('updated', { length: 255 }).$defaultFn(() => new Date().toISOString()),
});

export const djSetlists = mysqlTable('dj_setlists', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: varchar('name', { length: 255 }),
  submitted: boolean('submitted').default(false),
  created: varchar('created', { length: 255 }).$defaultFn(() => new Date().toISOString()),
  updated: varchar('updated', { length: 255 }).$defaultFn(() => new Date().toISOString()),
});

export const bridalParty = mysqlTable('bridal_party', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: varchar('name', { length: 255 }),
  role: varchar('role', { length: 255 }),
  breakfastChoice: varchar('breakfastChoice', { length: 255 }),
  created: varchar('created', { length: 255 }).$defaultFn(() => new Date().toISOString()),
  updated: varchar('updated', { length: 255 }).$defaultFn(() => new Date().toISOString()),
});

export const groomsmen = mysqlTable('groomsmen', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: varchar('name', { length: 255 }),
  role: varchar('role', { length: 255 }),
  breakfastChoice: varchar('breakfastChoice', { length: 255 }),
  created: varchar('created', { length: 255 }).$defaultFn(() => new Date().toISOString()),
  updated: varchar('updated', { length: 255 }).$defaultFn(() => new Date().toISOString()),
});

export const aisleWalkOrder = mysqlTable('aisle_walk_order', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: varchar('name', { length: 255 }),
  position: int('position').default(0),
  created: varchar('created', { length: 255 }).$defaultFn(() => new Date().toISOString()),
  updated: varchar('updated', { length: 255 }).$defaultFn(() => new Date().toISOString()),
});

export const speechOrder = mysqlTable('speech_order', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: varchar('name', { length: 255 }),
  position: int('position').default(0),
  created: varchar('created', { length: 255 }).$defaultFn(() => new Date().toISOString()),
  updated: varchar('updated', { length: 255 }).$defaultFn(() => new Date().toISOString()),
});

export const suppliers = mysqlTable('suppliers', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: varchar('name', { length: 255 }),
  role: varchar('role', { length: 255 }),
  contactInfo: varchar('contactInfo', { length: 255 }),
  created: varchar('created', { length: 255 }).$defaultFn(() => new Date().toISOString()),
  updated: varchar('updated', { length: 255 }).$defaultFn(() => new Date().toISOString()),
});

export const canapes = mysqlTable('canapes', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: varchar('name', { length: 255 }),
  created: varchar('created', { length: 255 }).$defaultFn(() => new Date().toISOString()),
  updated: varchar('updated', { length: 255 }).$defaultFn(() => new Date().toISOString()),
});

export const daytimeChecklist = mysqlTable('daytime_checklist', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: varchar('name', { length: 255 }),
  completed: boolean('completed').default(false),
  created: varchar('created', { length: 255 }).$defaultFn(() => new Date().toISOString()),
  updated: varchar('updated', { length: 255 }).$defaultFn(() => new Date().toISOString()),
});

export const seatingTables = mysqlTable('seating_tables', {
  tableIndex: int('tableIndex').primaryKey(),
  name: varchar('name', { length: 255 }),
  created: varchar('created', { length: 255 }).$defaultFn(() => new Date().toISOString()),
  updated: varchar('updated', { length: 255 }).$defaultFn(() => new Date().toISOString()),
});

export const adminUsers = mysqlTable('admin_users', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: varchar('email', { length: 255 }).notNull(),
  passwordHash: varchar('passwordHash', { length: 255 }).notNull(),
  created: varchar('created', { length: 255 }).$defaultFn(() => new Date().toISOString()),
  updated: varchar('updated', { length: 255 }).$defaultFn(() => new Date().toISOString()),
});
