import { ConvexError, v } from "convex/values";
import { internal } from "./_generated/api";
import type { Doc, Id } from "./_generated/dataModel";
import {
  internalMutation,
  internalQuery,
  mutation,
  query,
  type QueryCtx,
} from "./_generated/server";
import {
  assertArticleEditable,
  assertLocalizationReady,
  assertTranslationReady,
  buildQaWarnings,
  ensureRole,
  ensureViewer,
  ensureUniqueSlug,
  insertAuditLog,
  requireProvisionedRole,
  requireViewer,
} from "./lib";

const articleFields = {
  headline: v.string(),
  deck: v.string(),
  body: v.string(),
  byline: v.string(),
  category: v.union(
    v.literal("news"),
    v.literal("opinion"),
    v.literal("feature"),
    v.literal("sports"),
    v.literal("culture"),
  ),
  heroImageUrl: v.string(),
  heroImageCaption: v.string(),
  heroImageAlt: v.string(),
  slug: v.string(),
};

const RECENT_AUDIT_LOG_LIMIT = 15;
const DASHBOARD_ARTICLE_LIMIT = 50;
const REVIEW_QUEUE_LIMIT = 50;
const GLOSSARY_TERM_LIMIT = 100;

async function buildArticleBundle(
  ctx: QueryCtx,
  articleId: Id<"articles">,
  viewer: Doc<"users">,
  requireEditor = false,
) {
  const article = await ctx.db.get(articleId);

  if (!article) {
    return null;
  }

  if (requireEditor && viewer.role !== "editor") {
    throw new ConvexError("Editor access required.");
  }

  if (viewer.role !== "editor" && article.authorId !== viewer._id) {
    throw new ConvexError("You cannot access this article.");
  }

  const localization = await ctx.db
    .query("article_localizations")
    .withIndex("by_article_locale", (query) =>
      query.eq("articleId", article._id).eq("locale", "fil"),
    )
    .unique();
  const publication = await ctx.db
    .query("publication_records")
    .withIndex("by_article", (query) => query.eq("articleId", article._id))
    .unique();
  const author = await ctx.db.get(article.authorId);
  const auditLogs = await ctx.db
    .query("audit_logs")
    .withIndex("by_article", (query) => query.eq("articleId", article._id))
    .order("desc")
    .take(RECENT_AUDIT_LOG_LIMIT);

  return {
    article,
    localization,
    publication,
    auditLogs,
    author,
  };
}

export const getDashboardData = query({
  args: {},
  handler: async (ctx) => {
    const viewer = await requireViewer(ctx);
    const ownArticles = await ctx.db
      .query("articles")
      .withIndex("by_author", (query) => query.eq("authorId", viewer._id))
      .take(DASHBOARD_ARTICLE_LIMIT);

    ownArticles.sort((a, b) => b.updatedAt - a.updatedAt);

    const reviewQueue =
      viewer.role === "editor"
        ? await ctx.db
            .query("articles")
            .withIndex("by_status", (query) =>
              query.eq("status", "NEEDS_REVIEW"),
            )
            .take(REVIEW_QUEUE_LIMIT)
        : [];

    return {
      viewer,
      ownArticles,
      reviewQueueCount: reviewQueue.length,
    };
  },
});

export const getArticleBundle = query({
  args: {
    articleId: v.id("articles"),
  },
  handler: async (ctx, args) => {
    const viewer = await requireViewer(ctx);
    return await buildArticleBundle(ctx, args.articleId, viewer);
  },
});

export const getReviewBundle = query({
  args: {
    articleId: v.id("articles"),
  },
  handler: async (ctx, args) => {
    await requireProvisionedRole(ctx, "editor");
    const viewer = {
      role: "editor",
    } as Doc<"users">;
    const bundle = await buildArticleBundle(ctx, args.articleId, viewer, true);

    if (
      !bundle ||
      (bundle.article.status !== "NEEDS_REVIEW" &&
        bundle.article.status !== "TRANSLATING")
    ) {
      return null;
    }

    return bundle;
  },
});

export const getEditorQueue = query({
  args: {},
  handler: async (ctx) => {
    await requireProvisionedRole(ctx, "editor");
    const articles = await ctx.db
      .query("articles")
      .withIndex("by_status", (query) => query.eq("status", "NEEDS_REVIEW"))
      .take(REVIEW_QUEUE_LIMIT);

    const rows = await Promise.all(
      articles.map(async (article) => {
        const author = await ctx.db.get(article.authorId);
        const localization = await ctx.db
          .query("article_localizations")
          .withIndex("by_article_locale", (query) =>
            query.eq("articleId", article._id).eq("locale", "fil"),
          )
          .unique();

        return {
          article,
          author,
          qaWarningsCount: localization?.qaWarnings.length ?? 0,
          editorEdited: localization?.editorEdited ?? false,
        };
      }),
    );

    rows.sort((a, b) => b.article.updatedAt - a.article.updatedAt);
    return rows;
  },
});

export const createArticle = mutation({
  args: articleFields,
  handler: async (ctx, args) => {
    const viewer = await ensureViewer(ctx);
    const now = Date.now();
    const slug = await ensureUniqueSlug(ctx, args.slug);
    const articleId = await ctx.db.insert("articles", {
      ...args,
      slug,
      authorId: viewer._id,
      status: "DRAFT",
      sourceLanguage: "en",
      latestEditorNote: null,
      translationError: null,
      createdAt: now,
      updatedAt: now,
    });

    await insertAuditLog(ctx, {
      articleId,
      actorId: viewer._id,
      action: "article_created",
      fromStatus: null,
      toStatus: "DRAFT",
      metadata: { slug },
    });

    return articleId;
  },
});

export const updateArticle = mutation({
  args: {
    articleId: v.id("articles"),
    ...articleFields,
  },
  handler: async (ctx, args) => {
    const viewer = await ensureViewer(ctx);
    const article = await ctx.db.get(args.articleId);

    if (!article) {
      throw new ConvexError("Article not found.");
    }

    assertArticleEditable(article, viewer);

    const { articleId, ...articleUpdates } = args;
    void articleId;
    const slug = await ensureUniqueSlug(ctx, args.slug, article._id);
    await ctx.db.patch(article._id, {
      ...articleUpdates,
      slug,
      updatedAt: Date.now(),
    });

    await insertAuditLog(ctx, {
      articleId: article._id,
      actorId: viewer._id,
      action: "article_updated",
      fromStatus: article.status,
      toStatus: article.status,
      metadata: { slug },
    });

    return article._id;
  },
});

export const submitForTranslation = mutation({
  args: {
    articleId: v.id("articles"),
    mockTranslation: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const viewer = await ensureViewer(ctx);
    const article = await ctx.db.get(args.articleId);

    if (!article) {
      throw new ConvexError("Article not found.");
    }

    assertArticleEditable(article, viewer);
    assertTranslationReady(article);

    await ctx.db.patch(article._id, {
      status: "TRANSLATING",
      translationError: null,
      updatedAt: Date.now(),
    });

    await insertAuditLog(ctx, {
      articleId: article._id,
      actorId: viewer._id,
      action: "translation_requested",
      fromStatus: article.status,
      toStatus: "TRANSLATING",
      metadata: { locale: "fil", mode: "initial" },
    });

    await ctx.scheduler.runAfter(0, internal.translation.generateTranslation, {
      articleId: article._id,
      mode: "initial",
      mockTranslation: args.mockTranslation ?? false,
      requestedBy: viewer._id,
    });

    return true;
  },
});

export const requestRetranslation = mutation({
  args: {
    articleId: v.id("articles"),
    mockTranslation: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const viewer = await ensureRole(ctx, "editor");
    const article = await ctx.db.get(args.articleId);

    if (!article) {
      throw new ConvexError("Article not found.");
    }

    if (article.status !== "NEEDS_REVIEW") {
      throw new ConvexError("Re-translation is only allowed in review.");
    }

    await ctx.db.patch(article._id, {
      status: "TRANSLATING",
      translationError: null,
      updatedAt: Date.now(),
    });

    await insertAuditLog(ctx, {
      articleId: article._id,
      actorId: viewer._id,
      action: "retranslation_requested",
      fromStatus: article.status,
      toStatus: "TRANSLATING",
      metadata: { locale: "fil", mode: "retranslate" },
    });

    await ctx.scheduler.runAfter(0, internal.translation.generateTranslation, {
      articleId: article._id,
      mode: "retranslate",
      mockTranslation: args.mockTranslation ?? false,
      requestedBy: viewer._id,
    });

    return true;
  },
});

export const saveLocalizationEdits = mutation({
  args: {
    articleId: v.id("articles"),
    translatedHeadline: v.string(),
    translatedDeck: v.string(),
    translatedBody: v.string(),
  },
  handler: async (ctx, args) => {
    const viewer = await ensureRole(ctx, "editor");
    const article = await ctx.db.get(args.articleId);

    if (!article) {
      throw new ConvexError("Article not found.");
    }

    if (article.status !== "NEEDS_REVIEW") {
      throw new ConvexError("Localization edits are only allowed in review.");
    }

    const localization = await ctx.db
      .query("article_localizations")
      .withIndex("by_article_locale", (query) =>
        query.eq("articleId", article._id).eq("locale", "fil"),
      )
      .unique();

    if (!localization) {
      throw new ConvexError("Filipino localization not found.");
    }

    assertLocalizationReady(args);

    const glossaryTerms = await ctx.db
      .query("glossary_terms")
      .withIndex("by_active", (query) => query.eq("active", true))
      .take(GLOSSARY_TERM_LIMIT);

    const qaWarnings = buildQaWarnings({
      headline: article.headline,
      deck: article.deck,
      body: article.body,
      translatedHeadline: args.translatedHeadline,
      translatedDeck: args.translatedDeck,
      translatedBody: args.translatedBody,
      glossaryTerms,
    });

    await ctx.db.patch(localization._id, {
      translatedHeadline: args.translatedHeadline,
      translatedDeck: args.translatedDeck,
      translatedBody: args.translatedBody,
      editorEdited: true,
      translationSource: "human",
      qaWarnings,
      updatedAt: Date.now(),
    });

    await insertAuditLog(ctx, {
      articleId: article._id,
      actorId: viewer._id,
      action: "editor_edit",
      fromStatus: article.status,
      toStatus: article.status,
      metadata: {
        locale: "fil",
        qaWarningsCount: qaWarnings.length,
      },
    });

    return localization._id;
  },
});

export const rejectArticle = mutation({
  args: {
    articleId: v.id("articles"),
    note: v.string(),
  },
  handler: async (ctx, args) => {
    const viewer = await ensureRole(ctx, "editor");
    const article = await ctx.db.get(args.articleId);

    if (!article) {
      throw new ConvexError("Article not found.");
    }

    if (article.status !== "NEEDS_REVIEW") {
      throw new ConvexError("Only articles in review can be rejected.");
    }

    const note = args.note.trim();

    if (!note) {
      throw new ConvexError("A rejection note is required.");
    }

    await ctx.db.patch(article._id, {
      status: "DRAFT",
      latestEditorNote: note,
      updatedAt: Date.now(),
    });

    await insertAuditLog(ctx, {
      articleId: article._id,
      actorId: viewer._id,
      action: "article_rejected",
      fromStatus: article.status,
      toStatus: "DRAFT",
      metadata: { rejectionReason: note },
    });

    return true;
  },
});

export const approveAndPublish = mutation({
  args: {
    articleId: v.id("articles"),
  },
  handler: async (ctx, args) => {
    const viewer = await ensureRole(ctx, "editor");
    const article = await ctx.db.get(args.articleId);

    if (!article) {
      throw new ConvexError("Article not found.");
    }

    if (article.status !== "NEEDS_REVIEW") {
      throw new ConvexError("Only reviewed articles can be published.");
    }

    const localization = await ctx.db
      .query("article_localizations")
      .withIndex("by_article_locale", (query) =>
        query.eq("articleId", article._id).eq("locale", "fil"),
      )
      .unique();

    if (!localization) {
      throw new ConvexError("Filipino localization is required before publish.");
    }

    assertLocalizationReady(localization);

    const existingPublication = await ctx.db
      .query("publication_records")
      .withIndex("by_article", (query) => query.eq("articleId", article._id))
      .unique();

    if (existingPublication) {
      throw new ConvexError("This article has already been published.");
    }

    const publishedAt = Date.now();
    const enUrl = `/en/articles/${article.slug}`;
    const filUrl = `/fil/articles/${article.slug}`;

    await insertAuditLog(ctx, {
      articleId: article._id,
      actorId: viewer._id,
      action: "article_approved",
      fromStatus: article.status,
      toStatus: article.status,
      metadata: { locale: "fil" },
    });

    await ctx.db.insert("publication_records", {
      articleId: article._id,
      slug: article.slug,
      approvedBy: viewer._id,
      approvedAt: publishedAt,
      publishedBy: viewer._id,
      publishedAt,
      enUrl,
      filUrl,
      filLocalizationId: localization._id,
      createdAt: publishedAt,
    });

    await ctx.db.patch(article._id, {
      status: "PUBLISHED",
      translationError: null,
      updatedAt: publishedAt,
    });

    await insertAuditLog(ctx, {
      articleId: article._id,
      actorId: viewer._id,
      action: "article_published",
      fromStatus: "NEEDS_REVIEW",
      toStatus: "PUBLISHED",
      metadata: {
        locale: "en,fil",
        slug: article.slug,
      },
    });

    return {
      enUrl,
      filUrl,
    };
  },
});

export const getArticleForTranslation = internalQuery({
  args: {
    articleId: v.id("articles"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.articleId);
  },
});

export const getGlossaryTerms = internalQuery({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("glossary_terms")
      .withIndex("by_active", (query) => query.eq("active", true))
      .take(GLOSSARY_TERM_LIMIT);
  },
});

export const storeTranslationResult = internalMutation({
  args: {
    articleId: v.id("articles"),
    mode: v.union(v.literal("initial"), v.literal("retranslate")),
    requestedBy: v.optional(v.id("users")),
    translatedHeadline: v.string(),
    translatedDeck: v.string(),
    translatedBody: v.string(),
    glossaryApplied: v.boolean(),
    qaWarnings: v.array(
      v.object({
        type: v.string(),
        severity: v.union(
          v.literal("low"),
          v.literal("medium"),
          v.literal("high"),
        ),
        message: v.string(),
        field: v.optional(v.string()),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const article = await ctx.db.get(args.articleId);

    if (!article) {
      throw new ConvexError("Article not found.");
    }

    // Translation jobs are only allowed to write back while the article is
    // actively in the translating state. This prevents stale scheduled jobs
    // from overwriting reviewed or published localization data.
    if (article.status !== "TRANSLATING") {
      return null;
    }

    const existing = await ctx.db
      .query("article_localizations")
      .withIndex("by_article_locale", (query) =>
        query.eq("articleId", article._id).eq("locale", "fil"),
      )
      .unique();
    const now = Date.now();
    const generatedBy: Id<"users"> | "system" = args.requestedBy ?? "system";
    const localizationFields = {
      articleId: article._id,
      locale: "fil" as const,
      translatedHeadline: args.translatedHeadline,
      translatedDeck: args.translatedDeck,
      translatedBody: args.translatedBody,
      translationSource: "ai_assisted" as const,
      translationProvider: "google_cloud_translation" as const,
      glossaryApplied: args.glossaryApplied,
      editorEdited: false,
      qaWarnings: args.qaWarnings,
      generatedAt: now,
      generatedBy,
      updatedAt: now,
    };

    const localizationId = existing
      ? existing._id
      : await ctx.db.insert("article_localizations", localizationFields);

    if (existing) {
      await ctx.db.patch(existing._id, localizationFields);
    }

    const nextStatus = "NEEDS_REVIEW";

    await ctx.db.patch(article._id, {
      status: nextStatus,
      translationError: null,
      updatedAt: now,
    });

    await insertAuditLog(ctx, {
      articleId: article._id,
      actorId: args.requestedBy ?? "system",
      action: "translation_completed",
      fromStatus: article.status,
      toStatus: nextStatus,
      metadata: {
        locale: "fil",
        glossaryApplied: args.glossaryApplied,
        mode: args.mode,
      },
    });

    await insertAuditLog(ctx, {
      articleId: article._id,
      actorId: args.requestedBy ?? "system",
      action: "qa_checks_completed",
      fromStatus: nextStatus,
      toStatus: nextStatus,
      metadata: {
        locale: "fil",
        qaWarningsCount: args.qaWarnings.length,
        mode: args.mode,
      },
    });

    return localizationId;
  },
});

export const storeTranslationFailure = internalMutation({
  args: {
    articleId: v.id("articles"),
    mode: v.union(v.literal("initial"), v.literal("retranslate")),
    requestedBy: v.optional(v.id("users")),
    error: v.string(),
  },
  handler: async (ctx, args) => {
    const article = await ctx.db.get(args.articleId);

    if (!article) {
      throw new ConvexError("Article not found.");
    }

    if (article.status !== "TRANSLATING") {
      return false;
    }

    const nextStatus = args.mode === "retranslate" ? "NEEDS_REVIEW" : "DRAFT";

    await ctx.db.patch(article._id, {
      status: nextStatus,
      translationError: args.error,
      updatedAt: Date.now(),
    });

    await insertAuditLog(ctx, {
      articleId: article._id,
      actorId: args.requestedBy ?? "system",
      action: "translation_failed",
      fromStatus: article.status,
      toStatus: nextStatus,
      metadata: {
        error: args.error,
        locale: "fil",
        mode: args.mode,
      },
    });

    return true;
  },
});

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    // Attempt to find a user to assign these articles to
    const firstUser = await ctx.db.query("users").first();
    if (!firstUser) {
      throw new Error("No users found in database. Please log in to the website once first to create your account.");
    }
    
    const userId = firstUser._id;
    const now = Date.now();

    // 1. A Rejected Article
    const rejectedId = await ctx.db.insert("articles", {
      headline: "Local markets see surge in vegetable prices due to El Niño",
      deck: "Supply chain disruptions lead to higher costs for consumers in Metro Manila.",
      body: "Vegetable prices in Metro Manila markets have increased by up to 30% over the past week. Traders attribute this to the ongoing El Niño phenomenon, which has severely affected crops in Northern Luzon. The Department of Agriculture is now monitoring the situation to ensure stable supply.",
      byline: "Market Reporter",
      category: "news",
      heroImageUrl: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&q=80&w=1200",
      heroImageCaption: "Local market in Quezon City",
      heroImageAlt: "Vegetables in a market",
      slug: "vegetable-prices-surge-rejected",
      authorId: userId,
      status: "DRAFT",
      sourceLanguage: "en",
      latestEditorNote: "The Filipino translation had some inaccuracies in the price percentages. Please double-check the figures and resubmit.",
      translationError: null,
      createdAt: now - 86400000,
      updatedAt: now - 3600000,
    });

    // 2. An Article in Translating
    const translatingId = await ctx.db.insert("articles", {
      headline: "Digital literacy program launched for public schools in remote areas",
      deck: "New initiative aims to bridge the digital divide for thousands of students.",
      body: "A new government initiative is providing laptops and high-speed internet to public schools in provinces. The goal is to provide digital literacy skills to students in far-flung areas. This project is a partnership between the Department of Information and Communications Technology and local government units.",
      byline: "Education Desk",
      category: "feature",
      heroImageUrl: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=1200",
      heroImageCaption: "Students using new computers",
      heroImageAlt: "Digital classroom",
      slug: "digital-literacy-remote-schools",
      authorId: userId,
      status: "TRANSLATING",
      sourceLanguage: "en",
      latestEditorNote: null,
      translationError: null,
      createdAt: now - 7200000,
      updatedAt: now - 300000,
    });

    // 3. An Article for Review (Needs Review)
    const reviewId = await ctx.db.insert("articles", {
      headline: "National Museum announces free admission for Independence Day",
      deck: "Citizens can visit all museum branches across the country without charge on June 12.",
      body: "In celebration of Philippine Independence Day, the National Museum of the Philippines has announced free admission for all visitors. This special event aims to encourage Filipinos to reconnect with their history and heritage. Exhibits will include historical artifacts and contemporary art from across the islands.",
      byline: "Culture Writer",
      category: "culture",
      heroImageUrl: "https://images.unsplash.com/photo-1518998053574-53f1f61f9b8d?auto=format&fit=crop&q=80&w=1200",
      heroImageCaption: "National Museum of Fine Arts",
      heroImageAlt: "Museum facade",
      slug: "national-museum-independence-day",
      authorId: userId,
      status: "NEEDS_REVIEW",
      sourceLanguage: "en",
      latestEditorNote: null,
      translationError: null,
      createdAt: now - 172800000,
      updatedAt: now - 1800000,
    });

    // 4. A Published Article
    const publishedId = await ctx.db.insert("articles", {
      headline: "Philippine startup ecosystem grows with new venture capital funding",
      deck: "Local tech companies receive significant investment to expand operations.",
      body: "The startup ecosystem in the Philippines is experiencing a surge in venture capital interest. Several local tech startups have recently closed funding rounds totaling millions of dollars. This growth is expected to create more jobs and drive innovation in the digital economy.",
      byline: "Business Reporter",
      category: "news",
      heroImageUrl: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&q=80&w=1200",
      heroImageCaption: "Modern office space in BGC",
      heroImageAlt: "Startup office",
      slug: "startup-funding-surge-published",
      authorId: userId,
      status: "PUBLISHED",
      sourceLanguage: "en",
      latestEditorNote: null,
      translationError: null,
      createdAt: now - 604800000,
      updatedAt: now - 518400000,
    });

    await insertAuditLog(ctx, {
      articleId: publishedId,
      actorId: userId,
      action: "article_published",
      fromStatus: "NEEDS_REVIEW",
      toStatus: "PUBLISHED",
      metadata: { locale: "en,fil", slug: "startup-funding-surge-published" },
    });

    return { rejectedId, translatingId, reviewId, publishedId };
  },
});
