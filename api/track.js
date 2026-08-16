// /api/track.js — logs one visit. Deploy on Vercel with the KV (Upstash) integration attached.
import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  try {
    const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
    const visit = {
      ip,
      city: decodeURIComponent(req.headers['x-vercel-ip-city'] || '') || '—',
      region: req.headers['x-vercel-ip-country-region'] || '',
      country: req.headers['x-vercel-ip-country'] || '—',
      path: (req.query && req.query.p) || '/',
      ua: (req.headers['user-agent'] || '').slice(0, 120),
      t: Date.now()
    };
    await kv.lpush('visits', JSON.stringify(visit));
    await kv.ltrim('visits', 0, 9999); // keep the latest 10k
    res.status(204).end();
  } catch (e) {
    res.status(200).json({ ok: false });
  }
}
