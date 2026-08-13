# Aashi Dreams Intelligence Engine

Admissions intelligence and white-label diagnostic platform for Anushka Navin Kumar and partner demos.

## Run Locally

Double-click `START.bat`, or run:

```powershell
npm run run
```

Open:

```text
http://127.0.0.1:5173/
```

Do not use the old stale preview URL:

```text
http://127.0.0.1:4173/index.html
```

## Release Check

```powershell
npm run release
```

This runs TypeScript checks and builds the frontend plus server output.

## Production Mode

```powershell
npm run build
npm start
```

Then open:

```text
http://127.0.0.1:3000/
```

The Express server serves both `/api/*` and the built React app when `dist/index.html` exists.

## Data

SQLite database:

```text
data/anushka.db
```

Seed and repair commands:

```powershell
npm run seed
npm run repair:dates
npm run repair:universities
npm run repair:scholarships
npm run repair:sources
npm run repair:opportunities
```

## AI Setup

Create `.env` with:

```text
OPENAI_API_KEY=sk-...
DATABASE_URL=./data/anushka.db
PORT=3000
```

If the key is missing, AI pages show a setup warning instead of crashing.
