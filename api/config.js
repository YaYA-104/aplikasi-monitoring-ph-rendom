import { getPublicConfig } from './_supabaseAdmin.js';

export default function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ ok: false, message: 'Gunakan method GET.' });
  }

  try {
    const config = getPublicConfig();
    return res.status(200).json({ ok: true, ...config });
  } catch (error) {
    return res.status(500).json({ ok: false, message: error.message });
  }
}
