'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { submitGuestRsvp } from '@/actions/guestActions';
import classes from './RsvpForm.module.css';

const DESSERT_OPTIONS = [
  { value: 'cheesecake', label: 'Baked Vanilla Cheesecake with Raspberry Coulis' },
  { value: 'sticky_toffee', label: 'Sticky Toffee Pudding with Custard' },
];

const TOTAL_STEPS = 5; // attending, meal, dietary, song, email

export default function RsvpForm({ guest, inviteId }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [attending, setAttending] = useState(null);
  const [dessert, setDessert] = useState('');
  const [dietry, setDietry] = useState('');
  const [allergies, setAllergies] = useState('');
  const [songRequest, setSongRequest] = useState('');
  const [email, setEmail] = useState('');

  const backToInvite = () => {
    if (inviteId) router.push(`/invite/${inviteId}`);
    else router.back();
  };

  async function handleDecline() {
    setSubmitting(true);
    const result = await submitGuestRsvp(guest.id, { attending: false });
    setSubmitting(false);
    if (result.error) {
      setError('Something went wrong. Please try again.');
      return;
    }
    backToInvite();
  }

  async function handleFinalSubmit() {
    setSubmitting(true);
    const result = await submitGuestRsvp(guest.id, {
      attending: true,
      dessert,
      dietry,
      allergies,
      songRequest,
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
          <p className={classes.eyebrow}>10 · 10 · 26</p>
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
              onAttend={() => setStep(2)}
              onDecline={handleDecline}
              submitting={submitting}
            />
          )}
          {step === 2 && attending !== false && (
            <StepMeal
              dessert={dessert}
              setDessert={setDessert}
              onNext={() => setStep(3)}
              onBack={() => setStep(1)}
            />
          )}
          {step === 3 && (
            <StepDietary
              dietry={dietry}
              setDietry={setDietry}
              allergies={allergies}
              setAllergies={setAllergies}
              onNext={() => setStep(4)}
              onBack={() => setStep(2)}
            />
          )}
          {step === 4 && (
            <StepSong
              songRequest={songRequest}
              setSongRequest={setSongRequest}
              onNext={() => setStep(5)}
              onBack={() => setStep(3)}
            />
          )}
          {step === 5 && (
            <StepEmail
              email={email}
              setEmail={setEmail}
              onSubmit={handleFinalSubmit}
              onBack={() => setStep(4)}
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
        We&apos;d love to celebrate with you, {guestName}. Please let us know if you can make it.
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

/* ── Step 2: Meal choices ────────────────────────────────────── */
function StepMeal({ dessert, setDessert, onNext, onBack }) {
  return (
    <div className={classes.step}>
      <h2 className={classes.stepTitle}>Your menu</h2>
      <p className={classes.stepText}>
        We&apos;ve taken care of the starter and main course, all that&apos;s left is the important decision… dessert
      </p>

      <div className={classes.menuItems}>
        <div className={classes.menuItem}>
          <span className={classes.menuCourse}>Starter</span>
          <span className={classes.menuDish}>Rustic Antipasti Sharing Boards</span>
        </div>
        <div className={classes.menuDivider} />
        <div className={classes.menuItem}>
          <span className={classes.menuCourse}>Main</span>
          <span className={classes.menuDish}>Spanish Inspired Tapas Feast</span>
        </div>
        <div className={classes.menuDivider} />
        <div className={classes.menuItem}>
          <span className={classes.menuCourse}>Dessert</span>
          <span className={classes.menuDish}>Please choose from the following</span>
        </div>
        <div className={classes.dessertOptions}>
          {DESSERT_OPTIONS.map((opt) => (
            <label key={opt.value} className={`${classes.dessertOption} ${dessert === opt.value ? classes.dessertOptionSelected : ''}`}>
              <input
                type="radio"
                name="dessert"
                value={opt.value}
                checked={dessert === opt.value}
                onChange={() => setDessert(opt.value)}
                className={classes.hiddenRadio}
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>

      <div className={classes.navRow}>
        <button className={classes.backBtn} onClick={onBack}>← Back</button>
        <button className={classes.nextBtn} onClick={onNext} disabled={!dessert}>
          Next →
        </button>
      </div>
    </div>
  );
}

/* ── Step 3: Dietary ─────────────────────────────────────────── */
function StepDietary({ dietry, setDietry, allergies, setAllergies, onNext, onBack }) {
  return (
    <div className={classes.step}>
      <h2 className={classes.stepTitle}>Dietary requirements</h2>
      <p className={classes.stepText}>
        Do you have any dietary requirements or allergies we should know about? Leave blank if none.
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

/* ── Step 4: Song request ────────────────────────────────────── */
function StepSong({ songRequest, setSongRequest, onNext, onBack }) {
  return (
    <div className={classes.step}>
      <h2 className={classes.stepTitle}>Song request</h2>
      <p className={classes.stepText}>
        Is there a song you&apos;d love to hear on the night? We&apos;ll do our best to get it on the playlist.
      </p>

      <div className={classes.fieldGroup}>
        <label className={classes.fieldLabel}>Your song request (optional)</label>
        <input
          type="text"
          className={classes.input}
          placeholder="e.g. Mr Brightside – The Killers"
          value={songRequest}
          onChange={(e) => setSongRequest(e.target.value)}
        />
      </div>

      <div className={classes.navRow}>
        <button className={classes.backBtn} onClick={onBack}>← Back</button>
        <button className={classes.nextBtn} onClick={onNext}>Next →</button>
      </div>
    </div>
  );
}

/* ── Step 5: Email ───────────────────────────────────────────── */
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
