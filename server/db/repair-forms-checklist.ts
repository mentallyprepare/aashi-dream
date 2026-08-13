import { eq } from "drizzle-orm";
import { db } from "./client.js";
import { initDb } from "./init.js";
import { documents } from "./schema.js";
import { nowIso } from "../lib/time.js";
import { formChecklistSeeds } from "./form-seeds.js";

initDb();

const now = nowIso();

for (const form of formChecklistSeeds) {
  const existing = db.select().from(documents).where(eq(documents.title, form.title)).get();
  const values = {
    title: form.title,
    type: form.type,
    url: form.url,
    status: form.status,
    notes: JSON.stringify(form.notes),
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };

  if (existing) {
    db.update(documents).set(values).where(eq(documents.id, existing.id)).run();
  } else {
    db.insert(documents).values(values).run();
  }
}

console.log(`Repaired ${formChecklistSeeds.length} researched forms for the Aashi checklist.`);
