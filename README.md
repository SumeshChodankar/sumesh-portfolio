# 🌌 Sumesh Chodankar — Neural Galaxy Portfolio

> An interactive ML engineer portfolio where every project is a star in a neural network. Click nodes to fire synapses, explore projects, and track who visited what.

---

## 🚀 Deploy in 10 minutes

### Step 1 — Fork & clone
```bash
git clone https://github.com/YOUR_USERNAME/sumesh-portfolio.git
cd sumesh-portfolio
```

### Step 2 — Set up MongoDB (free)
1. Go to [mongodb.com/atlas](https://mongodb.com/atlas) → create free cluster
2. Create a database user (save the password)
3. Get your connection string: `mongodb+srv://user:pass@cluster.mongodb.net/portfolio`

### Step 3 — Deploy to Vercel (free)
```bash
npm install -g vercel
vercel

# Follow prompts, then add env vars:
vercel env add MONGODB_URI
# paste your MongoDB connection string

vercel env add DASHBOARD_KEY
# choose a secret password for your admin dashboard
```

### Step 4 — Update your GitHub URL in index.html
Find `sumesh-chodankar` in `index.html` and replace with your actual GitHub username.

### Step 5 — Update the TRACK_URL
In `index.html`, find:
```js
const TRACK_URL = '/api/track';
```
If hosting on a custom domain, change to your full Vercel URL:
```js
const TRACK_URL = 'https://your-app.vercel.app/api/track';
```

### Step 6 — Add to LinkedIn
Put your portfolio URL in your LinkedIn "Website" field and GitHub bio.

---

## 📊 View your analytics

Visit your private dashboard:
```
https://your-app.vercel.app/api/dashboard?key=YOUR_DASHBOARD_KEY
```

You'll see:
- Every node click with timestamp
- Which projects got the most attention
- Where visitors came from (LinkedIn, Google, direct)
- Country and city of each visitor
- Whether they actually clicked through to GitHub

---

## 🎨 Customise your nodes

Edit the `NODES` array in `index.html`:

```js
const NODES = [
  {
    id: 0,
    label: 'Your Project',        // displayed on the node
    sub: 'one line description',
    x: 0.5, y: 0.15,              // position (0–1 relative to canvas)
    r: 18,                         // node radius
    col: '#00ffaa',                // node colour
    desc: 'Full description shown in the side panel.',
    tags: [{t:'PyTorch',c:'#00ffaa'}, {t:'Docker',c:'#00ffaa'}],
    url: 'https://github.com/you/repo',
  },
  // ... more nodes
];
```

---

## 🔗 Project structure

```
sumesh-portfolio/
├── index.html          # Full portfolio (canvas + UI + tracking)
├── api/
│   ├── track.js        # POST /api/track — logs clicks to MongoDB
│   └── dashboard.js    # GET /api/dashboard?key=… — your analytics
├── package.json
├── vercel.json
└── README.md
```

---

## 🛡️ Privacy note

This tracks anonymous interaction data (which node was clicked, referrer URL, country). No personal data is collected without consent. Add a cookie notice if required in your jurisdiction.
