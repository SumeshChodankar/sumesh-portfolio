// api/track.js
// Vercel serverless function — logs every node click to MongoDB
// Deploy: push to GitHub → connect to Vercel → add MONGODB_URI env var

import { MongoClient } from 'mongodb';

const client = new MongoClient(process.env.MONGODB_URI);
let db;

async function getDb() {
  if (!db) {
    await client.connect();
    db = client.db('portfolio');
  }
  return db;
}

export default async function handler(req, res) {
  // CORS — allow your GitHub Pages domain
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { node, action, referrer, ua, screen, time } = req.body;

    // Enrich with geo from request IP
    const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket?.remoteAddress || 'unknown';
    const country = req.headers['x-vercel-ip-country'] || 'unknown';
    const city = req.headers['x-vercel-ip-city'] || 'unknown';

    const entry = {
      node,
      action,
      referrer: referrer || 'direct',
      ua,
      screen,
      ip,
      country,
      city,
      time: time ? new Date(time) : new Date(),
      createdAt: new Date(),
    };

    const database = await getDb();
    await database.collection('clicks').insertOne(entry);

    // Return total counts for this node
    const nodeCount = await database.collection('clicks').countDocuments({ node });
    const totalCount = await database.collection('clicks').countDocuments();

    return res.status(200).json({ ok: true, nodeClicks: nodeCount, totalClicks: totalCount });
  } catch (err) {
    console.error('Track error:', err);
    return res.status(500).json({ error: 'Internal error' });
  }
}
