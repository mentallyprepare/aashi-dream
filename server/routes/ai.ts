import express from "express";
import OpenAI from "openai";
import { db } from "../db/client.js";
import { aiReports, applications, careers, lorContacts, productPortfolio, profile, researchPapers, scholarships, sopDocuments, tasks, universities } from "../db/schema.js";
import { istDateTimeLabel, nowIso, todayInIst } from "../lib/time.js";

const router = express.Router();

const systemPrompt = `You are Anushka's elite admissions consultant, career strategist, research mentor, and product advisor.
You speak with the precision of an MBB consultant, the empathy of a mentor, the strategic thinking of a YC partner, and the domain knowledge of a top admissions officer.
Always be specific, actionable, honest, and prioritized.`;

router.post("/analyze", async (request, response) => {
  const type = String(request.body?.type || request.body?.context || "weekly_plan");
  if (!process.env.OPENAI_API_KEY) {
    response.json({
      ok: false,
      missingApiKey: true,
      message: "Add OPENAI_API_KEY in .env to enable AI analysis. The app will keep working without AI.",
      reportType: type,
      generatedAt: nowIso(),
    });
    return;
  }

  const context = {
    today: todayInIst(),
    timezone: "Asia/Kolkata",
    profile: db.select().from(profile).get(),
    universities: db.select().from(universities).limit(type === "top1_analysis" ? 80 : 12).all(),
    scholarships: db.select().from(scholarships).limit(type === "top1_analysis" ? 40 : 10).all(),
    careers: db.select().from(careers).all(),
    research: db.select().from(researchPapers).all(),
    sops: db.select().from(sopDocuments).all(),
    lors: db.select().from(lorContacts).all(),
    applications: db.select().from(applications).all(),
    portfolio: db.select().from(productPortfolio).all(),
    tasks: db.select().from(tasks).all(),
  };

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const completion = await client.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: `${systemPrompt}\nCurrent date: ${context.today} (${istDateTimeLabel()})` },
      {
        role: "user",
        content: `Analysis type: ${type}\nReturn concise structured JSON or markdown as appropriate.\nData:\n${JSON.stringify(context)}`,
      },
    ],
    temperature: 0.3,
  });

  const content = completion.choices[0]?.message?.content ?? "";
  const report = db
    .insert(aiReports)
    .values({ reportType: type, content: { content }, generatedAt: nowIso() })
    .returning()
    .get();
  response.json(report);
});

router.get("/reports", (_request, response) => {
  response.json(db.select().from(aiReports).all());
});

export default router;
