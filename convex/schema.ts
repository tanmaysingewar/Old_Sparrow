import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  // Auth tables required for Convex Auth
  ...authTables,

  // Chat tables
  chats: defineTable({
    title: v.string(),
    userId: v.id("users"),
    category: v.optional(v.string()),
    createdAt: v.number(), // Unix timestamp
    isShared: v.optional(v.boolean()), // Optional, defaults to false
  })
    .index("by_user", ["userId"])
    .index("by_user_created", ["userId", "createdAt"]),

  // Messages table
  messages: defineTable({
    userMessage: v.string(),
    botResponse: v.string(),
    chatId: v.id("chats"),
    createdAt: v.number(), // Unix timestamp
    fileUrl: v.optional(v.string()), // Optional, defaults to empty
    fileType: v.optional(v.string()), // Optional, defaults to empty
    fileName: v.optional(v.string()), // Optional, defaults to empty
  })
    .index("by_chat", ["chatId"])
    .index("by_chat_created", ["chatId", "createdAt"]),
});
