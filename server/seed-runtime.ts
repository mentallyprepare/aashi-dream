import { db } from "./db/client.js";
import { initDb } from "./db/init.js";
import { universities } from "./db/schema.js";
import { count } from "drizzle-orm";

export function seedIfNeeded() {
  initDb();
  const existing = db.select({ value: count() }).from(universities).get()?.value ?? 0;
  if (existing === 0) {
    console.log("Database is empty. Run `npm run seed` to load Anushka OS seed data.");
  }
}
