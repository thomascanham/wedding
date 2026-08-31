# Wedding Guest Management App

Tom (developer/groom) & Sam (bride). Wedding date: 10/10/26. Rustic farmhouse venue.

## Stack
- Next.js 16 (App Router), React 19
- Mantine v8 (admin UI only)
- Drizzle ORM + MySQL (remote host: 87.106.110.142)
- Nodemailer via IONOS SMTP (`donnington@tomcanham.co.uk`)
- `drizzle-kit push` for schema changes — NO migration files, just edit schema.js and run `npm run db:push`
- Playfair Display (headings) + Raleway (body) — both loaded via next/font/google in root layout

## Databases — dev and production are SEPARATE
- `DB_MYSQL` (in `.env`) — local dev database, port 3307. Used automatically by `npm run dev` and by `drizzle-kit push`.
- `PRODUCTION_DB` (in `.env`) — the live production database, port 3306, different user. NOT used automatically by anything — it's just stored there for reference.
- To push a schema change to production after pushing it to dev, run:
  ```
  export DB_MYSQL="$(grep '^PRODUCTION_DB=' .env | sed -E 's/^PRODUCTION_DB="(.*)"$/\1/')" && npx drizzle-kit push
  ```
  This borrows `PRODUCTION_DB`'s value into `DB_MYSQL` for that one command only — it does not touch `.env` or affect the local dev server.
- Always verify a production push actually applied (re-run the push command and confirm "No changes detected", or `DESCRIBE` the affected table) — don't assume it worked.
- `backups/` contains manual mysqldump snapshots of production, named `production-backup-<timestamp>.sql`.

## Auth
- Admin protected by httpOnly cookie (`SITE_UNLOCK_COOKIE` env var)
- Login checks email + password against `admin_users` table using bcryptjs (cost factor 12)
- Timing attack prevention: always runs `bcrypt.compare` even when user not found (uses DUMMY_HASH)
- Cookie valid 30 days. Auth logic in `actions/authActions.js`
- Always redirects to `/admin` after login — no returnTo logic
- PocketBase fully removed from auth (still imported in `database.js` for legacy reasons but unused by auth)

### First-time setup
- `/setup` page — one-time admin account creation, guarded by `SETUP_TOKEN` env var + empty `admin_users` table check
- Redirects permanently to `/login` once any admin user exists
- Alternative: `scripts/create-user.js` — Node script to create admin user from terminal

## Database schema (`db/schema.js`)
14 tables:

**guests** — id(uuid), firstname, surname, name, attendanceType, rsvpStatus, hasCheckedIn(bool), hoop(bool), seatNumber, phone, email, starter, main, dessert, eveningMeal, dietry(text), allergies(text), songRequest(varchar500), created, updated
- `eveningMeal` = evening food choice for both ceremony and reception guests ('Hog Roast' | 'Vegetarian / Vegan')
- `hoop` = embroidery hoop made for that guest (ceremony guests only)
- `hasCheckedIn` = RSVP submitted lock (true = submitted, can't re-submit)
- `rsvpStatus` = 'attending' | 'declined' | null
- `attendanceType` = 'ceremony' | 'reception'
- `seatNumber` = free-text varchar, but in practice used as an integer seat number 1–60 (ceremony seating only). Must be unique across guests — enforced in `updateGuestSeatNumber` (app-level check, not a DB constraint), which returns an error naming the conflicting guest instead of writing.

**invites** — id(uuid), name, attendance('ceremony'|'reception'), sent(bool), qr_svg(text), created, updated

**invite_guests** — invite_id, guest_id (join table, cascade delete)

**rooms** — id, name, description, block, capacity(int), created, updated

**room_guests** — room_id, guest_id (join table, cascade delete)

**admin_users** — id(uuid), email, passwordHash, created, updated

**wedding_info** — id(pk, default `'singleton'` — single-row table), masterOfCeremonies, ceremonyMusicGuest, aisleWalkSong, signingSong, exitSong, firstDanceSong, djName, djArrivalTime, djStartTime, boothMeasurements, djContractProvided(bool), welcomeDrinksCount, nonAlcoholicWelcomeDrinksCount, toastingDrinksCount, nonAlcoholicToastingDrinksCount, cakeCut, cakeBigFlavour, cakeMediumFlavour, cakeSmallFlavour, cakeAmountSaved, sweetCart, baristas, created, updated
- Backs the `/admin/info` "single source of truth" page for venue/registrar/supplier handoff. Schema also documented as JSON at `app/admin/info/wedding-info-schema.json`.

**dj_setlists** — id, name, submitted(bool), created, updated

**bridal_party** / **groomsmen** — id, name, role, breakfastChoice, created, updated (identical shape, separate tables)

**aisle_walk_order** / **speech_order** — id, name, position(int), created, updated (identical shape, separate tables) — orderable via move-up/move-down actions

**suppliers** — id, name, role, contactInfo, created, updated

**canapes** — id, name, created, updated

**daytime_checklist** — id, name, completed(bool), created, updated

Enrichment pattern: both invites and rooms use an `enrichWithGuests()` helper that returns:
```
{ ...record, guest: [guestId, ...], expand: { guest: [fullGuestObj, ...] } }
```

## Routes

### Admin (`/admin/*`) — Mantine UI, protected
- `/admin` — dashboard (stat cards, recent RSVPs, route nav cards)
- `/admin/guests` — guest list with filters (attendanceType, hoop status), grid/list toggle. Both grid (`GuestCard.js`) and list (`GuestList.js`) drawers include an editable Seat Number field (see Seating below); the list table also has a Seat column.
- `/admin/invites` — invite management, ceremony/reception filter, grid/list toggle, QR generation
- `/admin/seating` — table of seats 1–60 in order, showing which ceremony guest (if any) occupies each seat, plus their dietary/allergy info. Click any row to open a modal: assign an unseated ceremony guest to an empty seat, or remove the current occupant from a filled one. See Seating section below.
- `/admin/rooms` — room management, assign guests to rooms
- `/admin/comms` — rich text email composer, send to all guests with email
- `/admin/reports` — dessert + evening meal choice breakdowns (ring progress), plus a song requests table
- `/admin/info` — "single source of truth" page for the venue/registrar/suppliers (see `wedding_info` above)
- `/admin/layout.js` — wraps all admin in `<Navbar>` + Mantine `<Container>`

### Guest-facing (no auth, public)
- `/` — simple landing: "10.10.26 / Please scan your invite to RSVP"
- `/invite/[id]` — invite landing page (rustic theme)
  - Hero: `guestHero.jpg` from `/public/images/`, 5% black overlay, text-shadows for legibility
  - Shows all guests on invite as clickable cards → `/guest/[guestId]?from=[inviteId]`
  - Completed guests show green "Attending/Not attending" badge, no link
- `/guest/[id]?from=[inviteId]` — multi-step RSVP form, routes to correct form based on `attendanceType`
  - If `hasCheckedIn=true` → server redirects back to `/invite/[from]`
  - **Ceremony** (`RsvpForm.js`): 6 steps — Attending Y/N → Meal → Evening Meal → Dietary → Song request → Email → redirect to invite
    - Starter: "Rustic Antipasti Sharing Boards" (fixed), Main: "Spanish Inspired Tapas Feast" (fixed), Dessert: Baked Vanilla Cheesecake or Sticky Toffee Pudding, Evening Meal: Hog Roast or Vegetarian/Vegan
  - **Reception** (`RsvpFormReception.js`): 4 steps — Attending Y/N → Evening Meal → Dietary/allergies → Email → redirect to invite
  - Declining stops at step 1 for both forms

## Seating (`/admin/seating`)
- `app/admin/seating/page.js` — server component, fetches all guests and passes them to `SeatingTable`
- `components/admin/seating/SeatingTable.js` — `'use client'`, does the seat-map computation and renders the table + assign/remove modal
- **Important Next.js/Turbopack gotcha**: Mantine's compound `Table` subcomponents (`Table.Thead`, `Table.Tr`, `Table.Td`, `Table.ScrollContainer`, etc.) resolve to `undefined` if used directly inside an async Server Component — the static properties don't survive the server→client boundary. Every table in this app (`GuestList.js`, `InviteList.js`, `RoomList.js`, `SeatingTable.js`) follows the same split: a thin server `page.js` fetches data and hands it as props to a `'use client'` component that does the actual Mantine `Table` rendering. Don't render Mantine `Table.*` subcomponents directly from a `page.js`.
- Only guests with `attendanceType === 'ceremony'` are offered in the "assign a guest" dropdown, since reception-only guests aren't seated.
- Seat numbers outside 1–60 (free text, typos) are excluded from the seat grid and surfaced in a warning banner instead of silently disappearing.

## Admin Dashboard (`/admin`)
Three component files:
- `components/admin/dashboard/RouteCards.js` — navigation cards
- `components/admin/dashboard/StatCards.js` — all stat/info cards
- `components/admin/dashboard/RecentRsvps.js` — latest 5 RSVP submissions

**StatCards layout (top to bottom):**
1. Row 1 (2 cols): Total Guests (with ceremony/reception split inside card) | RSVPs Received (ring progress + count)
2. Row 2 (3 cols): Attending (green) | Declined (red) | Awaiting Response (orange)
3. Ceremony Guests section — Attending | Declined | Awaiting + Hoops Made (teal) | Hoops Still Needed (yellow)
4. Reception Only Guests section — Attending | Declined | Awaiting
- Ceremony uses burgundy accent, Reception uses violet accent

All stat data derived from `fetchAllGuests()` in the page — no extra DB calls.

## Server actions (`actions/`)

**guestActions.js**: fetchAllGuests, fetchGuestById, createGuest, toggleGuestHoop, updateGuestSeatNumber, deleteGuest, submitGuestRsvp, submitReceptionRsvp, fetchSongRequests
- `submitGuestRsvp(id, {attending, dessert, eveningMeal, dietry, allergies, songRequest, email})` — ceremony RSVP
- `submitReceptionRsvp(id, {attending, eveningMeal, dietry, allergies, email})` — reception RSVP
- `updateGuestSeatNumber(id, seatNumber)` — validates the seat isn't already taken by another guest before writing; returns `{ error: { message } }` naming the conflicting guest if so. Empty string clears the seat.

**inviteActions.js**: fetchAllInvites, fetchInviteById, createInvite, updateInvite, deleteInvite, addGuestToInvite, generateQRCode, generateAllQRCodes, deleteQRCode
- QR base URL: `process.env.NEXT_PUBLIC_BASE_URL || window.location.origin`
- `generateAllQRCodes(baseUrl)` — labels all QR codes with invite name; JSZip used client-side for "Download All QR Codes"

**roomActions.js**: fetchAllRooms, createRoom, updateRoom, addGuestToRoom, deleteRoom

**emailActions.js**: fetchGuestsWithEmail, sendEmailToAllGuests, sendEmailToGuest, sendTestEmail, sendRsvpNotification
- `sendRsvpNotification(guest)` — fires on every RSVP submission, sends to tom_canham@yahoo.co.uk + samanthabettany20@gmail.com. Error is caught+logged but never blocks the RSVP save.

**authActions.js**: Login, Logout

**infoActions.js**: fetchWeddingInfo/updateWeddingInfo (singleton), plus fetch/create/update/delete (and move, for orderable lists) for: djSetlists, bridalParty, groomsmen, aisleWalkOrder, speechOrder, canapes, daytimeChecklist, suppliers — backs `/admin/info`

## Key env vars (`.env`)
- `NEXT_PUBLIC_BASE_URL` — set per environment. MUST be set before `npm run build` — baked in at build time
- `DB_MYSQL` — local dev database connection string (used by `npm run dev` and `drizzle-kit push` by default)
- `PRODUCTION_DB` — live production database connection string — different host port/user than dev. Not used automatically; see "Databases" section above for how to push schema changes to it
- `SETUP_TOKEN` — enables the one-time `/setup` page for creating the first admin user
- `SITE_UNLOCK_TOKEN`, `SITE_UNLOCK_COOKIE` — admin session cookie name and value
- `SMTP_*` — IONOS SMTP credentials
- `NEXT_PUBLIC_TEST_EMAIL` — test email recipient for comms page

## Deployment notes
- `NEXT_PUBLIC_BASE_URL` is baked in at build time — set it before running `npm run build`, not after
- No hardcoded URLs anywhere in the codebase — all use env var with `window.location.origin` fallback
- After changing env vars, must rebuild (`npm run build`) for `NEXT_PUBLIC_*` vars to take effect
- Schema changes need pushing to BOTH databases separately — `npm run db:push` only hits dev (`DB_MYSQL`). See "Databases" section above for the production push command. Always push dev first, verify the feature works, then push production.
- A thin red "Development Site" banner (`components/layout/DevBanner.js`) renders at the top of every page automatically whenever `NODE_ENV === 'development'` (i.e. `npm run dev`) — no action needed, it just won't appear in production builds.

## Styling conventions
- Admin: Mantine components throughout, CSS variables for theme colours
  - `--custom-theme-heading: #49080c` (dark burgundy)
  - `--custom-theme-text: #721f14` (red-brown)
  - `--custom-theme-fill: #E9DDCD` (warm cream)
  - `--custom-theme-background: #f7faf9`
- Guest-facing: CSS Modules, NO Mantine, rustic farmhouse palette
  - Background: `#f5efe6`, cards: `#fdf8f0`, borders: `#d9c9b0`, footer band: `#ede2d0`
  - Accent: `#721f14` / `#49080c`
  - Text body: `#3a2a1a`, muted: `#7a6248`, labels: `#9a7e5e`

## Known quirks / gotchas
- `fetchAllGuests` catch block returns `data: []` on error — error details in `error.message`
- `hasCheckedIn` field name implies physical check-in but is actually used as RSVP submitted lock
- `db:push` not `db:migrate` — schema changes go directly to whichever DB `DB_MYSQL` currently points at
- Hoops only apply to ceremony guests — reception guests have `hoop` field but it's never surfaced in UI
- Next.js 16 uses `proxy.js` not `middleware.js` for route protection — if both exist you get a build error. Auth route guard lives in `proxy.js` only.
- Mantine `Table.*` compound components break when rendered directly from an async Server Component — see Seating section above

## /admin/guests behaviour
- Guest creation split into two buttons: "Add Ceremony Guest" and "Add Reception Guest" — each pre-sets `attendanceType`, no dropdown in modal
- Small coloured orb shown per guest (grid cards + list rows) — green = on an invite, grey = not on any invite
- Guest drawer (`GuestCard.js` grid, `GuestList.js` list) — card-based layout: status grid, Seat Number (editable TextInput + Save, with inline uniqueness error), Contact, Menu, Dietary, Song Request, Actions
- `toggleGuestHoop` and `updateGuestSeatNumber` both call `router.refresh()` after saving so rows/cards update without manual reload

## /admin/invites behaviour
- Invite creation split into two buttons: "Create Ceremony Invite" (filled) and "Create Reception Invite" (outlined)
- Guests already assigned to any invite are hidden from ALL guest dropdowns (create and edit) — a guest can only be on one invite at a time
- "Download All QR Codes" button zips all invites that have a generated QR into `qr-codes.zip` using JSZip

## Scripts (`scripts/`)
- `scripts/create-user.js` — interactive prompt to create an admin user (email + password)
- `scripts/seed-guests.js` — seeds 50 fake guests with completed RSVPs into the dev DB, requires typing `yes` to confirm

## Not yet built
- Guest-facing room assignment view
- Awaiting response list (who specifically hasn't responded)
- Meal/dietary breakdown cards on dashboard (available as full breakdown on `/admin/reports` instead)
- Visual/floor-plan seating layout (current `/admin/seating` is a flat 1–60 table, not a visual room map)
