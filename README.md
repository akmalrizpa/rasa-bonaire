# Rasa Bonaire

Web preorder makanan: pembeli pilih menu → atur varian dan jumlah → pilih slot batch →
bayar (disimulasikan) → dapat halaman status + invoice → admin kelola pesanan dari dashboard.

Next.js 15 (App Router) + TypeScript + Tailwind v4. Isi website full bahasa Inggris, karena
kliennya di Bonaire.

## Jalanin di lokal

Butuh Node.js 20 atau lebih baru (`node -v`).

```bash
npm install
npm run dev
```

Buka http://localhost:3000.

Dependensi dan `node_modules` sudah saya pasang, jadi `npm run dev` bisa langsung jalan.
Kalau mau mulai dari nol di komputer lain: `npm install` dulu.

Perintah lain:

```bash
npm run build      # build produksi
npm run typecheck  # cek TypeScript
```

## Login demo

Semua akun demo memakai username sebagai password.

| Username | Password | Masuk sebagai |
| --- | --- | --- |
| `admin` | `admin` | Admin dapur: dashboard, antrean pesanan, menu, pelanggan, pengaturan |
| `user` | `user` | Pelanggan: riwayat preorder, invoice, alamat |
| `daan` | `daan` | Pelanggan (contoh pesanan lain untuk dashboard admin) |
| `sofie` | `sofie` | Pelanggan |

Pelanggan juga bisa daftar sendiri lewat `/register`.

## Alur yang bisa dicoba

1. `/` → beranda, hitung mundur tutup batch, menu paling banyak dipesan.
2. `/menu` → filter kategori, cari, urutkan. Klik satu hidangan → `/menu/[slug]`.
3. Pilih level sambal, porsi, tambahan, jumlah, catatan → masukkan ke cart (drawer di kanan).
4. `/cart` → cek isi, lalu `/checkout`.
5. `/checkout` → data kontak, pickup atau delivery (zona + alamat), pilih slot batch, metode
   bayar, kode promo `RASA10` (10% dari $20) atau `PICKUP5` ($5 dari $30). Harga dihitung ulang
   di server, angka dari browser tidak dipercaya.
6. `/pay/[ref]` → halaman pembayaran simulasi: QRIS (QR palsu yang dibuat dari nomor pesanan),
   transfer bank (nomor VA), e-wallet, atau tunai di kasir. Tombol "I have paid" menandai lunas
   dan membuat nomor invoice.
7. `/orders/[ref]` → timeline status yang ikut berubah (polling 5 detik) + `/orders/[ref]/invoice`
   yang bisa dicetak.
8. Login sebagai `admin` → `/admin` untuk KPI, antrean dapur, dan ubah status pesanan
   (Waiting → Confirmed → Cooking → Ready → Handed over).

## Database

Ada dua mode, otomatis menyesuaikan isi `.env.local`.

**Mode demo (default, tanpa `SUPABASE_URL`).** Menu, akun dan pesanan disimpan di memori server
dan ditulis juga ke `localStorage` browser untuk cart. Semua fitur jalan, tapi ada batasnya:
pesanan reset setiap server dev di-restart, dan di Vercel tiap request bisa mendarat di instance
berbeda, jadi pesanan (dan akun hasil daftar sendiri) bisa hilang. Empat akun demo tetap bisa
login karena id-nya diturunkan dari username, bukan acak. Untuk data yang benar-benar awet,
pakai Supabase.

**Mode Supabase (gratis, disarankan kalau mau data awet).**

1. Daftar di https://supabase.com → New project (region Singapore paling dekat).
2. Buka SQL Editor → New query → tempel seluruh isi `supabase/schema.sql` → Run.
3. Buka Project Settings → API → copy **Project URL** dan **service_role** key.
4. Buat file `.env.local` (contoh ada di `.env.example`) dan isi:
   ```
   SUPABASE_URL="https://xxxx.supabase.co"
   SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOi..."
   SESSION_SECRET="tulis-string-acak-panjang"
   ```
5. `npm run dev` lagi. Menu dan akun demo otomatis ter-seed saat request pertama.

Catatan keamanan: `service_role` key hanya dipakai di server, jangan pernah diberi awalan
`NEXT_PUBLIC_`. RLS aktif di semua tabel; anon key hanya bisa membaca menu.

## Deploy ke Vercel

1. `git init` (kalau belum) lalu commit dan push ke GitHub.
2. Di https://vercel.com → Add New Project → import repo-nya. Framework terdeteksi otomatis.
3. Isi Environment Variables: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SESSION_SECRET`.
   Lewati langkah ini kalau mau tetap mode demo.
4. Deploy. Setiap `git push` berikutnya otomatis ikut ter-deploy.

```bash
git add -A
git commit -m "feat: add rasa bonaire preorder store"
git push
```

## Isi kontennya di mana

| Yang mau diubah | File |
| --- | --- |
| Menu, varian, harga, hidangan sold out | `src/data/catalog.ts` |
| Alamat, telepon, jam buka, zona kirim, cerita dapur, review, FAQ | `src/data/shop.ts` |
| Akun demo | `src/data/accounts.ts` |
| Warna, font, radius, animasi | `src/app/globals.css` |
| Kode promo | `src/lib/pricing.ts` |
| Slot batch dan jam tutup preorder | `src/lib/slots.ts` |

## Struktur singkat

```
src/app          halaman (beranda, menu, cart, checkout, pay, orders, login, account, admin)
src/app/api      endpoint polling status pesanan
src/actions      server action: login, register, pesanan, admin
src/components   UI, cart drawer, item picker, panel pembayaran, komponen admin
src/data         konten statis: katalog, info toko, akun demo
src/lib          store (Supabase / memori), harga, slot, auth, uang
supabase         schema.sql
```

## Yang masih simulasi

- Payment gateway: tidak ada uang yang berpindah. Alur, nomor VA, QR dan status dibuat sendiri
  supaya bisa diuji tanpa akun pihak ketiga. Kalau nanti mau sungguhan, ganti `payOrderAction`
  dengan panggilan ke Midtrans/Xendit/Mollie dan tambahkan webhook.
- Email konfirmasi belum dikirim; invoice tersedia sebagai halaman yang bisa dicetak.
- Belum ada: pembatalan pesanan oleh pelanggan, pengembalian dana, laporan ekspor CSV.
