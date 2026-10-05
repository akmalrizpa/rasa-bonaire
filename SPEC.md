# 🍛 RASA BONAIRE — SPEC LENGKAP & CHANGELOG

**Last updated**: 6 Oktober 2026
**Status**: LIVE & PRODUCTION-READY (mode Supabase)
**Versi spec**: 1.0
**Lokasi project**: `D:\projects\rasa-bonaire`
**Repo**: https://github.com/akmalrizpa/rasa-bonaire (branch `main`)

Dokumen ini ditulis supaya pekerjaan bisa dilanjutkan di chat/sesi baru tanpa kehilangan konteks.
Baca dari atas ke bawah; bagian 16 (gotcha) dan 19 (cara lanjut) adalah yang paling sering dibutuhkan.

---

## 🌐 LINK PENTING

| Platform | URL | Akses |
| --- | --- | --- |
| Website live | https://rasa-bonaire.vercel.app | Public |
| GitHub repo | https://github.com/akmalrizpa/rasa-bonaire | Developer |
| Vercel dashboard | https://vercel.com/dashboard | Developer |
| Supabase dashboard | https://supabase.com/dashboard | Developer |
| Supabase project | https://ateuegaecmljaibkejri.supabase.co | Developer |

---

## 🔑 KREDENSIAL & ENV

**Akun demo (sengaja ditampilkan di halaman login, WAJIB diganti kalau dipakai betulan):**

| Username | Password | Role |
| --- | --- | --- |
| `admin` | `admin` | admin (dashboard dapur) |
| `user` | `user` | customer |
| `daan` | `daan` | customer |
| `sofie` | `sofie` | customer |

**Environment variables** (nama saja — nilainya ada di `.env.local` lokal dan di Vercel → Settings → Environment Variables):

| Name | Isi | Rahasia? |
| --- | --- | --- |
| `SUPABASE_URL` | `https://ateuegaecmljaibkejri.supabase.co` | tidak |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role key dari Supabase → Settings → API | **YA** |
| `SESSION_SECRET` | string acak panjang untuk menandatangani cookie login | **YA** |

Aturan yang tidak boleh dilanggar:

- `SUPABASE_SERVICE_ROLE_KEY` **hanya** dipakai di server. Jangan pernah memberi awalan `NEXT_PUBLIC_`.
- Kode fallback `SUPABASE_URL` juga membaca `NEXT_PUBLIC_SUPABASE_URL` (kalau suatu saat pakai integrasi Vercel–Supabase), tapi service role key hanya dari nama `SUPABASE_SERVICE_ROLE_KEY`.
- `.env.local` sudah masuk `.gitignore`. Jangan commit.
- Tanpa dua env Supabase, aplikasi otomatis jalan di **mode demo** (data di memori server, lihat bagian 6).

---

## 🛠️ TECH STACK (versi terpasang)

| Bagian | Teknologi | Versi |
| --- | --- | --- |
| Framework | Next.js (App Router, webpack) | 15.5.27 |
| UI | React | 19.3.0 |
| Bahasa | TypeScript (strict) | 5.9.3 |
| Styling | Tailwind CSS v4 + `@tailwindcss/postcss` | 4.3.3 |
| Database | Supabase Postgres via `@supabase/supabase-js` | 2.117.2 |
| Font | `next/font/google`: Fraunces (display) + Inter (body) | — |
| Runtime lokal | Node.js | 24.21.0 |
| Deploy | Vercel (auto-deploy dari GitHub) | — |

Tidak ada dependency lain. Ikon, logo, dan ilustrasi hidangan semuanya SVG yang ditulis sendiri
(`Icons.tsx`, `Logo.tsx`, `DishArt.tsx`) — sengaja tanpa library ikon.

---

## 📄 STRUKTUR FILE

```
rasa-bonaire/
├── .env.example                 contoh env (aman di-commit)
├── .env.local                   nilai asli — JANGAN commit (gitignored)
├── .gitignore                   node_modules, .next, .env*, *.tsbuildinfo
├── next.config.ts               reactStrictMode, poweredByHeader off
├── postcss.config.mjs           plugin @tailwindcss/postcss
├── tsconfig.json                path alias @/* → src/*, strict
├── vercel.json                  security headers (nosniff, X-Frame-Options, Referrer-Policy, Permissions-Policy)
├── package.json                 script: dev / build / start / typecheck
├── README.md                    panduan singkat (bahasa Indonesia)
├── SPEC.md                      dokumen ini
├── HANDOVER.md                  ringkasan serah terima (bahasa Inggris)
├── supabase/
│   └── schema.sql               DDL 5 tabel + index + RLS (jalankan sekali di SQL Editor)
└── src/
    ├── app/
    │   ├── layout.tsx           root layout: font, metadata, viewport, Header + Footer, currentUser()
    │   ├── globals.css          design token (@theme) + keyframes animasi + aturan print
    │   ├── page.tsx             beranda (hero, countdown, kategori, terlaris, cerita, timeline, review)
    │   ├── loading.tsx          skeleton beranda
    │   ├── error.tsx            error boundary ("Something burned in the pass")
    │   ├── not-found.tsx        404
    │   ├── icon.svg             favicon (logo mark)
    │   ├── menu/page.tsx        daftar menu: filter kategori, cari, urutkan
    │   ├── menu/[slug]/page.tsx detail hidangan + generateMetadata + "Goes well with"
    │   ├── cart/page.tsx        keranjang
    │   ├── checkout/page.tsx    checkout (kontak, pickup/delivery, slot, metode bayar, promo)
    │   ├── pay/[ref]/page.tsx   halaman pembayaran simulasi
    │   ├── orders/page.tsx      daftar preorder milik user (login wajib)
    │   ├── orders/[ref]/page.tsx        pelacakan status (polling 5 detik)
    │   ├── orders/[ref]/invoice/page.tsx invoice yang bisa dicetak
    │   ├── login/page.tsx, register/page.tsx, account/page.tsx
    │   ├── about/page.tsx       cara kerja, timeline harian, FAQ, kontak
    │   ├── api/orders/[ref]/status/route.ts   JSON status untuk polling
    │   └── admin/
    │       ├── layout.tsx       guard requireAdmin + sidebar/strip navigasi
    │       ├── page.tsx         dashboard: KPI, grafik 7 hari, top 5, antrean dapur
    │       ├── orders/page.tsx  papan pesanan (filter, cari, ubah status)
    │       ├── menu/page.tsx    editor menu (harga, badge, sold out, tambah hidangan)
    │       ├── customers/page.tsx  daftar akun + total belanja + ubah role
    │       └── settings/page.tsx   pengaturan toko (buka/tutup, ongkir, pengumuman)
    ├── actions/                 server action ("use server")
    │   ├── auth.ts              login, register, logout, updateProfile (+ rate limit login)
    │   ├── orders.ts            placeOrder, payOrder, failPayment (+ rate limit checkout)
    │   └── admin.ts             setOrderStatus, updateDish, createDish, saveSettings, setUserRole
    ├── components/
    │   ├── AppProviders.tsx     cart + toast provider (localStorage `rasa.cart.v1`, fly-to-cart)
    │   ├── Header.tsx           header sticky + strip pengumuman + countdown + menu akun + drawer
    │   ├── CartDrawer.tsx       drawer keranjang
    │   ├── CartView.tsx         isi halaman /cart
    │   ├── CheckoutForm.tsx     form checkout + sidebar ringkasan + bar bayar (mobile)
    │   ├── PaymentPanel.tsx     panel pembayaran simulasi (QRIS/VA/e-wallet/tunai)
    │   ├── OrderTracker.tsx     timeline status + polling
    │   ├── ItemPicker.tsx       pilihan sambal/porsi/tambahan + bar "Add to preorder" (mobile)
    │   ├── ProductCard.tsx      kartu hidangan + quick add
    │   ├── FilterBar.tsx        pencarian, sort, chip kategori (URL search param)
    │   ├── OrderTracker, StatusPill, Countdown, DishArt, Icons, Logo, Footer, PrintButton
    │   ├── useNearBottom.ts     hook: sembunyikan bar bawah saat sudah di ujung halaman
    │   └── admin/               AdminNav, OrdersBoard, MenuEditor, CustomerTable, SettingsForm
    ├── data/
    │   ├── catalog.ts           18 hidangan + 6 kategori + opsi/varian + harga (USD cents)
    │   ├── shop.ts              alamat, telepon, jam buka, zona kirim, cerita, review, FAQ
    │   └── accounts.ts          4 akun demo + DEFAULT_SETTINGS
    └── lib/
        ├── types.ts             semua tipe + ORDER_STATUS_FLOW + label status
        ├── store.ts             lapisan data: Supabase ↔ memori (mode demo) + seeding + statistik
        ├── orders.ts            buildOrder(): validasi & hitung ulang pesanan dari input browser
        ├── pricing.ts           priceLine, cartTotals, promo, tarif per zona
        ├── slots.ts             slot batch, jam tutup preorder, zona waktu Bonaire
        ├── auth.ts              cookie sesi (HMAC), requireUser/requireAdmin, toPublicUser
        ├── passwords.ts         scrypt hash + verify
        ├── money.ts             formatMoney / formatDateTime / formatDay (USD, America/Kralendijk)
        ├── ids.ts               orderRef (RB-XXXXX), randomId, invoiceNumber
        └── passwords.ts         scrypt (lihat juga lib/auth.ts untuk sesi)
```

Total ±66 file sumber. Ukuran bundle: First Load JS 103 kB (shared) + halaman 106–117 kB.

---

## 🗄️ DATABASE

Skema lengkap ada di `supabase/schema.sql` dan **idempoten** (aman dijalankan berulang).
5 tabel, semua RLS aktif:

| Tabel | Isi | Kolom penting |
| --- | --- | --- |
| `categories` | kategori menu | `id`, `name`, `blurb`, `sort` |
| `products` | hidangan + varian | `id`, `slug` (unique), `category_id`, `name`, `description`, `price_cents`, `unit`, `art`, `badge`, `prep_minutes`, `rating`, `sold`, `sold_out`, `is_active`, `option_groups` (jsonb) |
| `users` | akun | `id`, `username` (unique), `name`, `email`, `phone`, `role` (`admin`/`customer`), `password_hash`, `created_at` |
| `orders` | pesanan | `id`, `ref` (unique), `user_id`, data pelanggan, `fulfilment`, `address`, `zone`, `slot`, `service_date`, `items` (jsonb), `subtotal_cents`, `delivery_cents`, `discount_cents`, `total_cents`, `promo_code`, `payment_method`, `payment_status`, `paid_at`, `status`, `invoice_no`, `events` (jsonb), `created_at`, `updated_at` |
| `settings` | pengaturan toko | `key` (`store`), `value` (jsonb: `storeOpen`, `announcement`, `deliveryFeeCents`, `freeDeliveryFromCents`, `pickupAddress`, `prepNote`) — **camelCase**, lihat gotcha #2 |

Index: `orders(user_id)`, `orders(status)`, `orders(created_at desc)`, `products(category_id)`.
RLS: `select` publik hanya untuk `categories` dan `products`; `users`, `orders`, `settings` tertutup
total (hanya service role dari server yang bisa baca/tulis).

**Seeding otomatis.** Saat request pertama, `ensureSeeded()` di `src/lib/store.ts`:
kalau tabel `products` kosong → insert 6 kategori + 18 hidangan + 4 akun demo (password = username)
+ baris settings. Jadi tidak ada langkah seed manual.

**Mode demo (tanpa `SUPABASE_URL`).** Data disimpan di `globalThis.__rasaMemory`:
katalog dari `src/data/catalog.ts`, akun dari `src/data/accounts.ts` dengan **id deterministik**
(`u-admin`, `u-user`, …) supaya cookie login tetap valid di instance serverless dengan memori berbeda.
Konsekuensi yang perlu diingat: pesanan dan akun hasil `/register` tidak awet antar instance.

---

## 🗺️ ROUTE MAP

| Route | Akses | Fungsi |
| --- | --- | --- |
| `/` | publik | Beranda: hero + countdown tutup batch, chip kategori, 6 terlaris, cerita dapur, timeline harian, review, jam buka |
| `/menu` | publik | Daftar menu; `?category=`, `?q=`, `?sort=popular\|price-asc\|price-desc\|quick` |
| `/menu/[slug]` | publik | Detail hidangan, varian, catatan dapur, "Goes well with" |
| `/cart` | publik | Keranjang (isi dari localStorage) |
| `/checkout` | publik | Kontak, pickup/delivery + zona, slot batch, metode bayar, promo |
| `/pay/[ref]` | publik (punya link) | Pembayaran simulasi sesuai metode |
| `/orders` | login | Daftar preorder milik user |
| `/orders/[ref]` | pemilik / admin / siapa pun yang punya ref pesanan tamu | Pelacakan status + event log |
| `/orders/[ref]/invoice` | idem | Invoice siap cetak (window.print) |
| `/login`, `/register` | publik | Auth |
| `/account` | login | Profil + ringkasan + daftar preorder |
| `/about` | publik | Cara kerja, "what we do not do", FAQ, kontak |
| `/admin` | admin | KPI (omzet hari ini, pesanan, antrean, rata-rata), grafik 7 hari, top 5, live queue |
| `/admin/orders` | admin | Papan pesanan: tab status, cari ref/nama/telepon, detail expand, tombol ubah status, auto-refresh 20s |
| `/admin/menu` | admin | Editor: harga, prep, badge, sold out, aktif, tambah hidangan |
| `/admin/customers` | admin | Akun: role, jumlah pesanan, total belanja |
| `/admin/settings` | admin | Buka/tutup dapur, pengumuman, ongkir, ambang gratis ongkir, alamat, catatan dapur |
| `/api/orders/[ref]/status` | publik | JSON `{status, paymentStatus, slot, events}` untuk polling |

Semua halaman data memakai `export const dynamic = "force-dynamic"`.

---

## 🔄 ALUR TRANSAKSI (end-to-end)

1. **Pilih hidangan** — `ItemPicker` mengumpulkan `optionIds` + qty + catatan. Total dihitung pakai
   `priceLine()` dari `@/lib/pricing` (fungsi yang sama dipakai server), lalu masuk ke cart
   (`localStorage` key `rasa.cart.v1`) dan drawer terbuka.
2. **Checkout** — `CheckoutForm` mengirim form ke server action `placeOrderAction`.
   Yang dikirim ke server **hanya** `{productId, qty, optionIds, note}` per baris + data kontak,
   zona, slot, promo, metode bayar. **Tidak ada nominal uang yang dikirim dari browser.**
3. **Validasi & hitung ulang di server** — `buildOrder()` di `src/lib/orders.ts`:
   cek `storeOpen`, panjang nama, nomor telepon, format email, alamat untuk delivery, zona,
   slot harus ada dan cocok dengan jenis fulfilment, produk harus aktif dan tidak sold out,
   lalu `cartTotals()` menghitung subtotal + ongkir (per zona, gratis di atas ambang) − diskon.
   Kalau ada yang gagal → pesan error manusiawi, tidak ada pesanan dibuat.
4. **Pesanan disimpan** dengan `status: "pending"`, `paymentStatus: "unpaid"`, event pertama tercatat,
   lalu redirect ke `/pay/[ref]`.
5. **Pembayaran simulasi** — `PaymentPanel` menampilkan panel sesuai metode:
   - `qris`: QR 21×21 yang digenerate deterministik dari hash `ref` + payload + countdown 15 menit
   - `bank_transfer`: nomor VA turunan hash ref, nama pemilik, nominal, tombol copy
   - `ewallet`: "Rasa Pay" dengan saldo + animasi cek saldo 3 detik
   - `cash`: instruksi bayar di kasir (pesanan tetap ditahan)
6. **Tandai lunas** — `payOrderAction`: `paymentStatus = paid`, `paidAt`, `status = confirmed`,
   `invoiceNo = INV-<tahun>-<urut>`, dua event baru (payment + status).
   Tombol "Something went wrong" memanggil `failPaymentAction` → `paymentStatus = failed`.
   Kalau countdown habis: state "expired" sopan, tanpa sukses palsu.
7. **Pelacakan** — `/orders/[ref]` polling `/api/orders/[ref]/status` tiap 5 detik
   (berhenti saat tab tidak aktif), menampilkan timeline `ORDER_STATUS_FLOW`.
8. **Dapur** — admin mengubah status dari `/admin/orders`: `pending → confirmed → cooking → ready → completed`
   (atau `cancelled`). Setiap perubahan menambah satu event dan langsung tampil di sisi pelanggan.
9. **Invoice** — `/orders/[ref]/invoice`, tombol cetak (`PrintButton`), elemen `no-print`.

---

## 💵 ATURAN HARGA & PROMO

- Semua uang disimpan sebagai **integer USD cents** dan ditampilkan lewat `formatMoney()` → `$16.50`.
- Harga dasar + tambahan opsi dihitung `priceLine()`; grup `required` tanpa pilihan = error,
  `single` dobel = error, `multi` melebihi `max` = error. Batas qty 1–20, maksimum 30 baris.
- Kode promo (`src/lib/pricing.ts`):

| Kode | Efek | Minimum |
| --- | --- | --- |
| `RASA10` | potongan 10% subtotal | $20 |
| `PICKUP5` | potongan $5 | $30 |

- Ongkir: per zona dari `shop.serviceZones` (Kralendijk $3.50, Nikiboko/Tera Kora $4.50,
  Hato/Sabadeco $6.50, Rincon $7.50), **gratis** kalau subtotal ≥ `freeDeliveryFromCents` (default $35).
- Tidak ada PPN/tax line — Bonaire tidak memungut PPN seperti Belanda, dan ini toko demo.

---

## ⏰ SLOT BATCH & WAKTU

Logika di `src/lib/slots.ts`, memakai zona waktu `America/Kralendijk` (UTC−4, tanpa DST):

- **Tutup preorder 15:00** (`shop.preorderClosesAt`). Sebelum 15:00 → batch hari ini;
  lewat 15:00 → batch hari berikutnya.
- **Senin & Selasa tutup.** `serviceDate()` otomatis melompat ke hari buka berikutnya.
- **Slot 30 menit**: hari kerja 17:00–20:30, akhir pekan 12:00–20:30.
  Pickup dan delivery punya daftar slot terpisah (`pickup-<menit>` / `delivery-<menit>`),
  delivery mulai 30 menit setelah pickup pertama.
- Slot divalidasi ulang di server saat checkout: `findSlot(slot)` + jenisnya harus sama dengan `fulfilment`.
- Header & beranda menampilkan countdown ke `closesAt()` (`Countdown` client component).

---

## 🔐 AUTH & KEAMANAN

- **Password**: scrypt (`node:crypto`), format `scrypt$<salt>$<hash>`, verifikasi `timingSafeEqual`.
- **Sesi**: cookie `rb_session` = `base64url({sub, exp}).HMAC-SHA256` dengan `SESSION_SECRET`;
  `httpOnly`, `sameSite=lax`, `secure` saat produksi, umur 7 hari (`src/lib/auth.ts`).
- **Guard**: `requireUser(next)` dan `requireAdmin()` — redirect ke `/login?next=…` (hanya
  menerima path yang diawali `/` dan bukan `//`), customer yang membuka `/admin` diarahkan ke `/account?denied=1`.
- **Rate limit** in-memory: login 8 percobaan / 5 menit per username; register 8 / 5 menit;
  checkout 6 pesanan / 10 menit per nomor telepon.
- **Tidak ada data sensitif di client**: `listUsers()` di `/admin/customers` dipetakan lewat
  `toPublicUser()` sebelum dikirim ke komponen, jadi `password_hash` tidak pernah sampai ke browser.
- **Kunci rahasia** hanya di server (service role) — tidak ada `NEXT_PUBLIC_*` untuk rahasia.
- **Header keamanan** di `vercel.json`; `X-Powered-By` dimatikan di `next.config.ts`.
- Mutasi lewat **server action** (Next memvalidasi origin), jadi tidak ada endpoint POST terbuka.
- Yang belum ada: verifikasi email, reset password, 2FA, honeypot di checkout (rate limit dipakai sebagai gantinya).

---

## 🎨 DESAIN & ATURAN MOBILE

Token ada di `src/app/globals.css` (`@theme`):

| Token | Nilai | Dipakai untuk |
| --- | --- | --- |
| `--color-sand` | `#faf6ef` | latar halaman |
| `--color-shell` | `#ffffff` | kartu |
| `--color-ink` / `ink-soft` / `muted` | `#191713` / `#3f3a33` / `#6e655a` | teks |
| `--color-line` | `#e7dfd1` | border |
| `--color-accent` / `accent-dark` / `accent-soft` | `#bc3a24` / `#9a2c19` / `#fbeae4` | satu-satunya warna aksen (sambal) |
| `--color-sea` / `sea-soft` | `#10495a` / `#e6eff1` | info, dipakai hemat |
| `--color-ok`, `--color-warn` | `#2e6b4a`, `#9c6210` | status |
| `--radius-card` | `12px` | satu nilai radius untuk semua |
| `--shadow-lift`, `--shadow-pop` | — | kartu & elemen mengambang |

- Font: **Fraunces** (`font-display`, judul) + **Inter** (`font-sans`, isi). Maksimum dua typeface.
- Animasi (semuanya punya alasan, dan mati saat `prefers-reduced-motion`):
  `animate-steam` (uap di beranda), `animate-ring` (langkah aktif di timeline pesanan),
  `animate-drawer`/`animate-scrim` (drawer cart), `animate-pop` (badge cart), `animate-rise` (toast/panel),
  `skeleton` (loading). Fly-to-cart memakai Web Animations API di `AppProviders`.
- Larangan yang dipegang: tanpa gradient, glow, glassmorphism, dark mode neon, teks gradient,
  emoji di UI, dan tanpa `rounded-3xl`/`shadow-lg` di semua kartu.
- **Mobile** (perbaikan 6 Okt 2026, lihat gotcha #4):
  - Field form `text-base` (16px) di HP → iOS tidak auto-zoom saat mengetuk input.
  - Bar aksi menempel di bawah layar: "Add to preorder" (`ItemPicker`) dan "Pay … and lock the slot"
    (`CheckoutForm`), dan otomatis menyingkir saat sudah di ujung halaman (`useNearBottom`).
  - `viewport-fit=cover` + padding `env(safe-area-inset-*)` di header, drawer, bar bawah, toast.
  - Target sentuh tombol qty ≥ 36px di HP, tombol Add 40px, chip kategori lebih tinggi.
  - Subtitle logo disembunyikan di bawah `sm`, judul logo mengecil, `min-w-0` di mana-mana agar
    tidak ada elemen yang memaksa halaman lebih lebar dari layar.
- Judul & metadata: `metadata` di `src/app/layout.tsx` (title template, description, openGraph),
  `viewport` (themeColor `#faf6ef`).

---

## 🧑‍🍳 FITUR ADMIN

| Halaman | Yang bisa dilakukan |
| --- | --- |
| `/admin` | Lihat omzet hari ini, jumlah pesanan, antrean aktif, rata-rata nilai pesanan, grafik 7 hari, 5 hidangan terlaris, antrean dapur (pesanan lunas yang belum selesai) + umur pesanan |
| `/admin/orders` | Tab filter status + jumlah, cari ref/nama/telepon, buka detail (item + opsi + catatan, alamat/jemput, kontak, rincian total, metode bayar, seluruh event log), ubah status, refresh manual / otomatis 20 detik |
| `/admin/menu` | Filter kategori + cari, ubah harga (dolar), prep minutes, badge, toggle sold out, toggle tampil, tombol simpan per baris, form "Add a dish" |
| `/admin/customers` | Ringkasan akun, ubah role admin/customer (admin terakhir tidak bisa diturunkan), jumlah pesanan & total belanja per akun |
| `/admin/settings` | Buka/tutup dapur (kalau tutup, checkout ditolak dengan pesan), pengumuman, ongkir, ambang gratis ongkir, alamat jemput, catatan dapur |

Catatan: `createDishAction` membuat hidangan tanpa varian (`optionGroups: []`). Untuk varian
(sambal/porsi/tambahan), tambahkan di `src/data/catalog.ts` lalu sinkronkan ke DB.

---

## 🚀 CARA JALANIN LOKAL & DEPLOY

Lokal:

```powershell
cd D:\projects\rasa-bonaire
npm install          # sudah pernah dijalankan
npm run dev          # http://localhost:3000
npm run typecheck    # tsc --noEmit
npm run build        # build produksi
```

Deploy (dari nol):

1. Push ke GitHub (`git push`), Vercel import repo, framework terdeteksi otomatis.
2. Buat project Supabase → SQL Editor → tempel `supabase/schema.sql` → Run.
3. Supabase → Settings → API → copy Project URL + `service_role` key.
4. Vercel → Settings → Environment Variables → `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`,
   `SESSION_SECRET` (centang Production + Preview + Development) → Save → Redeploy.
5. Opsional tapi disarankan: Settings → Functions → Region = **Singapore (sin1)** supaya fungsi
   tidak beda benua dengan database.
6. Setelah deploy, request pertama menyemai katalog & akun demo otomatis.

Alur kerja harian: edit → `git add -A` → `git commit -m "fix: ..."` (Conventional Commits, bahasa Inggris,
huruf kecil) → `git push` → Vercel auto-deploy. **Agen tidak pernah push**; commit lokal boleh,
push selalu dilakukan user.

---

## ✅ VERIFIKASI YANG SUDAH DILAKUKAN

| Tanggal | Yang diuji | Cara | Hasil |
| --- | --- | --- | --- |
| 5 Okt 2026 | Type check & build produksi | `npx tsc --noEmit`, `npm run build` | 0 error, 21 route |
| 5 Okt 2026 | Logika pesanan vs Supabase asli | route sementara `/api/dev-check` (sudah dihapus) | login admin/admin lolos, password salah ditolak, 18 produk + 4 akun ter-seed, pesanan tersimpan → lunas → invoice `INV-…` → statistik benar, total `2× rendang(medium+telur) + 1× sate(pedas+lontong)` = $59.50 − 10% = **$53.55** |
| 5 Okt 2026 | Mode demo | idem tanpa `.env` | semua langkah sama, data di memori |
| 6 Okt 2026 | Layout HP memakai Chrome headless (puppeteer-core) | ukur `document.documentElement.scrollWidth` di 390/360/320px | semula **455px** (beranda) & **439px** (halaman lain) → sekarang **tepat sama** dengan lebar layar di `/`, `/menu`, `/menu/[slug]`, `/cart`, `/checkout`, `/login`, `/about` |
| 6 Okt 2026 | Screenshot visual HP 390×844 | Chrome headless, CSS dipastikan termuat | Kartu menu, chip kategori, bar bawah, drawer cart, checkout, footer semua rapi |

Kalau butuh mengulang pengukuran mobile: pakai Chrome/Edge headless (tanpa menambah dependency ke
project) — script kecil `puppeteer-core` di folder temp, `page.setViewport({width: 390, isMobile: true})`,
lalu baca `scrollWidth` dan cari elemen dengan `getBoundingClientRect().right > innerWidth`.
**Penting**: pastikan CSS benar-benar termuat dengan mengecek `getComputedStyle(document.body).backgroundColor`
= `rgb(250, 246, 239)` sebelum mengukur, kalau tidak hasilnya menyesatkan (lihat gotcha #1).

---

## ⚠️ GOTCHA / PELAJARAN DARI SESI SEBELUMNYA

1. **Jangan `next build` saat ada `next start`/`next dev` yang jalan.** `.next` dipakai bersama →
   CSS hilang / `Cannot find module './vendor-chunks/…'` / HTTP 500. Urutannya:
   matikan server → hapus `.next` → `npm run build` → `next start`.
2. **`settings.value` disimpan camelCase** (`storeOpen`, `deliveryFeeCents`, …), bukan snake_case.
   `toSettings()` sekarang membaca camelCase (dengan fallback snake_case). Gejala kalau salah:
   dapur selalu dianggap tutup sehingga **semua checkout ditolak** di mode Supabase.
3. **Id akun demo harus deterministik** (`u-admin`), bukan acak — kalau acak, login mental di Vercel
   karena setiap instance serverless punya memori sendiri.
4. **`min-w-0` wajib** di flex/grid item yang berisi konten panjang (main, logo, kartu). Tanpa itu
   item membesar mengikuti konten dan seluruh halaman jadi lebih lebar dari layar HP.
   Ini akar masalah "tampilan tidak center" yang dilaporkan user.
5. **`redirect()` di server component balas HTTP 200** berisi meta-refresh + RSC payload, bukan 307.
   Jadi jangan menguji guard hanya dari kode status.
6. **Server action yang mengembalikan nilai tidak bisa dipakai langsung sebagai `action={…}`**
   pada `<form>` (TS2322). Pakai `useActionState` + adapter, seperti di komponen admin.
7. **Jangan taruh `SUPABASE_SERVICE_ROLE_KEY` dengan awalan `NEXT_PUBLIC_`** dan jangan commit `.env.local`.
8. `output: "standalone"` tidak dipakai; Vercel menangani build Next biasa.
9. Angka uang **selalu integer cents**; input harga di UI admin (dolar) dikonversi `Math.round(Number(x) * 100)`.
10. Setelah menambah halaman baru, jalankan `npm run build` — halaman tanpa `dynamic = "force-dynamic"`
    bisa ikut di-prerender saat build dan membekukan data.

---

## 📌 YANG BELUM ADA (BACKLOG, urut prioritas)

1. **Pembayaran sungguhan** — ganti `payOrderAction` dengan Midtrans/Xendit/Mollie + webhook
   (verifikasi status dengan memanggil API gateway, jangan percaya isi webhook).
2. **Email/WhatsApp konfirmasi** — Resend (email) atau WA Business API; invoice sekarang hanya halaman HTML.
3. **Ganti password demo** + hapus akun `daan`/`sofie`, dan set `SESSION_SECRET` produksi.
4. **Reset password & verifikasi email** untuk pelanggan.
5. **Pembatalan/refund oleh pelanggan** dan pembatasan waktu pembatalan.
6. **Laporan**: ekspor CSV pesanan, rekap harian/bulanan, cetak dapur per batch.
7. **Manajemen varian dari UI admin** (sekarang varian ikut didefinisikan di `src/data/catalog.ts`).
8. **Gambar hidangan asli** — sekarang memakai ilustrasi SVG (`DishArt.tsx`).
9. **Multi-bahasa (NL/EN)** kalau nanti dipakai klien di Bonaire; sekarang full Inggris.
10. **PWA/offline** dan halaman `/faq` terpisah (sekarang FAQ ada di `/about`).

---

## 📜 CHANGELOG

| Commit | Tanggal | Isi |
| --- | --- | --- |
| `ea6fbce` | 5 Okt 2026 | `feat: add rasa bonaire preorder storefront with admin dashboard` — seluruh toko: beranda, menu, cart, checkout, pembayaran simulasi, pelacakan pesanan, invoice, auth, dashboard admin, skema Supabase, README |
| `ce1aad6` | 5 Okt 2026 | `fix: keep demo account ids stable across serverless instances` — perbaikan login di Vercel |
| `88df6b1` | 5 Okt 2026 | `fix: read store settings from the jsonb row in supabase mode` — dapur selalu dianggap tutup di mode Supabase |
| `3273dcf` | 5 Okt 2026 | `feat: tighten the layout for phones and touch input` — field 16px, bar aksi bawah, target sentuh, safe-area |
| `95cf27e` | 6 Okt 2026 | `fix: stop the mobile layout from overflowing the viewport` — `min-w-0` pada main/logo/kartu, logo responsif, bar menyingkir di ujung halaman |

---

## 🔁 CARA LANJUT DI CHAT BARU

Tempel blok ini sebagai pesan pertama di sesi baru:

```
Lanjutkan project Rasa Bonaire di D:\projects\rasa-bonaire (Next.js 15 App Router + TS + Tailwind v4 +
Supabase). Baca dulu SPEC.md di root project, lalu README.md. Repo: github.com/akmalrizpa/rasa-bonaire,
branch main, sudah live di Vercel dengan Supabase. Konvensi: konten website full bahasa Inggris, obrolan
dengan saya bahasa Indonesia santai; uang selalu integer USD cents; server action untuk semua mutasi;
harga selalu dihitung ulang di server. Jangan pernah push (saya yang push), jangan build saat dev server
jalan, dan jangan pernah menaruh service role key di kode client.

Tugas saya: <tulis di sini>
```

Checklist singkat untuk sesi baru sebelum mengubah apa pun:

1. `cd D:\projects\rasa-bonaire && git status` — pastikan tidak ada perubahan yang belum di-commit.
2. `npm run dev` (port 3000) untuk melihat hasil; `.env.local` sudah menunjuk Supabase yang sama.
3. Kalau menyentuh layout: uji juga di lebar 390/360/320px (bagian "Verifikasi" di atas).
4. Selesai mengubah: `npx tsc --noEmit` → `npm run build` → commit kecil dengan Conventional Commits.
