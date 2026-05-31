import { createClient } from '@supabase/supabase-js';

const FALLBACK_SUPABASE_URL = 'https://jxobnhmxdtdikgpngquj.supabase.co';
const FALLBACK_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4b2JuaG14ZHRkaWtncG5ncXVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAxOTMxNjgsImV4cCI6MjA5NTc2OTE2OH0.0jXIny2lF3NPIdpOXqz8DqfzWHna-f_gf8jaCp2j8EQ';


export function getSupabaseUrl() {
  return process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_SUPABASE_URL;
}

export function getSupabasePublishableKey() {
  return (
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    FALLBACK_SUPABASE_ANON_KEY
  );
}

export function getSupabaseSecretKey() {
  return (
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export function getAdminClient() {
  const url = getSupabaseUrl();
  const secretKey = getSupabaseSecretKey();

  if (!url || !secretKey) {
    throw new Error('SUPABASE_URL dan SUPABASE_SECRET_KEY / SUPABASE_SERVICE_ROLE_KEY wajib diatur di Environment Variables Vercel untuk fitur admin.');
  }

  return createClient(url, secretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

export function getPublicConfig() {
  const url = getSupabaseUrl();
  const publishableKey = getSupabasePublishableKey();

  if (!url || !publishableKey) {
    throw new Error('SUPABASE_URL dan SUPABASE_PUBLISHABLE_KEY wajib diatur di Environment Variables Vercel.');
  }

  return {
    supabaseUrl: url,
    supabaseAnonKey: publishableKey
  };
}

export function readBearerToken(req) {
  const header = req.headers.authorization || req.headers.Authorization || '';
  if (!header.startsWith('Bearer ')) return null;
  return header.slice(7);
}

export async function getRequestContext(req) {
  const token = readBearerToken(req);

  if (!token) {
    return {
      ok: false,
      status: 401,
      message: 'Token Supabase tidak ditemukan. Login ulang terlebih dahulu.'
    };
  }

  const supabase = getAdminClient();
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data?.user) {
    return {
      ok: false,
      status: 401,
      message: 'Sesi Supabase tidak valid atau sudah berakhir.'
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, full_name, email, role, created_at, updated_at')
    .eq('id', data.user.id)
    .maybeSingle();

  if (profileError) {
    return {
      ok: false,
      status: 500,
      message: profileError.message
    };
  }

  return {
    ok: true,
    supabase,
    user: data.user,
    profile
  };
}
