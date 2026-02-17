'use server';
import nodemailer from 'nodemailer';
import { getPocketbase } from "@/database";

const database = await getPocketbase();

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
    const records = await database.collection('guests').getFullList({
      sort: 'surname',
      filter: 'email != null && email != ""',
    });
    const plainRecords = records.map((record) => ({ ...record }));
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

export async function sendEmailToAllGuests(subject, htmlContent) {
  try {
    const guests = await database.collection('guests').getFullList({
      filter: 'email != null && email != ""',
    });

    if (guests.length === 0) {
      return {
        success: false,
        sent: 0,
        error: { message: 'No guests with email addresses found' },
      }
    }

    const results = [];
    const errors = [];

    for (const guest of guests) {
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
