import { eq } from "drizzle-orm";
import type { AnySQLiteTable } from "drizzle-orm/sqlite-core";
import type { Router } from "express";
import express from "express";
import { db } from "../db/client.js";
import { nowIso } from "../lib/time.js";

export function crudRouter(table: AnySQLiteTable): Router {
  const router = express.Router();
  const idColumn = (table as unknown as { id: never }).id;

  router.get("/", (_request, response) => {
    response.json(db.select().from(table as never).all());
  });

  router.get("/:id", (request, response) => {
    const id = Number(request.params.id);
    const row = db.select().from(table as never).where(eq(idColumn, id)).get();
    if (!row) {
      response.status(404).json({ error: "Not found" });
      return;
    }
    response.json(row);
  });

  router.post("/", (request, response) => {
    const now = nowIso();
    const body = { ...request.body };
    if ("createdAt" in table && !body.createdAt) body.createdAt = now;
    if ("updatedAt" in table && !body.updatedAt) body.updatedAt = now;
    const inserted = db.insert(table as never).values(body).returning().get();
    response.status(201).json(inserted);
  });

  router.put("/:id", (request, response) => {
    const id = Number(request.params.id);
    const body = { ...request.body };
    if ("updatedAt" in table) body.updatedAt = nowIso();
    const updated = db
      .update(table as never)
      .set(body)
      .where(eq(idColumn, id))
      .returning()
      .get();
    if (!updated) {
      response.status(404).json({ error: "Not found" });
      return;
    }
    response.json(updated);
  });

  router.delete("/:id", (request, response) => {
    const id = Number(request.params.id);
    db.delete(table as never).where(eq(idColumn, id)).run();
    response.status(204).end();
  });

  return router;
}
