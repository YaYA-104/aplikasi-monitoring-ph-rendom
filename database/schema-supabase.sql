-- =========================================================
-- FIX SUPABASE ERROR 42703: column "user_id" does not exist
-- Soil Command Center / TerraPulse OS
--
-- Jalankan file ini di Supabase Dashboard -> SQL Editor.
-- File ini aman untuk tabel yang sudah terlanjur dibuat tanpa kolom user_id.
-- =========================================================

BEGIN;

-- Pastikan tabel profiles tersedia.
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT UNIQUE,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS full_name TEXT,
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user',
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'profiles_role_check'
      AND conrelid = 'public.profiles'::regclass
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_role_check
      CHECK (role IN ('admin', 'user'));
  END IF;
END;
$$;

CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- Pastikan tabel soil_readings tersedia.
-- Penyebab error sebelumnya: tabel sudah ada, tetapi dibuat tanpa kolom user_id.
-- CREATE TABLE IF NOT EXISTS tidak menambah kolom baru pada tabel lama.
CREATE TABLE IF NOT EXISTS public.soil_readings (
  id BIGSERIAL PRIMARY KEY
);

ALTER TABLE public.soil_readings
  ADD COLUMN IF NOT EXISTS user_id UUID,
  ADD COLUMN IF NOT EXISTS device_id TEXT DEFAULT 'ESP32-PH-01',
  ADD COLUMN IF NOT EXISTS location_name TEXT DEFAULT 'Lahan Pertanian A',
  ADD COLUMN IF NOT EXISTS ph_value NUMERIC(4, 2),
  ADD COLUMN IF NOT EXISTS soil_temperature_c NUMERIC(5, 2),
  ADD COLUMN IF NOT EXISTS soil_moisture_percent NUMERIC(5, 2),
  ADD COLUMN IF NOT EXISTS soil_status TEXT,
  ADD COLUMN IF NOT EXISTS battery_percent NUMERIC(5, 2),
  ADD COLUMN IF NOT EXISTS battery_voltage_v NUMERIC(4, 2),
  ADD COLUMN IF NOT EXISTS rssi_dbm INTEGER,
  ADD COLUMN IF NOT EXISTS reading_source TEXT DEFAULT 'Simulasi pembacaan sensor IoT ESP32',
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE public.soil_readings
  ALTER COLUMN user_id SET DEFAULT auth.uid(),
  ALTER COLUMN device_id SET DEFAULT 'ESP32-PH-01',
  ALTER COLUMN location_name SET DEFAULT 'Lahan Pertanian A',
  ALTER COLUMN reading_source SET DEFAULT 'Simulasi pembacaan sensor IoT ESP32',
  ALTER COLUMN metadata SET DEFAULT '{}'::jsonb,
  ALTER COLUMN created_at SET DEFAULT NOW();

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'soil_readings_user_id_fkey'
      AND conrelid = 'public.soil_readings'::regclass
  ) THEN
    ALTER TABLE public.soil_readings
      ADD CONSTRAINT soil_readings_user_id_fkey
      FOREIGN KEY (user_id)
      REFERENCES auth.users(id)
      ON DELETE CASCADE;
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'soil_readings_status_check'
      AND conrelid = 'public.soil_readings'::regclass
  ) THEN
    ALTER TABLE public.soil_readings
      ADD CONSTRAINT soil_readings_status_check
      CHECK (soil_status IN ('Asam', 'Netral', 'Basa'));
  END IF;
END;
$$;

CREATE INDEX IF NOT EXISTS idx_soil_readings_user_id ON public.soil_readings(user_id);
CREATE INDEX IF NOT EXISTS idx_soil_readings_created_at ON public.soil_readings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_soil_readings_device_id ON public.soil_readings(device_id);

-- Function untuk membuat profil otomatis saat user mendaftar melalui Supabase Auth.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NULLIF(NEW.raw_user_meta_data ->> 'full_name', ''), split_part(NEW.email, '@', 1)),
    NEW.email,
    'user'
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    updated_at = NOW();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- Row Level Security.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.soil_readings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "soil_readings_select_own" ON public.soil_readings;
DROP POLICY IF EXISTS "soil_readings_insert_own" ON public.soil_readings;
DROP POLICY IF EXISTS "soil_readings_delete_own" ON public.soil_readings;

CREATE POLICY "profiles_select_own"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "soil_readings_select_own"
ON public.soil_readings
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "soil_readings_insert_own"
ON public.soil_readings
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "soil_readings_delete_own"
ON public.soil_readings
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

COMMIT;

-- Setelah berhasil, jadikan akun pertama sebagai admin dengan mengganti email di bawah ini:
-- UPDATE public.profiles
-- SET role = 'admin'
-- WHERE email = 'email-bapak-ibu@example.com';
