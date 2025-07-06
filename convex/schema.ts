import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  // Auth tables required for Convex Auth
  ...authTables,

  users: defineTable({
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    credits: v.optional(v.number()),
    couponUsed: v.optional(
      v.array(
        v.object({
          coupon: v.id("coupons"),
          usedAt: v.number(),
          amount: v.number(),
        })
      )
    ),
  }).index("email", ["email"]),

  coupons: defineTable({
    code: v.string(),
    amount: v.number(),
    expiresAt: v.number(),
  }),

  // Chat tables
  chats: defineTable({
    customChatId: v.string(), // Custom chat identifier
    title: v.string(),
    userId: v.id("users"),
    category: v.optional(v.string()),
    createdAt: v.number(), // Unix timestamp
    isShared: v.optional(v.boolean()), // Optional, defaults to false
    isDisabled: v.optional(v.boolean()), // Optional, defaults to false
  })
    .index("by_user", ["userId"])
    .index("by_user_created", ["userId", "createdAt"])
    .index("by_custom_chat_id", ["customChatId"]),

  // Messages table
  messages: defineTable({
    userMessage: v.string(),
    chatId: v.string(),
    createdAt: v.number(), // Unix timestamp
    fileId: v.optional(v.id("_storage")), // Optional, defaults to empty
    fileType: v.optional(v.string()), // Optional, defaults to empty
    fileName: v.optional(v.string()), // Optional, defaults to empty
    fileSize: v.optional(v.number()), // Optional, defaults to empty
    // Bot responses array with dynamic responses and research items
    botResponses: v.optional(
      v.array(
        v.object({
          response: v.string(),
          researchItems: v.optional(
            v.array(
              v.object({
                title: v.string(),
                content: v.string(),
                isCompleted: v.optional(v.boolean()),
              })
            )
          ),
        })
      )
    ),
  })
    .index("by_chat", ["chatId"])
    .index("by_chat_created", ["chatId", "createdAt"]),
});
