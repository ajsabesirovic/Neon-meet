import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const syncUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    image: v.optional(v.string()),
    clerkId: v.string(),
  },
  handler: async (context, args) => {
    const existingUser = await context.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
      // eq=equalTo
      .first();

    if (existingUser) return;

    await context.db.insert("users", {
      ...args,
      role: "interviewer",
    });
  },
});
export const getUsers = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("User is not authenticated");
    const users = await ctx.db.query("users").collect();
    return users;
  },
});
export const getUserByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    return user;
  },
});
