import { Router } from "express";
import { db, siteImagesTable } from "@workspace/db";
import { eq, asc, inArray } from "drizzle-orm";
import { requireAdmin } from "../middlewares/auth.js";

const router = Router();

// GET /site-images — public read (used by homepage + photography page)
router.get("/site-images", async (req, res) => {
  const { section } = req.query as { section?: string };
  let rows = await db
    .select()
    .from(siteImagesTable)
    .where(eq(siteImagesTable.isActive, true))
    .orderBy(asc(siteImagesTable.sortOrder));

  if (section) {
    rows = rows.filter((r) => r.section === section);
  }

  res.json(rows.map(toApi));
});

// POST /site-images — admin only
router.post("/site-images", requireAdmin, async (req, res) => {
  const { section, category, title, label, imageUrl, sortOrder, tall, isActive } = req.body as {
    section?: string;
    category?: string;
    title?: string;
    label?: string;
    imageUrl?: string;
    sortOrder?: number;
    tall?: boolean;
    isActive?: boolean;
  };

  if (!section || !imageUrl) {
    res.status(400).json({ error: "section and imageUrl are required" });
    return;
  }

  const [row] = await db
    .insert(siteImagesTable)
    .values({
      section,
      category: category ?? "all",
      title: title ?? "",
      label: label ?? "",
      imageUrl,
      sortOrder: sortOrder ?? 0,
      tall: tall ?? false,
      isActive: isActive ?? true,
    })
    .returning();

  res.status(201).json(toApi(row));
});

// POST /site-images/reorder — admin only
router.post("/site-images/reorder", requireAdmin, async (req, res) => {
  const { ids } = req.body as { section?: string; ids?: number[] };
  if (!Array.isArray(ids)) {
    res.status(400).json({ error: "ids array is required" });
    return;
  }
  await Promise.all(
    ids.map((id, idx) =>
      db
        .update(siteImagesTable)
        .set({ sortOrder: idx })
        .where(eq(siteImagesTable.id, id))
    )
  );
  res.json({ ok: true });
});

// PATCH /site-images/:id — admin only
router.patch("/site-images/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id ?? "", 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const { section, category, title, label, imageUrl, sortOrder, tall, isActive } = req.body as {
    section?: string;
    category?: string;
    title?: string;
    label?: string;
    imageUrl?: string;
    sortOrder?: number;
    tall?: boolean;
    isActive?: boolean;
  };

  const updates: Partial<typeof siteImagesTable.$inferInsert> = {};
  if (section !== undefined) updates.section = section;
  if (category !== undefined) updates.category = category;
  if (title !== undefined) updates.title = title;
  if (label !== undefined) updates.label = label;
  if (imageUrl !== undefined) updates.imageUrl = imageUrl;
  if (sortOrder !== undefined) updates.sortOrder = sortOrder;
  if (tall !== undefined) updates.tall = tall;
  if (isActive !== undefined) updates.isActive = isActive;

  const [updated] = await db
    .update(siteImagesTable)
    .set(updates)
    .where(eq(siteImagesTable.id, id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  res.json(toApi(updated));
});

// DELETE /site-images/:id — admin only
router.delete("/site-images/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id ?? "", 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  await db.delete(siteImagesTable).where(eq(siteImagesTable.id, id));
  res.json({ ok: true });
});

function toApi(r: typeof siteImagesTable.$inferSelect) {
  return {
    id: r.id,
    section: r.section,
    category: r.category,
    title: r.title,
    label: r.label,
    imageUrl: r.imageUrl,
    sortOrder: r.sortOrder,
    tall: r.tall,
    isActive: r.isActive,
    createdAt: r.createdAt.toISOString(),
  };
}

export default router;
