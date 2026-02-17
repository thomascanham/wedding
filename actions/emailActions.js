'use server';
import nodemailer from 'nodemailer';
import { db } from "@/database";
import { guests } from "@/db/schema";
import { isNotNull, ne, and } from "drizzle-orm";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function fetchGuestsWithEmail() {
  try {
    const records = db.select().from(guests)
      .where(and(isNotNull(guests.email), ne(guests.email, '')))
      .orderBy(guests.surname)
      .all();
    return {
      data: records,
      total: records.length,
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

export async function sendEmailToAllGuests(subject, htmlContent) {
  try {
    const guestList = db.select().from(guests)
      .where(and(isNotNull(guests.email), ne(guests.email, '')))
      .all();

    if (guestList.length === 0) {
      return {
        success: false,
        sent: 0,
        error: { message: 'No guests with email addresses found' },
      }
    }

    const results = [];
    const errors = [];

    for (const guest of guestList) {
      try {
        await transporter.sendMail({
          from: `"Tom & Sam" <${process.env.SMTP_FROM}>`,
          replyTo: `${process.env.SMTP_TO}`,
          to: guest.email,
          subject: subject,
          html: htmlContent,
        });
        results.push({ id: guest.id, name: guest.name, email: guest.email });
      } catch (err) {
        errors.push({ id: guest.id, name: guest.name, email: guest.email, error: err.message });
      }
    }

    return {
      success: true,
      sent: results.length,
      failed: errors.length,
      results,
      errors,
      error: false,
    }
  } catch (error) {
    return {
      success: false,
      sent: 0,
      error: { message: error.message },
    }
  }
}

export async function sendEmailToGuest(email, subject, htmlContent) {
  try {
    await transporter.sendMail({
      from: `"Tom & Sam" <${process.env.SMTP_FROM}>`,
      to: email,
      subject: subject,
      html: htmlContent,
      replyTo: `${process.env.SMTP_TO}`,
    });

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

export async function sendTestEmail(to, subject, htmlContent) {
  try {
    await transporter.sendMail({
      from: `"Tom & Sam" <${process.env.SMTP_FROM}>`,
      to: to,
      subject: subject,
      html: htmlContent,
      replyTo: `${process.env.SMTP_TO}`,
    });

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
