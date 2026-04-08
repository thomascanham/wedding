// Run with: node scripts/create-user.js
// Creates an admin user in the database.
// Requires DB_MYSQL to be set in your .env file.

import 'dotenv/config';
import bcrypt from 'bcryptjs';
import mysql from 'mysql2/promise';
import crypto from 'crypto';
import readline from 'readline';

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((res) => rl.question(q, res));

const email = await ask('Email: ');
const password = await ask('Password: ');
rl.close();

if (!email || !password) {
  console.error('Email and password are required.');
  process.exit(1);
}

const passwordHash = await bcrypt.hash(password.trim(), 12);
const id = crypto.randomUUID();
const now = new Date().toISOString();

const connection = await mysql.createConnection(process.env.DB_MYSQL);

await connection.execute(
  'INSERT INTO admin_users (id, email, passwordHash, created, updated) VALUES (?, ?, ?, ?, ?)',
  [id, email.trim().toLowerCase(), passwordHash, now, now]
);

await connection.end();
console.log(`✓ Admin user created for ${email.trim().toLowerCase()}`);
