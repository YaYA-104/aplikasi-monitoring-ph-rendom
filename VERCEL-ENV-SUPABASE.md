# Vercel Environment Variables - Supabase

Masukkan variable berikut di:

`Vercel Dashboard > Project > Settings > Environment Variables`

## Wajib untuk login/register

```env
SUPABASE_URL="https://jxobnhmxdtdikgpngquj.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4b2JuaG14ZHRkaWtncG5ncXVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAxOTMxNjgsImV4cCI6MjA5NTc2OTE2OH0.0jXIny2lF3NPIdpOXqz8DqfzWHna-f_gf8jaCp2j8EQ"
SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4b2JuaG14ZHRkaWtncG5ncXVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAxOTMxNjgsImV4cCI6MjA5NTc2OTE2OH0.0jXIny2lF3NPIdpOXqz8DqfzWHna-f_gf8jaCp2j8EQ"
```

## Opsional untuk admin tambah akun dari dashboard

Butuh key rahasia dari Supabase. Jangan simpan di GitHub.

```env
SUPABASE_SECRET_KEY="PASTE_SB_SECRET_KEY_DI_SINI"
```

Jika project masih memakai legacy key, gunakan:

```env
SUPABASE_SERVICE_ROLE_KEY="PASTE_SERVICE_ROLE_KEY_DI_SINI"
```

## SQL yang perlu dijalankan

Jalankan file ini di Supabase SQL Editor:

`database/schema-supabase.sql`

Jika pernah muncul error `column "user_id" does not exist`, jalankan juga:

`database/fix-missing-user-id.sql`
