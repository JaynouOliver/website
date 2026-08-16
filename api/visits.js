// /api/visits.js — returns logged visits, password-protected.
// Set DASH_PASSWORD in Vercel → Project → Settings → Environment Variables.
import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const key = req.query.key || (req.headers.authorization || '').replace('Bearer ', '');
  if (!process.env.DASH_PASSWORD || key !== process.env.DASH_PASSWORD) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  const raw = await kv.lrange('visits', 0, 4999);
  const visits = raw.map(v => (typeof v === 'string' ? JSON.parse(v) : v));
  res.status(200).json({ visits });
}
