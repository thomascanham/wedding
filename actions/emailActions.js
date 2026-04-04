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
    const records = await db.select().from(guests)
      .where(and(isNotNull(guests.email), ne(guests.email, '')))
      .orderBy(guests.surname);
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
    const guestList = await db.select().from(guests)
      .where(and(isNotNull(guests.email), ne(guests.email, '')));

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

export async function sendRsvpNotification(guest) {
  const attending = guest.rsvpStatus === 'attending';
  const subject = `RSVP: ${guest.name} is ${attending ? 'attending' : 'not attending'} your wedding 🎉`;

  const html = `
    <div style="font-family: Georgia, serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; background: #fdf8f0; border: 1px solid #d9c9b0; border-radius: 6px;">
      <h1 style="font-size: 1.6rem; color: #49080c; margin: 0 0 8px;">New RSVP received</h1>
      <p style="color: #7a6248; font-size: 0.95rem; margin: 0 0 24px;">A guest has just submitted their RSVP.</p>

      <table style="width: 100%; border-collapse: collapse; font-size: 0.95rem;">
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #e8d8c0; color: #9a7e5e; width: 40%;">Guest</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #e8d8c0; color: #3a2a1a; font-weight: bold;">${guest.name}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #e8d8c0; color: #9a7e5e;">Status</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #e8d8c0; color: ${attending ? '#4a7a3a' : '#c0392b'}; font-weight: bold;">
            ${attending ? 'Attending ✓' : 'Not attending ✗'}
          </td>
        </tr>
        ${attending ? `
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #e8d8c0; color: #9a7e5e;">Dessert</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #e8d8c0; color: #3a2a1a;">${guest.dessert || '—'}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #e8d8c0; color: #9a7e5e;">Dietary</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #e8d8c0; color: #3a2a1a;">${guest.dietry || 'None'}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #e8d8c0; color: #9a7e5e;">Allergies</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #e8d8c0; color: #3a2a1a;">${guest.allergies || 'None'}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #e8d8c0; color: #9a7e5e;">Song request</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #e8d8c0; color: #3a2a1a;">${guest.songRequest || '—'}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #9a7e5e;">Email</td>
          <td style="padding: 10px 0; color: #3a2a1a;">${guest.email || '—'}</td>
        </tr>
        ` : ''}
      </table>

      <p style="margin: 28px 0 0; font-size: 0.8rem; color: #b5a08a; font-style: italic;">Tom &amp; Sam · 10.10.26</p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"Tom and Sam's Wedding" <${process.env.SMTP_FROM}>`,
      to: ['tom_canham@yahoo.co.uk', 'samanthabettany20@gmail.com'],
      subject,
      html,
    });
  } catch (err) {
    console.error('[RSVP notification] Failed to send email:', err.message);
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
