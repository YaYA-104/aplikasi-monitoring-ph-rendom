import { getRequestContext } from './_supabaseAdmin.js';

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, message: 'Gunakan method POST.' });
  }

  try {
    const context = await getRequestContext(req);

    if (!context.ok) {
      return res.status(context.status).json({ ok: false, message: context.message });
    }

    if (context.profile?.role !== 'admin') {
      return res.status(403).json({
        ok: false,
        message: 'Hanya akun dengan role admin yang boleh menambah akun dari dashboard.'
      });
    }

    const { full_name, email, password, role } = req.body || {};
    const cleanName = String(full_name || '').trim();
    const cleanEmail = String(email || '').trim().toLowerCase();
    const cleanPassword = String(password || '');
    const cleanRole = String(role || 'user').trim() === 'admin' ? 'admin' : 'user';

    if (cleanName.length < 3) {
      return res.status(400).json({ ok: false, message: 'Nama minimal 3 karakter.' });
    }

    if (!isEmail(cleanEmail)) {
      return res.status(400).json({ ok: false, message: 'Format email tidak valid.' });
    }

    if (cleanPassword.length < 6) {
      return res.status(400).json({ ok: false, message: 'Password minimal 6 karakter.' });
    }

    const { supabase } = context;
    const created = await supabase.auth.admin.createUser({
      email: cleanEmail,
      password: cleanPassword,
      email_confirm: true,
      user_metadata: {
        full_name: cleanName
      }
    });

    if (created.error) {
      return res.status(409).json({ ok: false, message: created.error.message });
    }

    const user = created.data.user;

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        full_name: cleanName,
        email: cleanEmail,
        role: cleanRole,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' })
      .select('id, full_name, email, role, created_at, updated_at')
      .single();

    if (profileError) throw profileError;

    return res.status(201).json({
      ok: true,
      message: 'Akun berhasil dibuat di Supabase Auth dan profiles.',
      user: profile
    });
  } catch (error) {
    return res.status(500).json({ ok: false, message: error.message || 'Terjadi kesalahan server.' });
  }
}
