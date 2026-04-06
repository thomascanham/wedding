'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { submitReceptionRsvp } from '@/actions/guestActions';
import classes from './RsvpForm.module.css';

const TOTAL_STEPS = 3; // attending, dietary, email

export default function RsvpFormReception({ guest, inviteId }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [attending, setAttending] = useState(null);
  const [dietry, setDietry] = useState('');
  const [allergies, setAllergies] = useState('');
  const [email, setEmail] = useState('');

  const backToInvite = () => {
    if (inviteId) router.push(`/invite/${inviteId}`);
    else router.back();
  };

  async function handleDecline() {
    setSubmitting(true);
    const result = await submitReceptionRsvp(guest.id, { attending: false });
    setSubmitting(false);
    if (result.error) {
      setError('Something went wrong. Please try again.');
      return;
    }
    backToInvite();
  }

  async function handleFinalSubmit() {
    setSubmitting(true);
    const result = await submitReceptionRsvp(guest.id, {
      attending: true,
      dietry,
      allergies,
      email,
    });
    setSubmitting(false);
    if (result.error) {
      setError('Something went wrong. Please try again.');
      return;
    }
    backToInvite();
  }

  const progressPercent = Math.round((step / TOTAL_STEPS) * 100);

  return (
    <div className={classes.page}>
      <div className={classes.card}>
        {/* Header */}
        <div className={classes.cardHeader}>
          <p className={classes.eyebrow}>Wedding Reception · 10 · 10 · 26</p>
          <h1 className={classes.title}>Tom &amp; Sam</h1>
          <p className={classes.guestName}>{guest.name}</p>
        </div>

        {/* Progress bar */}
        {attending !== false && (
          <div className={classes.progressBar}>
            <div
              className={classes.progressFill}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}

        {/* Step content */}
        <div className={classes.body}>
          {step === 1 && (
            <StepAttending
              guestName={guest.firstname}
              onAttend={() => { setAttending(true); setStep(2); }}
              onDecline={handleDecline}
              submitting={submitting}
            />
          )}
          {step === 2 && (
            <StepDietary
              dietry={dietry}
              setDietry={setDietry}
              allergies={allergies}
              setAllergies={setAllergies}
              onNext={() => setStep(3)}
              onBack={() => setStep(1)}
            />
          )}
          {step === 3 && (
            <StepEmail
              email={email}
              setEmail={setEmail}
              onSubmit={handleFinalSubmit}
              onBack={() => setStep(2)}
              submitting={submitting}
            />
          )}

          {error && <p className={classes.errorMsg}>{error}</p>}
        </div>
      </div>
    </div>
  );
}

/* ── Step 1: Attending? ──────────────────────────────────────── */
function StepAttending({ guestName, onAttend, onDecline, submitting }) {
  return (
    <div className={classes.step}>
      <h2 className={classes.stepTitle}>Will you be joining us?</h2>
      <p className={classes.stepText}>
        We&apos;d love to celebrate with you, {guestName}. Please let us know if you can make it to the reception.
      </p>
      <div className={classes.choiceRow}>
        <button className={`${classes.choiceBtn} ${classes.choiceBtnYes}`} onClick={onAttend} disabled={submitting}>
          Joyfully accepts
        </button>
        <button className={`${classes.choiceBtn} ${classes.choiceBtnNo}`} onClick={onDecline} disabled={submitting}>
          {submitting ? 'Saving…' : 'Regretfully declines'}
        </button>
      </div>
    </div>
  );
}

/* ── Step 2: Dietary ─────────────────────────────────────────── */
function StepDietary({ dietry, setDietry, allergies, setAllergies, onNext, onBack }) {
  return (
    <div className={classes.step}>
      <h2 className={classes.stepTitle}>Evening food</h2>
      <p className={classes.stepText}>
        We&apos;ll be serving a <strong>hog roast</strong> for the evening food. Please let us know if you have any dietary requirements or allergies we should be aware of.
      </p>

      <div className={classes.fieldGroup}>
        <label className={classes.fieldLabel}>Dietary requirements</label>
        <textarea
          className={classes.textarea}
          rows={3}
          placeholder="e.g. vegetarian, vegan, gluten free…"
          value={dietry}
          onChange={(e) => setDietry(e.target.value)}
        />
      </div>

      <div className={classes.fieldGroup}>
        <label className={classes.fieldLabel}>Allergies</label>
        <textarea
          className={classes.textarea}
          rows={3}
          placeholder="e.g. nuts, dairy, shellfish…"
          value={allergies}
          onChange={(e) => setAllergies(e.target.value)}
        />
      </div>

      <div className={classes.navRow}>
        <button className={classes.backBtn} onClick={onBack}>← Back</button>
        <button className={classes.nextBtn} onClick={onNext}>Next →</button>
      </div>
    </div>
  );
}

/* ── Step 3: Email ───────────────────────────────────────────── */
function StepEmail({ email, setEmail, onSubmit, onBack, submitting }) {
  return (
    <div className={classes.step}>
      <h2 className={classes.stepTitle}>Stay in the loop</h2>
      <p className={classes.stepText}>
        Leave your email address if you&apos;d like to receive any updates about the day. This is completely optional.
      </p>

      <div className={classes.fieldGroup}>
        <label className={classes.fieldLabel}>Email address (optional)</label>
        <input
          type="email"
          className={classes.input}
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className={classes.navRow}>
        <button className={classes.backBtn} onClick={onBack}>← Back</button>
        <button className={classes.submitBtn} onClick={onSubmit} disabled={submitting}>
          {submitting ? 'Saving…' : 'Complete RSVP ✓'}
        </button>
      </div>
    </div>
  );
}
