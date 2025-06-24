import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  // Auth tables required for Convex Auth
  ...authTables,

  // Your existing tables
  todos: defineTable({
    text: v.string(),
    category: v.optional(v.string()),
    completed: v.boolean(),
  }).index("by_completed", ["completed"]),
});
