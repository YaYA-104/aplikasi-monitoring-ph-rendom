# Soil Command Center

## Konfigurasi Supabase Project Ini

Project ini sudah disiapkan untuk Supabase URL:

```env
SUPABASE_URL="https://jxobnhmxdtdikgpngquj.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4b2JuaG14ZHRkaWtncG5ncXVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAxOTMxNjgsImV4cCI6MjA5NTc2OTE2OH0.0jXIny2lF3NPIdpOXqz8DqfzWHna-f_gf8jaCp2j8EQ"
SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4b2JuaG14ZHRkaWtncG5ncXVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAxOTMxNjgsImV4cCI6MjA5NTc2OTE2OH0.0jXIny2lF3NPIdpOXqz8DqfzWHna-f_gf8jaCp2j8EQ"
```

Untuk fitur admin tambah akun dari dashboard, tambahkan `SUPABASE_SECRET_KEY` atau `SUPABASE_SERVICE_ROLE_KEY` hanya di Vercel Environment Variables.
 - Supabase + Vercel

Aplikasi web dashboard monitoring pH tanah berbasis IoT dengan desain custom **TerraPulse / Soil Command Center**.

Fitur utama:

- Login memakai **Supabase Auth**.
- Daftar akun memakai **Supabase Auth**.
- Data profil akun tersimpan di tabel `public.profiles`.
- Admin dapat menambah akun dari dashboard melalui Vercel Serverless Function.
- Data simulasi sensor IoT dapat disimpan ke tabel `public.soil_readings`.
- Dashboard custom, bukan template umum.
- Siap upload ke GitHub dan deploy ke Vercel.

---

## 1. Buat Project Supabase

1. Login ke Supabase.
2. Klik **New project**.
3. Simpan informasi berikut dari **Project Settings > API**:
   - Project URL
   - publishable key / anon public key
   - secret key / service_role key

> Catatan keamanan: `secret key / service_role key` jangan ditulis di frontend dan jangan dipush ke GitHub. Key ini hanya disimpan di Environment Variables Vercel.

---

## 2. Jalankan SQL Database

Buka **Supabase Dashboard > SQL Editor**, lalu jalankan file:

```text
/database/schema-supabase.sql
```

File SQL ini membuat:

- tabel `profiles`
- trigger otomatis dari `auth.users` ke `profiles`
- tabel `soil_readings`
- Row Level Security untuk data user

---

## 3. Buat Akun Pertama

1. Deploy aplikasi atau jalankan lokal dengan `vercel dev`.
2. Buka halaman `register.html`.
3. Daftarkan akun pertama.
4. Jadikan akun pertama sebagai admin dengan SQL berikut di Supabase SQL Editor:

```sql
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'email-bapak-ibu@example.com';
```

Ganti email sesuai akun yang baru dibuat.

---

## 4. Environment Variables di Vercel

Masuk ke Vercel:

```text
Project > Settings > Environment Variables
```

Tambahkan:

```env
SUPABASE_URL="https://jxobnhmxdtdikgpngquj.supabase.co"
SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4b2JuaG14ZHRkaWtncG5ncXVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAxOTMxNjgsImV4cCI6MjA5NTc2OTE2OH0.0jXIny2lF3NPIdpOXqz8DqfzWHna-f_gf8jaCp2j8EQ"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4b2JuaG14ZHRkaWtncG5ncXVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAxOTMxNjgsImV4cCI6MjA5NTc2OTE2OH0.0jXIny2lF3NPIdpOXqz8DqfzWHna-f_gf8jaCp2j8EQ"
SUPABASE_SECRET_KEY="PASTE_SB_SECRET_KEY"
# atau legacy:
SUPABASE_SERVICE_ROLE_KEY="PASTE_SERVICE_ROLE_KEY"
```


---

## 4A. Key Supabase yang Sudah Diisi

Project ini sudah disiapkan agar bisa membaca key baru Supabase dengan nama:

```env
SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4b2JuaG14ZHRkaWtncG5ncXVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAxOTMxNjgsImV4cCI6MjA5NTc2OTE2OH0.0jXIny2lF3NPIdpOXqz8DqfzWHna-f_gf8jaCp2j8EQ"
```

Kode juga tetap mendukung nama lama `SUPABASE_ANON_KEY` agar kompatibel. Untuk fitur admin seperti tambah akun dari dashboard, tetap diperlukan `SUPABASE_SECRET_KEY` atau `SUPABASE_SERVICE_ROLE_KEY` di Vercel.

Lihat file `SUPABASE-KEY-SETUP.md` untuk langkah detail.

---

## 5. Upload ke GitHub

```bash
git init
git add .
git commit -m "Initial commit TerraPulse Supabase dashboard"
git branch -M main
git remote add origin https://github.com/USERNAME/NAMA-REPOSITORY.git
git push -u origin main
```

---

## 6. Deploy ke Vercel

1. Login ke Vercel.
2. Klik **Add New Project**.
3. Import repository GitHub.
4. Framework: **Other**.
5. Build command: kosongkan.
6. Output directory: kosongkan atau isi `.`.
7. Tambahkan Environment Variables.
8. Klik **Deploy**.

---

## 7. Catatan Supabase Auth

Untuk demo skripsi/prototype, agar register langsung bisa login:

1. Masuk Supabase.
2. Buka **Authentication > Providers > Email**.
3. Matikan **Confirm email**.

Jika Confirm email tetap aktif, user harus membuka email verifikasi dulu sebelum login.

---

## Struktur Folder

```text
soil-command-center-supabase-vercel/
├── api/
│   ├── _supabaseAdmin.js
│   ├── admin-create-user.js
│   ├── config.js
│   ├── health.js
│   └── users.js
├── database/
│   └── schema-supabase.sql
├── data-ph-iot-random.js
├── index.html
├── login.html
├── register.html
├── script.js
├── style.css
├── vercel.json
├── package.json
├── .env.example
├── .gitignore
└── .nojekyll
```

---

## Endpoint API

| Endpoint | Fungsi |
|---|---|
| `/api/config` | Mengirim Supabase URL dan anon key ke frontend |
| `/api/health` | Mengecek koneksi Supabase dan jumlah data |
| `/api/users` | Menampilkan daftar profil, admin melihat semua, user hanya dirinya |
| `/api/admin-create-user` | Admin membuat akun Supabase baru |

---

## Penting

Desain aplikasi ini dibuat custom untuk proyek monitoring pH tanah. Namun, tidak ada klaim mutlak bahwa tidak ada desain serupa di internet. Untuk kebutuhan karya ilmiah, gunakan istilah **desain custom/orisinal untuk penelitian ini**.

## Perbaikan error Supabase 42703 user_id

Jika SQL Editor menampilkan error `column "user_id" does not exist`, jalankan file:

```text
database/fix-missing-user-id.sql
```

Penyebabnya biasanya tabel `soil_readings` sudah pernah dibuat sebelumnya tanpa kolom `user_id`. Perintah `CREATE TABLE IF NOT EXISTS` tidak menambahkan kolom baru pada tabel yang sudah ada, sehingga perlu `ALTER TABLE ADD COLUMN IF NOT EXISTS`.
