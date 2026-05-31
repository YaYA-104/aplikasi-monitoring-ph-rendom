import { getAdminClient } from './_supabaseAdmin.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ ok: false, message: 'Gunakan method GET.' });
  }

  try {
    const supabase = getAdminClient();

    const profiles = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true });

    if (profiles.error) throw profiles.error;

    const readings = await supabase
      .from('soil_readings')
      .select('id', { count: 'exact', head: true });

    if (readings.error) throw readings.error;

    return res.status(200).json({
      ok: true,
      database: 'connected',
      provider: 'supabase',
      profiles_total: profiles.count || 0,
      readings_total: readings.count || 0,
      server_time: new Date().toISOString()
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      database: 'not-connected',
      provider: 'supabase',
      message: error.message || 'Supabase belum tersambung.'
    });
  }
}
