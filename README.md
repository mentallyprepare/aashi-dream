# 🎓 Aashi Dreams — SaaS Platform

Full-stack multi-tenant SaaS for student college admissions intelligence. Built with React/Vite frontend, Node/Express backend, Firebase Auth, Supabase DB, and Razorpay payments.

## 🚀 Stack

| Layer | Tech |
|---|---|
| Frontend | React 18 + Vite |
| Backend | Node.js + Express |
| Auth | Firebase Authentication |
| Database | Supabase (PostgreSQL) |
| Payments | Razorpay |
| Deploy (FE) | Vercel |
| Deploy (BE) | Railway |
| White-Label | `?partner=` URL param |

## 📁 Project Structure

```
aashi-dream/
├── server.js              # Express backend (auth, payments, DB)
├── vite.config.js         # Vite config
├── index.html             # HTML entry
├── src/
│   ├── main.jsx           # React entry
│   ├── App.jsx            # Routes + Paywall wrapper
│   ├── lib/
│   │   ├── firebase.js    # Firebase auth init
│   │   ├── supabase.js    # Supabase client
│   │   ├── razorpay.js    # Payment helpers
│   │   └── partners.js    # White-label config map
│   ├── pages/
│   │   ├── Login.jsx      # Auth page
│   │   ├── Dashboard.jsx  # Main product UI
│   │   └── Pricing.jsx    # Subscription tiers
│   └── components/
│       ├── Paywall.jsx    # Subscription gate
│       └── WhiteLabel.jsx # Brand switcher
├── db/
│   └── schema.sql         # Supabase tables
├── vercel.json
├── railway.toml
└── .env.example
```

## ⚡ Quick Start

```bash
# 1. Clone & install
git clone https://github.com/mentallyprepare/aashi-dream
cd aashi-dream
npm install

# 2. Set env vars
cp .env.example .env
# Fill in Firebase, Supabase, Razorpay keys

# 3. Run Supabase schema
# Paste db/schema.sql into Supabase SQL editor

# 4. Start backend
node server.js

# 5. Start frontend (new terminal)
npm run dev
```

Frontend: http://localhost:5173
Backend: http://localhost:3001

## 💰 Pricing Tiers

| Plan | Price | Target |
|---|---|---|
| Basic Report | ₹499 one-time | Individual student |
| Full Access + Roadmap | ₹1,499 one-time | Serious applicant |
| Coaching Institute | ₹15,000/year | B2B (50 seats) |

## 🏷️ White-Label

Append `?partner=PARTNERID` to any URL to activate partner branding.

Example: `https://aashidreams.vercel.app?partner=karnal`

Add partners in `src/lib/partners.js`.

## 🚢 Deploy

**Frontend → Vercel:**
1. Connect `mentallyprepare/aashi-dream` on vercel.com
2. Set env vars in Vercel dashboard
3. Auto-deploys on every push to `main`

**Backend → Railway:**
1. Connect repo on railway.app
2. Set env vars in Railway dashboard
3. `railway.toml` handles start command

## 🔑 Environment Variables

See `.env.example` for full list. Required:
- `FIREBASE_PROJECT_ID`, `FIREBASE_PRIVATE_KEY`, `FIREBASE_CLIENT_EMAIL`
- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_KEY`
- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`

## 📞 B2B Sales

Target: Coaching institutes in Tier-2/3 Indian cities.
Pitch: ₹15,000/year → institute charges ₹5,000/student → 50 students = ₹2.5L revenue → 1,566% ROI.

---

Built with ❤️ by Anushka | Aashi Dreams © 2026
