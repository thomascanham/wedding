# Wedding Guest Management App

Tom (developer/groom) & Sam (bride). Wedding date: 10/10/26. Rustic farmhouse venue.

## Stack
- Next.js 16 (App Router), React 19
- Mantine v8 (admin UI only)
- Drizzle ORM + MySQL (remote host: 87.106.110.142:3306)
- Nodemailer via IONOS SMTP (`donnington@tomcanham.co.uk`)
- `drizzle-kit push` for schema changes — NO migration files, just edit schema.js and run `npm run db:push`
- Playfair Display (headings) + Raleway (body) — both loaded via next/font/google in root layout

## Auth
- Admin protected by httpOnly cookie (`SITE_UNLOCK_COOKIE` env var)
- Login checks username against PocketBase (legacy) + compares passcode to `SITE_PASSCODE` env var
- Cookie valid 30 days. Auth logic in `actions/authActions.js`
- PocketBase still referenced in authActions for username lookup but all data is MySQL/Drizzle

## Database schema (`db/schema.js`)
Four tables:

**guests** — id(uuid), firstname, surname, name, attendanceType, rsvpStatus, hasCheckedIn(bool), hoop(bool), phone, email, starter, main, dessert, dietry(text), allergies(text), songRequest(varchar500), created, updated
- `hoop` = embroidery hoop made for that guest (ceremony guests only)
- `hasCheckedIn` = RSVP submitted lock (true = submitted, can't re-submit)
- `rsvpStatus` = 'attending' | 'declined' | null
- `attendanceType` = 'ceremony' | 'reception'

**invites** — id(uuid), name, attendance('ceremony'|'reception'), sent(bool), qr_svg(text), created, updated
- QR codes stored as SVG strings in db
- QR url format: `${NEXT_PUBLIC_BASE_URL}/invite/${inviteId}`

**invite_guests** — invite_id, guest_id (join table, cascade delete)

**rooms** — id, name, description, block, capacity(int), created, updated

**room_guests** — room_id, guest_id (join table, cascade delete)

Enrichment pattern: both invites and rooms use an `enrichWithGuests()` helper returning:
`{ ...record, guest: [guestId, ...], expand: { guest: [fullGuestObj, ...] } }`

## Routes

### Admin (`/admin/*`) — Mantine UI, protected
- `/admin` — dashboard (stat cards, recent RSVPs, route nav cards)
- `/admin/guests` — guest list, filters by attendanceType/hoop, grid/list toggle
- `/admin/invites` — invite management, ceremony/reception filter, grid/list toggle, QR generation
- `/admin/rooms` — room management, assign guests to rooms
- `/admin/comms` — rich text email composer, send to all guests with email
- `/admin/layout.js` — wraps all admin in `<Navbar>` + Mantine `<Container>`

### Guest-facing (no auth, public)
- `/` — simple landing page
- `/invite/[id]` — invite landing page (rustic CSS Modules theme)
  - Hero image: `/public/images/guestHero.jpg`, 5% black overlay, text-shadows for legibility
  - Lists all guests on invite as clickable cards → `/guest/[guestId]?from=[inviteId]`
  - Completed guests show attending/declined badge, no link
- `/guest/[id]?from=[inviteId]` — multi-step RSVP form
  - Server redirects to `/invite/[from]` if already submitted
  - Ceremony steps: 1) Attending Y/N → 2) Meal → 3) Dietary → 4) Song request → 5) Email
  - Starter: "Antipasto Board" (fixed), Main: "Spanish Style Tapas" (fixed)
  - Dessert choice: Baked Vanilla Cheesecake OR Sticky Toffee Pudding with Custard
  - Reception-only RSVP form NOT YET BUILT

## Admin Dashboard components
- `components/admin/dashboard/StatCards.js` — all stat cards
- `components/admin/dashboard/RecentRsvps.js` — latest 5 RSVP submissions
- `components/admin/dashboard/RouteCards.js` — navigation cards

StatCards layout:
1. Row 1 (2 cols): Total Guests (w/ ceremony/reception split) | RSVPs Received (ring progress)
2. Row 2 (3 cols): Attending | Declined | Awaiting Response
3. Ceremony section: Attending | Declined | Awaiting + Hoops Made | Hoops Still Needed
4. Reception section: Attending | Declined | Awaiting
- 48px gap between top rows and each attendance section

## Server actions (`actions/`)
- `guestActions.js` — fetchAllGuests, fetchGuestById, createGuest, toggleGuestHoop, deleteGuest, submitGuestRsvp
- `inviteActions.js` — fetchAllInvites, fetchInviteById, createInvite, updateInvite, deleteInvite, addGuestToInvite, generateQRCode, generateAllQRCodes, deleteQRCode
- `roomActions.js` — fetchAllRooms, createRoom, updateRoom, addGuestToRoom, deleteRoom
- `emailActions.js` — fetchGuestsWithEmail, sendEmailToAllGuests, sendEmailToGuest, sendTestEmail, sendRsvpNotification
- `authActions.js` — Login, Logout

`sendRsvpNotification(guest)` fires on every RSVP, sends to tom_canham@yahoo.co.uk + samanthabettany20@gmail.com. Failure never blocks the RSVP save.

## Key env vars
- `NEXT_PUBLIC_BASE_URL` — set per environment, baked in at build time — MUST be set before `npm run build`
- `DB_MYSQL` — full mysql connection string
- `SITE_PASSCODE`, `SITE_UNLOCK_TOKEN`, `SITE_UNLOCK_COOKIE` — admin auth
- `SMTP_*` — IONOS SMTP credentials
- `NEXT_PUBLIC_TEST_EMAIL` — test email recipient

## Deployment
- No hardcoded URLs in codebase — all use `NEXT_PUBLIC_BASE_URL` with `window.location.origin` fallback
- After changing env vars, must rebuild for `NEXT_PUBLIC_*` vars to take effect

## Styling conventions
- Admin: Mantine components, CSS variables: `--custom-theme-heading: #49080c`, `--custom-theme-text: #721f14`, `--custom-theme-fill: #E9DDCD`
- Guest-facing: CSS Modules only, NO Mantine. Palette: bg `#f5efe6`, cards `#fdf8f0`, borders `#d9c9b0`, accent `#721f14`

## Known quirks
- `fetchAllGuests` catch block returns `data: error.message` string instead of `[]` — minor bug
- `authActions.js` still hits PocketBase for username lookup — legacy, everything else is Drizzle
- InviteManager create form shows ALL guests in dropdown (intentional fix — filtering caused empty dropdown bug)
- `hasCheckedIn` is used as RSVP lock, not physical event check-in despite the name
- Hoops only apply to ceremony guests — never surfaced in UI for reception guests

## Not yet built
- Reception-only RSVP form
- Guest-facing room assignment view
- Awaiting response list (who specifically hasn't responded)
- Meal/dietary breakdown on dashboard
- Song requests list on dashboard
