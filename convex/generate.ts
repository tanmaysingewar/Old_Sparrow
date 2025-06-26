import { v } from "convex/values";
import {
  action,
  query,
  mutation,
  internalMutation,
  internalQuery,
} from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";
import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions.mjs";

// Helper internal mutation to create a new chat
export const createChat = internalMutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("chats", {
      userId: args.userId,
      createdAt: Date.now(),
      title: "New Chat",
      category: "New Chat",
    });
  },
});

// Helper internal query to get previous messages
export const getPreviousMessages = internalQuery({
  args: {
    chatId: v.id("chats"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
      .order("desc")
      .collect();
  },
});

// Helper internal mutation to insert a message
export const insertMessage = internalMutation({
  args: {
    chatId: v.id("chats"),
    userMessage: v.string(),
    botResponse: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("messages", {
      chatId: args.chatId,
      userMessage: args.userMessage,
      botResponse: args.botResponse,
      createdAt: Date.now(),
    });
  },
});

// Helper internal mutation to update a message's bot response
export const updateMessage = internalMutation({
  args: {
    messageId: v.id("messages"),
    botResponse: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.messageId, {
      botResponse: args.botResponse,
    });
  },
});

export const generate = action({
  args: {
    chatId: v.optional(v.id("chats")),
    userMessage: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    let chatId: Id<"chats">;
    let formattedPreviousMessages: ChatCompletionMessageParam[] = [];

    if (!userId) {
      return [];
    }

    console.log("args.chatId", args.chatId);

    if (!args.chatId) {
      chatId = await ctx.runMutation(internal.generate.createChat, {
        userId: userId as Id<"users">,
      });
    } else {
      chatId = args.chatId;
      // get the previous messages
      const previousMessages = await ctx.runQuery(
        internal.generate.getPreviousMessages,
        {
          chatId: chatId,
        }
      );

      // Format the previous messages for the LLM
      previousMessages.forEach((message: any) => {
        formattedPreviousMessages.push({
          role: "user",
          content: message.userMessage,
        });
        formattedPreviousMessages.push({
          role: "assistant",
          content: message.botResponse,
        });
      });
    }

    // get the user message
    const userMessage = args.userMessage;

    formattedPreviousMessages.push({
      role: "user",
      content: userMessage,
    });

    const openaiClient = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env.OPENROUTER_API_KEY,
    });

    const completion = await openaiClient.chat.completions.create({
      model: "gpt-4o-mini",
      messages: formattedPreviousMessages,
      stream: true,
    });

    // Create initial message with empty bot response
    const messageId = await ctx.runMutation(internal.generate.insertMessage, {
      chatId: chatId,
      userMessage: userMessage,
      botResponse: "",
    });

    let accumulatedResponse = "";

    for await (const chunk of completion) {
      const chunkContent = chunk.choices[0].delta.content || "";
      // Accumulate the response
      accumulatedResponse += chunkContent;

      // Update the message with the accumulated response
      await ctx.runMutation(internal.generate.updateMessage, {
        messageId: messageId,
        botResponse: accumulatedResponse,
      });
    }
  },
});
