import { internalQuery, mutation, query } from "./_generated/server";
import { demoGlossarySeed } from "./constants";
import { ensureViewer, requireRole } from "./lib";

const GLOSSARY_TERM_LIMIT = 100;

export const list = query({
  args: {},
  handler: async (ctx) => {
    await requireRole(ctx, "editor");
    const glossaryTerms = await ctx.db
      .query("glossary_terms")
      .withIndex("by_active", (query) => query.eq("active", true))
      .take(GLOSSARY_TERM_LIMIT);

    return glossaryTerms.sort((a, b) =>
      a.englishTerm.localeCompare(b.englishTerm),
    );
  },
});

export const seedIfEmpty = mutation({
  args: {},
  handler: async (ctx) => {
    const viewer = await ensureViewer(ctx);
    const now = Date.now();
    let insertedCount = 0;

    for (const term of demoGlossarySeed) {
      const existingTerm = await ctx.db
        .query("glossary_terms")
        .withIndex("by_english_term", (query) =>
          query.eq("englishTerm", term.englishTerm),
        )
        .unique();

      if (existingTerm) {
        continue;
      }

      await ctx.db.insert("glossary_terms", {
        ...term,
        active: true,
        createdAt: now,
        updatedAt: now,
        createdBy: viewer._id,
      });

      insertedCount += 1;
    }

    return insertedCount > 0;
  },
});

export const getActiveTermsInternal = internalQuery({
  args: {},
  handler: async (ctx) => {
    const glossaryTerms = await ctx.db
      .query("glossary_terms")
      .withIndex("by_active", (query) => query.eq("active", true))
      .take(GLOSSARY_TERM_LIMIT);

    return glossaryTerms.sort((a, b) =>
      a.englishTerm.localeCompare(b.englishTerm),
    );
  },
});
