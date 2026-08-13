import "dotenv/config";
import cors from "cors";
import express from "express";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import "./db/seed.js";
import dashboardRouter from "./routes/dashboard.js";
import aiRouter from "./routes/ai.js";
import intelligenceRouter from "./routes/intelligence.js";
import { crudRouter } from "./routes/crud.js";
import {
  applications,
  careers,
  courseIntelligence,
  documents,
  ieltsProgress,
  lorContacts,
  people,
  productPortfolio,
  profile,
  researchPapers,
  scholarships,
  sopDocuments,
  tasks,
  universities,
  universityShortlist,
  visaTracker,
} from "./db/schema.js";
import { istDateTimeLabel, nowIso, todayInIst } from "./lib/time.js";

const app = express();
const port = Number(process.env.PORT || 3000);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDistPath = path.resolve(__dirname, "../dist");

app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.get("/api/health", (_request, response) => {
  response.json({ ok: true, app: "Aashi Dreams", time: nowIso(), today: todayInIst(), timezone: "Asia/Kolkata", displayTime: istDateTimeLabel() });
});

app.use("/api/dashboard", dashboardRouter);
app.use("/api/ai", aiRouter);
app.use("/api/intelligence", intelligenceRouter);
app.use("/api/profile", crudRouter(profile));
app.use("/api/universities", crudRouter(universities));
app.use("/api/shortlist", crudRouter(universityShortlist));
app.use("/api/scholarships", crudRouter(scholarships));
app.use("/api/careers", crudRouter(careers));
app.use("/api/course-intelligence", crudRouter(courseIntelligence));
app.use("/api/research", crudRouter(researchPapers));
app.use("/api/ielts", crudRouter(ieltsProgress));
app.use("/api/sops", crudRouter(sopDocuments));
app.use("/api/lors", crudRouter(lorContacts));
app.use("/api/applications", crudRouter(applications));
app.use("/api/visas", crudRouter(visaTracker));
app.use("/api/portfolio", crudRouter(productPortfolio));
app.use("/api/tasks", crudRouter(tasks));
app.use("/api/people", crudRouter(people));
app.use("/api/documents", crudRouter(documents));

if (existsSync(path.join(clientDistPath, "index.html"))) {
  app.use(express.static(clientDistPath));
  app.use((request, response, next) => {
    if (request.path.startsWith("/api")) return next();
    response.sendFile(path.join(clientDistPath, "index.html"), (error) => {
      if (error) next(error);
    });
  });
}

app.listen(port, () => {
  console.log(`Aashi Dreams API running at http://127.0.0.1:${port}`);
});
