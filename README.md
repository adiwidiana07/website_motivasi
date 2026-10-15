# Stay Here

Tempat yang tenang untuk berhenti sejenak: kata-kata harian, permainan kecil,
dan musik latar. Versi baru ini adalah aplikasi React modern dengan desain
editorial dan perpustakaan kutipan yang bisa kamu kelola dari panel admin —
disimpan di Supabase.

## Teknologi

- **Vite + React + TypeScript**
- **Tailwind CSS v4** — token desain kustom (paper / ink / persimmon)
- **Supabase** — Postgres + Auth + Row Level Security
- **Font**: Fraunces (display, dengan sumbu *opsz*) + Inter (UI), di-*host* sendiri via Fontsource
- Tanpa state library ekstra — semua CRUD langsung lewat `supabase-js`

## Menjalankan lokal

```bash
npm install
npm run dev        # http://localhost:5173
```

Situs tetap berjalan **sebelum** Supabase disiapkan: kutipan memakai daftar
bawaan di `src/data/quotes.seed.js`, dan `/admin` menampilkan checklist setup.

## Setup Supabase (± 5 menit, sekali saja)

1. **Buat project** di [supabase.com/dashboard](https://supabase.com/dashboard).
   Pilih region terdekat (Singapore bagus untuk Indonesia).
2. **Salin kredensial**: `cp .env.example .env.local`, lalu isi dari
   *Project Settings → API Keys*:

   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...
   ```

   Restart `npm run dev` setelah mengubah `.env.local`.
3. **Buat tabel**: buka *SQL Editor → New query*, tempel seluruh isi
   `supabase/schema.sql`, lalu **Run**. Ini membuat tabel `quotes`, aturan
   keamanan (RLS), trigger `updated_at`, dan meng-*seed* 100 kutipan
   (Inggris + Indonesia).
4. **Buat akun admin**: *Authentication → Users → Add user* — isi email dan
   password. Itu login untuk `/admin`.
5. **Matikan pendaftaran publik**: *Authentication → Sign In / Providers* →
   nonaktifkan *Allow new users to sign up*. Hanya akunmu yang bisa menulis.

## Skrip

| Perintah          | Fungsi                                                    |
| ----------------- | --------------------------------------------------------- |
| `npm run dev`     | Dev server                                                |
| `npm run build`   | Type-check + build produksi ke `dist/`                    |
| `npm run preview` | Lihat hasil build secara lokal                            |
| `npm run seed`    | Regenerasi `supabase/schema.sql` dari data kutipan bawaan |

## Mengelola kutipan

- Buka `/admin` → login dengan akun Supabase Auth kamu.
- Fitur: cari, filter tag/status, buat, edit (EN + ID), terbitkan/*draft*,
  hapus dengan konfirmasi.
- Keamanan: pengunjung anonim hanya bisa **membaca** kutipan yang *published*;
  semua operasi tulis hanya untuk pengguna yang login (RLS).
- "Kata hari ini" bersifat deterministik — semua pengunjung melihat kutipan
  yang sama sepanjang hari.

## Mengubah kutipan bawaan

Edit `src/data/quotes.seed.js` (satu tempat saja), lalu:

```bash
npm run seed   # menulis ulang supabase/schema.sql
```

Jalankan ulang `supabase/schema.sql` di SQL Editor. Seed hanya memasukkan data
saat tabel masih kosong, jadi data produksimu tidak akan tertimpa.

## Struktur

```
src/
  components/   Layout (nav, footer, player bar), PlayerProvider, Reveal, ikon
  data/         quotes.seed.js — sumber data kutipan (EN/ID/tags)
  lib/          supabase client, quotes (fetch + CRUD), i18n, hooks, tracks
  pages/        Home, Daily, Games, Breathe, OneThought, GentleChoice, Music, Admin, NotFound
  styles/       index.css — token desain, komponen, grain
supabase/
  schema.sql    tempel ke SQL Editor (skema + RLS + seed)
scripts/
  generate-seed.mjs
public/
  music/        calm-1.mp3, calm-2.mp3, calm-3.mp3
  favicon.svg, _redirects
legacy/         versi lama situs (HTML statis) — arsip, tidak dipakai
```

## Deploy

Build command: `npm run build` · Output: `dist`

- **Netlify** — `netlify.toml` sudah berisi build, redirect URL lama
  (`/daily.html` → `/daily`, dst.) dan SPA fallback. Tinggal hubungkan repo.
- **Vercel** — `vercel.json` sudah disiapkan untuk hal yang sama.
- **Cloudflare Pages** — memakai `public/_redirects` yang ikut ter-*build*.

Jangan lupa menambahkan environment variable `VITE_SUPABASE_URL` dan
`VITE_SUPABASE_ANON_KEY` di dashboard hosting. Anon key aman untuk publik —
yang melindungi data adalah Row Level Security.
