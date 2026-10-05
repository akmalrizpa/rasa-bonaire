# 📦 Handover Document — Rasa Bonaire

**Project**: Food preorder storefront + kitchen dashboard (demo store)
**Brand**: Rasa Bonaire — Indonesian kitchen, island hours
**Location**: Kaya Grandi 24, Kralendijk, Bonaire (fictional address, used as content)
**Developer**: Akmal Rizky Pratama
**Date**: October 2026
**Version**: 1.0

For the technical deep dive (schema, routes, gotchas, backlog) read `SPEC.md`.
This file is the short version: what the site does, where the keys are, and how to keep it running.

---

## 🌐 IMPORTANT LINKS

| Platform | URL | Access |
| --- | --- | --- |
| Live website | https://rasa-bonaire.vercel.app | Public |
| GitHub repo | https://github.com/akmalrizpa/rasa-bonaire | Developer |
| Vercel dashboard | https://vercel.com/dashboard | Developer |
| Supabase dashboard | https://supabase.com/dashboard | Developer |
| Supabase project | https://ateuegaecmljaibkejri.supabase.co | Developer |

---

## 🔑 CREDENTIALS

**⚠️ Keep these safe. The demo logins are printed on the sign-in page on purpose.**

### Demo accounts (username = password)

| Username | Password | Role |
| --- | --- | --- |
| `admin` | `admin` | Kitchen admin — dashboard, order queue, menu, customers, settings |
| `user` | `user` | Customer — order history, invoice |
| `daan` | `daan` | Customer |
| `sofie` | `sofie` | Customer |

**Before this store takes real orders:** delete `daan` and `sofie`, change the two remaining
passwords, remove the demo credentials block from `src/components/AuthForms.tsx`, and rotate
`SESSION_SECRET`.

### Environment variables (Vercel → Settings → Environment Variables, and local `.env.local`)

| Name | Notes |
| --- | --- |
| `SUPABASE_URL` | `https://ateuegaecmljaibkejri.supabase.co` — not secret |
| `SUPABASE_SERVICE_ROLE_KEY` | **Secret.** Server only. Never prefix it with `NEXT_PUBLIC_` |
| `SESSION_SECRET` | **Secret.** Random string that signs the login cookie |

`.env.local` is git-ignored, so the keys never land in the repository. If a key ever leaks,
rotate it in Supabase → Settings → API.

---

## 🛠️ TECH STACK

- **Framework**: Next.js 15 (App Router) + React 19 + TypeScript (strict)
- **Styling**: Tailwind CSS v4, design tokens in `src/app/globals.css`
- **Fonts**: Fraunces (headings) + Inter (body) via `next/font/google`
- **Database**: Supabase Postgres (free plan is enough), schema in `supabase/schema.sql`
- **Auth**: own cookie sessions, scrypt password hashing, no third-party auth provider
- **Payments**: simulated (see below) — no gateway connected
- **Deployment**: Vercel, auto-deploy from `main`

No icon library, no component library, no payment SDK. Everything is hand-written, so there is
very little to update when a dependency releases a new version.

---

## 📄 PAGE STRUCTURE

| Page | URL | Function |
| --- | --- | --- |
| Home | `/` | Hero with countdown to the preorder cut-off, categories, six most preordered dishes, kitchen story, daily timeline, reviews, opening hours |
| Menu | `/menu` | All 18 dishes; filter by category, search, sort by popularity/price/prep time |
| Dish detail | `/menu/[slug]` | Description, sambal level, portion, extras, kitchen note, quantity |
| Cart | `/cart` | Lines with quantity steppers, promo code information, delivery fee note |
| Checkout | `/checkout` | Contact details, pickup or delivery (with zone), batch slot, payment method, promo code |
| Payment | `/pay/[ref]` | Simulated payment screen per method: QRIS QR, bank virtual account, e-wallet, cash |
| Order tracking | `/orders/[ref]` | Live status timeline (polls every 5 seconds) and event log |
| Invoice | `/orders/[ref]/invoice` | Printable receipt with invoice number |
| My preorders | `/orders` | Order history for the signed-in customer |
| Sign in / Register | `/login`, `/register` | Accounts |
| Account | `/account` | Profile, spend summary, recent preorders |
| How it works | `/about` | Preorder flow, what the kitchen does not do, FAQ, contact block |
| Kitchen dashboard | `/admin` | Revenue today, orders, active queue, 7-day chart, top dishes |
| Order board | `/admin/orders` | Filter by status, search, expand a row, change status, auto-refresh |
| Menu editor | `/admin/menu` | Price, prep time, badge, sold out, visibility, add a new dish |
| Customers | `/admin/customers` | Accounts, order counts, spend, role changes |
| Settings | `/admin/settings` | Open/close the kitchen, announcement, delivery fee, free-delivery threshold, pickup address |

---

## 🍽️ HOW THE PREORDER FLOW WORKS

1. The customer picks dishes in the morning. Preorder closes at **15:00** (Bonaire time, UTC−4).
2. They choose a 30-minute batch slot at checkout. Weekdays 17:00–20:30, weekends 12:00–20:30.
   The kitchen is closed Monday and Tuesday.
3. They pay (simulated) and the order is confirmed by the system.
4. The kitchen sees the order in `/admin`, marks it cooking, then ready.
5. The customer picks it up at Kaya Grandi 24 inside their slot, or it is delivered
   (Kralendijk $3.50, Nikiboko/Tera Kora $4.50, Hato/Sabadeco $6.50, Rincon $7.50;
   free above $35).
6. Both sides get an invoice number (`INV-2026-00001`) and the order page keeps a full event log.

Prices are **always recalculated on the server** from the database. The browser only sends product
ids, quantities and option ids, so a tampered cart cannot change what is charged.

### Promo codes

| Code | Effect | Minimum |
| --- | --- | --- |
| `RASA10` | 10% off the subtotal | $20 |
| `PICKUP5` | $5 off | $30 |

---

## ⚠️ WHAT IS SIMULATED

- **Payments.** No money moves. The QRIS QR code, the bank virtual account number and the e-wallet
  balance are generated from the order reference. The "I have paid" button is what marks an order
  paid. To go live, replace `payOrderAction` in `src/actions/orders.ts` with a real gateway call
  plus a webhook, and keep verifying the payment status against the gateway API.
- **Delivery.** No driver routing, no live tracking, no distance calculation.
- **Stock.** Dishes are either available or marked sold out by hand; there is no ingredient counting.
- **Photos.** Dishes use hand-drawn SVG illustrations, not photographs.

---

## 🚀 RUNNING IT

Locally:

```powershell
cd D:\projects\rasa-bonaire
npm install
npm run dev        # http://localhost:3000
```

`npm run build` for a production build, `npm run typecheck` to check TypeScript.

Deploying an update: commit and push. Vercel deploys automatically.

```powershell
git add -A
git commit -m "fix: ..."
git push
```

First-time setup on a fresh Supabase project: run `supabase/schema.sql` in the SQL Editor, add the
three environment variables in Vercel, then redeploy. The menu, the demo accounts and the default
settings are seeded automatically on the first request — there is no separate seed step.

---

## 🔧 MAINTENANCE NOTES

| Want to change | File |
| --- | --- |
| Dishes, variants, prices, sold-out state | `src/data/catalog.ts` (and the same rows in Supabase if already seeded) |
| Address, phone, opening hours, delivery zones, story, reviews, FAQ | `src/data/shop.ts` |
| Demo accounts | `src/data/accounts.ts` |
| Colours, fonts, radius, animations | `src/app/globals.css` |
| Preorder cut-off time, closed days, slot times | `src/lib/slots.ts` and `src/data/shop.ts` |
| Delivery fee, opening hours, announcement, open/closed | `/admin/settings` (no deploy needed) |

Day-to-day operations happen entirely in `/admin`: close the kitchen when the pans are empty, mark a
dish sold out, or bump a price. Those changes take effect immediately, without a deploy.

---

## 📋 KNOWN LIMITS

- A guest order (placed without signing in) can be opened by anyone who has the order reference.
  Signed-in orders are private to the owner and the admin.
- No password reset, no email verification, no email sending yet.
- Customers cannot cancel; an admin can only mark an order cancelled.
- Login and checkout rate limits are kept in server memory, so they reset when a serverless
  instance recycles.
