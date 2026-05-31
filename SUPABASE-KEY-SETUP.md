# Setup Supabase Key untuk Vercel

Key yang diberikan:

```text
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4b2JuaG14ZHRkaWtncG5ncXVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAxOTMxNjgsImV4cCI6MjA5NTc2OTE2OH0.0jXIny2lF3NPIdpOXqz8DqfzWHna-f_gf8jaCp2j8EQ
```

Key tersebut adalah **publishable key**, jadi dipakai untuk konfigurasi frontend.

## Environment Variables Vercel minimal

Masuk ke:

```text
Vercel > Project > Settings > Environment Variables
```

Tambahkan:

```env
SUPABASE_URL="https://jxobnhmxdtdikgpngquj.supabase.co"
SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4b2JuaG14ZHRkaWtncG5ncXVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAxOTMxNjgsImV4cCI6MjA5NTc2OTE2OH0.0jXIny2lF3NPIdpOXqz8DqfzWHna-f_gf8jaCp2j8EQ"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4b2JuaG14ZHRkaWtncG5ncXVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAxOTMxNjgsImV4cCI6MjA5NTc2OTE2OH0.0jXIny2lF3NPIdpOXqz8DqfzWHna-f_gf8jaCp2j8EQ"
```

Ganti `https://jxobnhmxdtdikgpngquj.supabase.co` dengan URL project Supabase Bapak/Ibu.

## Untuk fitur tambah akun dari dashboard admin

Tambahkan juga salah satu dari key berikut:

```env
SUPABASE_SECRET_KEY="PASTE_SB_SECRET_KEY_DI_SINI"
```

atau jika project masih memakai legacy key:

```env
SUPABASE_SERVICE_ROLE_KEY="PASTE_SERVICE_ROLE_KEY_LEGACY_DI_SINI"
```

Jangan menaruh `SUPABASE_SECRET_KEY` atau `SUPABASE_SERVICE_ROLE_KEY` di frontend, GitHub publik, `script.js`, atau HTML.

## Letak Project URL Supabase

Ambil dari:

```text
Supabase Dashboard > Project Settings > API > Project URL
```

Formatnya seperti:

```text
https://xxxxxxxxxxxxxxxxxxxx.supabase.co
```

## Local testing

Copy file `.env.local.example` menjadi `.env.local`, lalu isi `SUPABASE_URL` dan secret key jika diperlukan.

```bash
cp .env.local.example .env.local
vercel dev
```
