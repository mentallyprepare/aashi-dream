import { eq } from "drizzle-orm";
import { db } from "./client.js";
import { initDb } from "./init.js";
import { productPortfolio, profile, tasks } from "./schema.js";

const now = () => new Date().toISOString();

const uxTags = [
  "UX Researcher Internship",
  "User interviews",
  "Usability testing",
  "Insight synthesis",
  "Research operations",
];

initDb();

const profileRow = db.select().from(profile).get();
if (profileRow) {
  const currentTags = Array.isArray(profileRow.experienceTags) ? profileRow.experienceTags : [];
  const experienceTags = Array.from(new Set([...uxTags, ...currentTags]));
  db.update(profile)
    .set({ experienceTags, updatedAt: now() })
    .where(eq(profile.id, profileRow.id))
    .run();
}

const portfolioRows = db.select().from(productPortfolio).all();
if (!portfolioRows.some((row) => row.title === "UX Research Internship Evidence Log")) {
  db.insert(productPortfolio)
    .values({
      title: "UX Research Internship Evidence Log",
      type: "case_study",
      description: "Current UX Researcher internship proof log: research questions, interviews, usability tests, synthesis, recommendations, and product impact.",
      metrics: { interviews: 0, usability_tests: 0, insight_themes: 0, recommendations_shipped: 0 },
      status: "active",
      url: null,
      notes: "Turn internship work into a portfolio-ready UX research case study for HCI, UX, product psychology, and consumer insights applications.",
      createdAt: now(),
      updatedAt: now(),
    })
    .run();
}

const taskRows = db.select().from(tasks).all();
if (!taskRows.some((row) => row.title === "Convert UX Researcher internship into a case study")) {
  db.insert(tasks)
    .values({
      title: "Convert UX Researcher internship into a case study",
      category: "portfolio",
      priority: "p1",
      status: "todo",
      dueDate: "2026-08-20",
      source: "manual",
      notes: "Document research goal, method, interview/usability evidence, insights, recommendation, and product impact.",
      createdAt: now(),
      updatedAt: now(),
    })
    .run();
}

console.log("UX Researcher internship profile update complete.");
