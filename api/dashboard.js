// api/dashboard.js
// Private admin endpoint — see all clicks
// Access: https://your-vercel-app.vercel.app/api/dashboard?key=YOUR_SECRET_KEY

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
  // Simple key auth — set DASHBOARD_KEY in Vercel env vars
  if (req.query.key !== process.env.DASHBOARD_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const database = await getDb();
  const col = database.collection('clicks');

  const [recent, byNode, byReferrer, byCountry, total] = await Promise.all([
    col.find().sort({ createdAt: -1 }).limit(50).toArray(),
    col.aggregate([
      { $group: { _id: '$node', count: { $sum: 1 }, lastSeen: { $max: '$createdAt' } } },
      { $sort: { count: -1 } }
    ]).toArray(),
    col.aggregate([
      { $group: { _id: '$referrer', count: { $sum: 1 } } },
      { $sort: { count: -1 } }, { $limit: 10 }
    ]).toArray(),
    col.aggregate([
      { $group: { _id: '$country', count: { $sum: 1 } } },
      { $sort: { count: -1 } }, { $limit: 10 }
    ]).toArray(),
    col.countDocuments(),
  ]);

  const html = `<!DOCTYPE html>
<html>
<head>
<title>Portfolio Analytics</title>
<style>
  body{font-family:'Courier New',monospace;background:#020408;color:#8899aa;padding:40px;line-height:1.8}
  h1{color:#00ffaa;font-size:18px;letter-spacing:0.2em;margin-bottom:8px}
  h2{color:#445566;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;margin:32px 0 12px;padding-bottom:8px;border-bottom:0.5px solid #111}
  table{width:100%;border-collapse:collapse;font-size:12px;margin-bottom:24px}
  th{color:#445566;font-size:10px;text-transform:uppercase;letter-spacing:0.1em;padding:6px 12px;text-align:left;border-bottom:0.5px solid #111}
  td{padding:8px 12px;border-bottom:0.5px solid #0a0f14;color:#667788}
  td.hi{color:#e8f4fd}
  td.green{color:#00ffaa;font-weight:700}
  td.pink{color:#ff6b9d}
  .stat{display:inline-block;margin-right:48px}
  .stat-num{font-size:32px;color:#00ffaa;display:block}
  .stat-label{font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:#334}
  tr:hover td{background:rgba(0,255,170,0.02)}
</style>
</head>
<body>
<h1>// portfolio analytics</h1>
<p style="color:#334;font-size:11px;margin-bottom:32px">${new Date().toISOString()}</p>

<div>
  <div class="stat"><span class="stat-num">${total}</span><span class="stat-label">total clicks</span></div>
  <div class="stat"><span class="stat-num">${byNode.length}</span><span class="stat-label">nodes touched</span></div>
  <div class="stat"><span class="stat-num">${byReferrer.length}</span><span class="stat-label">referrer sources</span></div>
</div>

<h2>clicks by node</h2>
<table>
  <tr><th>node</th><th>clicks</th><th>last seen</th></tr>
  ${byNode.map(r=>`<tr>
    <td class="hi">${r._id}</td>
    <td class="green">${r.count}</td>
    <td>${new Date(r.lastSeen).toLocaleString()}</td>
  </tr>`).join('')}
</table>

<h2>traffic sources</h2>
<table>
  <tr><th>referrer</th><th>visits</th></tr>
  ${byReferrer.map(r=>`<tr>
    <td class="pink">${r._id||'direct'}</td>
    <td class="green">${r.count}</td>
  </tr>`).join('')}
</table>

<h2>visitors by country</h2>
<table>
  <tr><th>country</th><th>visits</th></tr>
  ${byCountry.map(r=>`<tr>
    <td class="hi">${r._id||'unknown'}</td>
    <td class="green">${r.count}</td>
  </tr>`).join('')}
</table>

<h2>recent activity (last 50)</h2>
<table>
  <tr><th>time</th><th>node</th><th>action</th><th>referrer</th><th>country</th><th>city</th></tr>
  ${recent.map(r=>`<tr>
    <td style="color:#334;font-size:10px">${new Date(r.createdAt).toLocaleString()}</td>
    <td class="hi">${r.node}</td>
    <td style="color:${r.action==='repo_visit'?'#ffcc44':'#667788'}">${r.action}</td>
    <td style="font-size:10px;color:#334;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${r.referrer||'direct'}</td>
    <td>${r.country||'–'}</td>
    <td>${r.city||'–'}</td>
  </tr>`).join('')}
</table>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html');
  return res.status(200).send(html);
}
