import { v } from "convex/values";
import { action, internalMutation, internalQuery } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";
import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions.mjs";

// Helper internal mutation to create a new chat
export const createChat = internalMutation({
  args: {
    userId: v.id("users"),
    chatId: v.string(),
    title: v.string(),
    category: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("chats", {
      customChatId: args.chatId,
      userId: args.userId,
      createdAt: Date.now(),
      title: args.title,
      category: args.category,
    });
  },
});

// Helper internal query to get previous messages
export const getPreviousMessages = internalQuery({
  args: {
    chatId: v.string(),
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
    chatId: v.string(),
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

// Helper internal query to get a chat
export const getChat = internalQuery({
  args: {
    chatId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("chats")
      .withIndex("by_custom_chat_id", (q) => q.eq("customChatId", args.chatId))
      .first();
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
    chatId: v.optional(v.string()),
    userMessage: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    let chatId: string;
    let formattedPreviousMessages: ChatCompletionMessageParam[] = [];

    if (!userId) {
      return null;
    }

    console.log("args.chatId", args.chatId);

    // check if the chatId exists in the database and belongs to the user
    const chat = args.chatId
      ? await ctx.runQuery(internal.generate.getChat, {
          chatId: args.chatId,
        })
      : null;

    if (chat && chat.userId !== userId) {
      return null;
    }

    if (!chat) {
      const customChatId = args.chatId || crypto.randomUUID();
      await ctx.runMutation(internal.generate.createChat, {
        chatId: customChatId,
        userId: userId as Id<"users">,
        title: args.userMessage,
        category: "Health Insurance",
      });
      chatId = customChatId;
    } else {
      chatId = chat.customChatId;
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
      model: "google/gemini-2.5-flash",
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
