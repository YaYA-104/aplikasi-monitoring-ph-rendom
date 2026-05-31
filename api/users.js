import { getRequestContext } from './_supabaseAdmin.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ ok: false, message: 'Gunakan method GET.' });
  }

  try {
    const context = await getRequestContext(req);

    if (!context.ok) {
      return res.status(context.status).json({ ok: false, message: context.message });
    }

    const { supabase, user, profile } = context;

    if (profile?.role !== 'admin') {
      const ownProfile = profile || {
        id: user.id,
        full_name: user.user_metadata?.full_name || user.email,
        email: user.email,
        role: 'user',
        created_at: user.created_at
      };

      return res.status(200).json({
        ok: true,
        total: 1,
        users: [ownProfile],
        scope: 'self'
      });
    }

    const countQuery = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true });

    if (countQuery.error) throw countQuery.error;

    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, role, created_at, updated_at')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw error;

    return res.status(200).json({
      ok: true,
      total: countQuery.count || 0,
      users: data || [],
      scope: 'admin'
    });
  } catch (error) {
    return res.status(500).json({ ok: false, message: error.message || 'Terjadi kesalahan server.' });
  }
}
