import { v } from "convex/values";
import { action, internalMutation, internalQuery } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";
import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions.mjs";
import { BOT_POLICIES_SELECTION_PROMPT, INITIAL_BOT_PROMPT } from "./prompts";

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
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("messages", {
      chatId: args.chatId,
      userMessage: args.userMessage,
      botResponses: args.botResponses || [],
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

// Helper internal mutation to update bot responses
export const updateBotResponses = internalMutation({
  args: {
    messageId: v.id("messages"),
    botResponses: v.array(
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
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.messageId, {
      botResponses: args.botResponses,
    });
  },
});

export const addOnlyBotResponse = internalMutation({
  args: {
    messageId: v.id("messages"),
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
  },
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.messageId);
    if (!message) {
      return;
    }
    const currentBotResponses = message.botResponses || [];
    const newBotResponse = {
      response: args.response,
      researchItems: args.researchItems,
    };
    return await ctx.db.patch(args.messageId, {
      botResponses: [...currentBotResponses, newBotResponse],
    });
  },
});

export const updateBotResponseAtIndex = internalMutation({
  args: {
    messageId: v.id("messages"),
    responseIndex: v.number(),
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
  },
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.messageId);
    if (!message) {
      return;
    }
    const botResponses = message.botResponses || [];
    if (botResponses.length > args.responseIndex) {
      botResponses[args.responseIndex].response = args.response;
      botResponses[args.responseIndex].researchItems = args.researchItems;
    }
    return await ctx.db.patch(args.messageId, {
      botResponses: botResponses,
    });
  },
});

export const completeResearchItem = internalMutation({
  args: {
    messageId: v.id("messages"),
    responseIndex: v.number(),
    researchItemIndex: v.number(),
  },
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.messageId);
    if (!message) {
      return;
    }
    const botResponses = message.botResponses || [];
    if (
      botResponses.length > args.responseIndex &&
      botResponses[args.responseIndex].researchItems &&
      botResponses[args.responseIndex].researchItems!.length >
        args.researchItemIndex
    ) {
      botResponses[args.responseIndex].researchItems![
        args.researchItemIndex
      ].isCompleted = true;
    }
    return await ctx.db.patch(args.messageId, {
      botResponses: botResponses,
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
        // Concatenate all bot responses for this message
        const allBotResponses = message.botResponses || [];
        const combinedBotResponse = allBotResponses
          .map((botResponse: any) => botResponse.response)
          .join("\n\n");

        formattedPreviousMessages.push({
          role: "assistant",
          content: combinedBotResponse,
        });
        formattedPreviousMessages.push({
          role: "user",
          content: message.userMessage,
        });
      });
      formattedPreviousMessages.reverse();
    }

    // get the user message
    const userMessage = args.userMessage;

    formattedPreviousMessages.push({
      role: "user",
      content: userMessage,
    });

    console.log(formattedPreviousMessages);

    const openaiClient = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env.OPENROUTER_API_KEY,
    });

    let initialBotResponse = "";

    // TODO: Generate the initial bot response
    const completion_initial = await openaiClient.chat.completions.create({
      model: "deepseek/deepseek-r1-0528",
      messages: [
        {
          role: "system",
          content: INITIAL_BOT_PROMPT,
        },
        ...formattedPreviousMessages,
      ],
      stream: true,
    });

    for await (const chunk of completion_initial) {
      const chunkContent = chunk.choices[0].delta.content || "";
      // Accumulate the response
      initialBotResponse += chunkContent;
    }

    // get and remove the json object from the initial bot response
    const jsonObject = initialBotResponse.match(/```json\n{[\s\S]*?}\n```/g);
    if (jsonObject && jsonObject.length > 0) {
      const jsonObjectString = jsonObject[0];
      initialBotResponse = initialBotResponse.replace(jsonObjectString, "");
    }

    // Create initial message with preBotResponse bot responses
    const messageId = await ctx.runMutation(internal.generate.insertMessage, {
      chatId: chatId,
      userMessage: userMessage,
      botResponses: [
        {
          response: initialBotResponse,
          researchItems: [],
        },
      ],
    });

    // const completion = await openaiClient.chat.completions.create({
    //   model: "google/gemini-2.5-flash",
    //   messages: formattedPreviousMessages,
    //   stream: true,
    // });

    // if json is not there then break the flow
    if (!jsonObject) {
      return;
    }

    // Extract just the JSON content from the markdown code block
    const jsonContent = jsonObject[0]
      .replace(/```json\n/, "")
      .replace(/\n```$/, "");
    const jsonObjectJson = JSON.parse(jsonContent);
    console.log(jsonObjectJson);

    // TODO: Do the research

    // TODO: Generate the research items
    await ctx.runMutation(internal.generate.addOnlyBotResponse, {
      messageId: messageId,
      response: BOT_POLICIES_SELECTION_PROMPT,
      researchItems: [],
    });

    // Add the first bot response with research items
    await ctx.runMutation(internal.generate.updateBotResponseAtIndex, {
      messageId: messageId,
      responseIndex: 2,
      response: "I am working on it",
      researchItems: [
        {
          title: "Research current health insurance landscape and options",
          content:
            "Navigating the world of health insurance can be complex, but understanding your options is crucial for securing the best coverage for your needs. This comprehensive guide aims to demystify health insurance, providing you with the knowledge and strategies to make informed decisions. We will cover various types of health insurance plans, key factors to consider when choosing a plan, and effective comparison strategies.",
          isCompleted: true,
        },
        {
          title: "Research the best health insurance plans for you",
          content:
            "Navigating the world of health insurance can be complex, but understanding your options is crucial for securing the best coverage for your needs. This comprehensive guide aims to demystify health insurance, providing you with the knowledge and strategies to make informed decisions. We will cover various types of health insurance plans, key factors to consider when choosing a plan, and effective comparison strategies.",
          isCompleted: true,
        },
        {
          title: "Research the best health insurance plans for your family",
          content:
            "Navigating the world of health insurance can be complex, but understanding your options is crucial for securing the best coverage for your needs. This comprehensive guide aims to demystify health insurance, providing you with the knowledge and strategies to make informed decisions. We will cover various types of health insurance plans, key factors to consider when choosing a plan, and effective comparison strategies.",
          isCompleted: false,
        },
      ],
    });

    // TODO: Complete the research item
    await ctx.runMutation(internal.generate.completeResearchItem, {
      messageId: messageId,
      responseIndex: 1,
      researchItemIndex: 2,
    });

    // let accumulatedResponse = "";

    // // TODO: Add the Final Bot Response
    // let isFirstChunk = true;

    // for await (const chunk of completion) {
    //   const chunkContent = chunk.choices[0].delta.content || "";
    //   // Accumulate the response
    //   accumulatedResponse += chunkContent;

    //   if (isFirstChunk) {
    //     // Add the second bot response for the streaming content
    //     await ctx.runMutation(internal.generate.addOnlyBotResponse, {
    //       messageId: messageId,
    //       response: accumulatedResponse,
    //     });
    //     isFirstChunk = false;
    //   } else {
    //     // Update the second bot response with the accumulated content
    //     await ctx.runMutation(internal.generate.updateBotResponseAtIndex, {
    //       messageId: messageId,
    //       responseIndex: 1,
    //       response: accumulatedResponse,
    //     });
    //   }
    // }
  },
});
