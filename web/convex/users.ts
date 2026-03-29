import { query, mutation } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import {
  ensureViewer,
  getUserByClerkId,
  getUserByEmail,
  normalizeEmail,
  requireViewer,
  resolveRoleForEmail,
} from "./lib";

export const viewer = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity?.subject) {
      return null;
    }

    return await getUserByClerkId(ctx, identity.subject);
  },
});

export const viewerRole = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity?.subject || !identity.email) {
      return null;
    }

    const existing =
      (await getUserByClerkId(ctx, identity.subject)) ??
      (await getUserByEmail(ctx, identity.email));

    return existing?.role ?? resolveRoleForEmail(identity.email);
  },
});

export const ensureCurrentUser = mutation({
  args: {},
  handler: async (ctx) => (await ensureViewer(ctx))._id,
});

export const upsertFromWebhook = mutation({
  args: {
    sharedSecret: v.string(),
    clerkId: v.string(),
    email: v.string(),
    displayName: v.string(),
  },
  handler: async (ctx, args) => {
    const expectedSecret = process.env.CLERK_WEBHOOK_SECRET;

    if (!expectedSecret || args.sharedSecret !== expectedSecret) {
      throw new ConvexError("Webhook authorization failed.");
    }

    const email = normalizeEmail(args.email);
    const existing =
      (await getUserByClerkId(ctx, args.clerkId)) ??
      (await getUserByEmail(ctx, email));
    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, {
        clerkId: args.clerkId,
        email,
        displayName: args.displayName,
        updatedAt: now,
      });

      return existing._id;
    }

    const role = resolveRoleForEmail(email);

    if (!role) {
      return null;
    }

    return await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email,
      displayName: args.displayName,
      role,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const requireViewerQuery = query({
  args: {},
  handler: async (ctx) => await requireViewer(ctx),
});
