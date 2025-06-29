import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "./_generated/dataModel";

export const get = query({
  args: {
    chatId: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    if (!args.chatId) {
      return [];
    }

    return await ctx.db
      .query("messages")
      .withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
      .order("desc")
      .collect();
  },
});

export const add = mutation({
  args: {
    chatId: v.string(),
    userMessage: v.string(),
    postBotResponse: v.string(),
    fileId: v.optional(v.id("_storage")),
    fileType: v.optional(v.string()),
    fileName: v.optional(v.string()),
    fileSize: v.optional(v.number()),
    researchItems: v.optional(
      v.array(
        v.object({
          title: v.string(),
          content: v.string(),
          isCompleted: v.optional(v.boolean()),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    await ctx.db.insert("messages", {
      userMessage: args.userMessage,
      postBotResponse: args.postBotResponse,
      chatId: args.chatId,
      createdAt: Date.now(),
      fileId: args.fileId || undefined,
      fileType: args.fileType || undefined,
      fileName: args.fileName || undefined,
      fileSize: args.fileSize || undefined,
      researchItems: args.researchItems || undefined,
    });
  },
});

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    return await ctx.storage.generateUploadUrl();
  },
});

export const getFileUrl = query({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    if (!args.storageId) {
      return null;
    }

    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const fileUrl = await ctx.storage.getUrl(args.storageId);
    if (!fileUrl) {
      return null;
    }

    return fileUrl;
  },
});

export const deleteFile = mutation({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    if (!args.storageId) {
      return null;
    }

    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    return await ctx.storage.delete(args.storageId);
  },
});
