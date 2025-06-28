import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "./_generated/dataModel";

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

export const deleteChat = mutation({
  args: {
    chatId: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // First, verify that the chat belongs to the current user
    const chat = await ctx.db
      .query("chats")
      .filter((q) => q.eq(q.field("customChatId"), args.chatId))
      .first();
    if (!chat) {
      throw new Error("Chat not found");
    }

    if (chat.userId !== userId) {
      throw new Error("Not authorized to delete this chat");
    }

    // Delete all messages associated with this chat
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_chat", (q) => q.eq("chatId", chat._id as Id<"chats">))
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
    await ctx.db
      .query("chats")
      .filter((q) => q.eq(q.field("customChatId"), args.chatId))
      .first();
    if (!chat) {
      throw new Error("Chat not found");
    }
    await ctx.db.delete(chat._id);

    return { success: true };
  },
});
