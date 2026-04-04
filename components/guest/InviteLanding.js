'use client';
import Link from 'next/link';
import Image from 'next/image';
import { IconCheck } from '@tabler/icons-react';
import classes from './InviteLanding.module.css';

export default function InviteLanding({ invite }) {
  const guests = invite.expand?.guest || [];

  return (
    <div className={classes.page}>
      {/* Hero */}
      <div className={classes.hero}>
        <Image
          src="/images/guestHero.jpg"
          alt="Wedding venue"
          fill
          style={{ objectFit: 'cover', objectPosition: 'center' }}
          priority
        />
        <div className={classes.heroOverlay} />
        <div className={classes.heroContent}>
          <p className={classes.heroEyebrow}>You&apos;re invited to celebrate</p>
          <h1 className={classes.heroTitle}>Tom &amp; Sam</h1>
          <p className={classes.heroDate}>10 · 10 · 26</p>
          <div className={classes.heroDivider} />
          <p className={classes.heroVenue}>are getting married</p>
        </div>
      </div>

      {/* RSVP Section */}
      <div className={classes.rsvpSection}>
        <div className={classes.rsvpInner}>
          <div className={classes.sectionHeader}>
            <h2 className={classes.sectionTitle}>Your RSVP</h2>
            <p className={classes.sectionSubtitle}>
              Please tap your name below to let us know if you can make it.
            </p>
          </div>

          <div className={classes.guestList}>
            {guests.map((guest) => (
              <GuestItem key={guest.id} guest={guest} inviteId={invite.id} />
            ))}
          </div>

          {guests.length === 0 && (
            <p className={classes.noGuests}>No guests found on this invite.</p>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className={classes.footer}>
        <p>We can&apos;t wait to celebrate with you &mdash; Tom &amp; Sam</p>
      </div>
    </div>
  );
}

function GuestItem({ guest, inviteId }) {
  const done = guest.hasCheckedIn;

  if (done) {
    return (
      <div className={`${classes.guestCard} ${classes.guestCardDone}`}>
        <span className={classes.guestName}>{guest.name}</span>
        <span className={classes.guestBadge}>
          <IconCheck size={14} strokeWidth={3} />
          {guest.rsvpStatus === 'attending' ? 'Attending' : 'Not attending'}
        </span>
      </div>
    );
  }

  return (
    <Link
      href={`/guest/${guest.id}?from=${inviteId}`}
      className={`${classes.guestCard} ${classes.guestCardLink}`}
    >
      <span className={classes.guestName}>{guest.name}</span>
      <span className={classes.guestArrow}>RSVP →</span>
    </Link>
  );
}
