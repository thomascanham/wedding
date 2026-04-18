// Run with: node scripts/seed-guests.js
// Seeds 50 fake guests with completed RSVPs into the database.
// Requires DB_MYSQL to be set in your .env file.

import 'dotenv/config';
import mysql from 'mysql2/promise';
import crypto from 'crypto';
import readline from 'readline';

const FIRSTNAMES = [
  'James', 'Oliver', 'Harry', 'Jack', 'George', 'Noah', 'Charlie', 'Jacob',
  'Alfie', 'Freddie', 'Emily', 'Olivia', 'Isla', 'Ava', 'Mia', 'Isabella',
  'Sophie', 'Amelia', 'Grace', 'Lily', 'William', 'Thomas', 'Henry', 'Edward',
  'Arthur', 'Oscar', 'Leo', 'Theo', 'Archie', 'Lucas', 'Charlotte', 'Poppy',
  'Daisy', 'Ruby', 'Ella', 'Evie', 'Freya', 'Hannah', 'Jessica', 'Lucy',
  'Daniel', 'Samuel', 'Matthew', 'Benjamin', 'Joseph', 'Eleanor', 'Alice',
  'Florence', 'Harriet', 'Clara',
];

const SURNAMES = [
  'Smith', 'Jones', 'Williams', 'Taylor', 'Brown', 'Davies', 'Evans', 'Wilson',
  'Thomas', 'Roberts', 'Johnson', 'Lewis', 'Walker', 'Robinson', 'Wood',
  'Thompson', 'White', 'Watson', 'Jackson', 'Wright', 'Green', 'Harris',
  'Cooper', 'King', 'Lee', 'Martin', 'Clarke', 'James', 'Morgan', 'Hughes',
];

const DIETARY = [
  null, null, null, null, null, // most have none
  'Vegetarian',
  'Vegan',
  'Gluten free',
  'Dairy free',
  'Halal',
  'No nuts',
];

const ALLERGIES = [
  null, null, null, null, null, null, // most have none
  'Nut allergy',
  'Shellfish allergy',
  'Lactose intolerant',
  'Gluten intolerance',
];

const SONG_REQUESTS = [
  'Mr Brightside - The Killers',
  'Dancing Queen - ABBA',
  'Sweet Caroline - Neil Diamond',
  'Don\'t Stop Me Now - Queen',
  'Uptown Funk - Bruno Mars',
  'Shake It Off - Taylor Swift',
  'September - Earth, Wind & Fire',
  'Livin\' on a Prayer - Bon Jovi',
  'I Wanna Dance with Somebody - Whitney Houston',
  'Africa - Toto',
  'Bohemian Rhapsody - Queen',
  'Come On Eileen - Dexys Midnight Runners',
  'Angels - Robbie Williams',
  'Is This the Way to Amarillo - Tony Christie',
  'Can\'t Stop the Feeling - Justin Timberlake',
  null, null, null, // some don't request
];

const EMAILS = [
  'gmail.com', 'outlook.com', 'hotmail.com', 'yahoo.co.uk', 'icloud.com',
];

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const coinFlip = (chanceOfTrue = 0.5) => Math.random() < chanceOfTrue;

if (!process.env.DB_MYSQL) {
  console.error('Error: DB_MYSQL is not set in your .env file.');
  process.exit(1);
}

// Show the host from the connection string so you can confirm before seeding
const hostMatch = process.env.DB_MYSQL.match(/@([^:/]+)/);
const host = hostMatch ? hostMatch[1] : 'unknown host';
console.log(`\nTarget database host: ${host}`);
console.log('This will insert 50 fake guests into that database.');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const answer = await new Promise((res) => rl.question('\nProceed? (yes/no): ', res));
rl.close();

if (answer.trim().toLowerCase() !== 'yes') {
  console.log('Aborted.');
  process.exit(0);
}

const connection = await mysql.createConnection(process.env.DB_MYSQL);
console.log('Connected to database.');

let inserted = 0;

for (let i = 0; i < 50; i++) {
  const firstname = FIRSTNAMES[i % FIRSTNAMES.length];
  const surname = pick(SURNAMES);
  const name = `${firstname} ${surname}`;
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  const attendanceType = coinFlip(0.65) ? 'ceremony' : 'reception';
  const attending = coinFlip(0.8); // 80% attending
  const rsvpStatus = attending ? 'attending' : 'declined';

  const email = `${firstname.toLowerCase()}.${surname.toLowerCase()}@${pick(EMAILS)}`;
  const hoop = attendanceType === 'ceremony' && coinFlip(0.5);

  let starter = null;
  let main = null;
  let dessert = null;
  let eveningMeal = null;
  let dietry = null;
  let allergies = null;
  let songRequest = null;

  if (attending) {
    eveningMeal = coinFlip(0.8) ? 'Hog Roast' : 'Vegetarian / Vegan';
    dietry = pick(DIETARY);
    allergies = pick(ALLERGIES);
    songRequest = pick(SONG_REQUESTS);

    if (attendanceType === 'ceremony') {
      starter = 'Rustic Antipasti Sharing Boards';
      main = 'Spanish Inspired Tapas Feast';
      dessert = coinFlip() ? 'Baked Vanilla Cheesecake' : 'Sticky Toffee Pudding with Custard';
    }
  }

  await connection.execute(
    `INSERT INTO guests
      (id, firstname, surname, name, attendanceType, rsvpStatus, hasCheckedIn, hoop,
       email, starter, main, dessert, eveningMeal, dietry, allergies, songRequest, created, updated)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id, firstname, surname, name, attendanceType, rsvpStatus, true, hoop,
      email, starter, main, dessert, eveningMeal, dietry, allergies, songRequest, now, now,
    ]
  );

  inserted++;
  console.log(`  [${inserted}/50] ${name} — ${attendanceType}, ${rsvpStatus}`);
}

await connection.end();
console.log(`\n✓ Seeded ${inserted} guests successfully.`);
