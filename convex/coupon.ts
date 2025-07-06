import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// Default credits to give to new users (configurable via environment variable)
const DEFAULT_CREDITS = parseInt(process.env.DEFAULT_USER_CREDITS || "100");

export const ensureUserHasCredits = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const user = await ctx.db.get(userId);
    if (!user) {
      return null;
    }

    // If user doesn't have credits set, give them default credits
    if (user.credits === undefined || user.credits === null) {
      await ctx.db.patch(userId, { credits: DEFAULT_CREDITS });
      return DEFAULT_CREDITS;
    }

    return user.credits;
  },
});

export const getUserCredits = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const user = await ctx.db.get(userId);
    if (!user) {
      return null;
    }

    return user.credits || 0;
  },
});

export const useCredits = mutation({
  args: {
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return false;
    }

    const user = await ctx.db.get(userId);
    if (!user) {
      return false;
    }

    if (
      user.credits === undefined ||
      user.credits === null ||
      user.credits < args.amount
    ) {
      return false;
    }

    await ctx.db.patch(userId, {
      credits: user.credits - args.amount,
    });

    return true;
  },
});

export const applyCoupon = mutation({
  args: {
    coupon: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const user = await ctx.db.get(userId);
    if (!user) {
      return null;
    }

    // Check if the coupon is valid
    const coupon = await ctx.db
      .query("coupons")
      .filter((q) => q.eq(q.field("code"), args.coupon))
      .first();
    if (!coupon || coupon.expiresAt < Date.now()) {
      return null;
    }

    // Check if the user has already used this coupon
    const hasUsedCoupon = user.couponUsed?.some(
      (usedCoupon) => usedCoupon.coupon === coupon._id
    );
    if (hasUsedCoupon) {
      return null; // User has already used this coupon
    }

    // Add the coupon to the user's couponUsed array
    await ctx.db.patch(userId, {
      couponUsed: [
        ...(user.couponUsed || []),
        {
          coupon: coupon._id,
          usedAt: Date.now(),
          amount: coupon.amount,
        },
      ],
    });

    // Update the user's credits
    await ctx.db.patch(userId, {
      credits: (user.credits || 0) + coupon.amount,
    });

    return true;
  },
});
