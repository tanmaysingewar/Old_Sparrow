import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }
    return await ctx.db
      .query("chats")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const add = mutation({
  args: {
    title: v.string(),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    await ctx.db.insert("chats", {
      title: args.title,
      userId: userId,
      createdAt: Date.now(),
      isShared: false,
      category: args.category,
    });
  },
});

export const deleteChat = mutation({
  args: {
    chatId: v.id("chats"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // First, verify that the chat belongs to the current user
    const chat = await ctx.db.get(args.chatId);
    if (!chat) {
      throw new Error("Chat not found");
    }

    if (chat.userId !== userId) {
      throw new Error("Not authorized to delete this chat");
    }

    // Delete all messages associated with this chat
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
      .collect();

    // Delete each message and associated files if any
    for (const message of messages) {
      // Delete associated file if it exists
      if (message.fileId) {
        try {
          await ctx.storage.delete(message.fileId);
        } catch (error) {
          // Log error but continue with deletion
          console.error("Error deleting file:", error);
        }
      }
      // Delete the message
      await ctx.db.delete(message._id);
    }

    // Finally, delete the chat itself
    await ctx.db.delete(args.chatId);

    return { success: true };
  },
});
