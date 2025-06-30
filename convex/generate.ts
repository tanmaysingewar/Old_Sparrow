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
          content: `
# Old Sparrow - Health Insurance Advisor

You are Old Sparrow, a wise and caring health Insurance Advisor with a warm, conversational personality. Your ONLY role is to collect required user information through natural conversation.

## Required Information to Collect:
1. **Age** - User's current age in years
2. **City** - User's current city of residence 
3. **Pre-existing diseases** - Any current medical conditions, chronic illnesses, or ongoing health issues

## Optional Information:
4. **Specific questions/concerns** - Any particular health topics they want to know about

## Response Guidelines:

### When Information is Missing:
- Greet warmly as Old Sparrow if it's the first interaction
- Identify which specific required fields are missing
- Ask ONLY for the missing information in a natural, conversational way
- Ask all the missing information in the same message.
- Use - for asking the missing information.
- Vary your language and approach to feel personal and engaging
- Be encouraging and patient

### When All Required Information is Complete:
Provide a personalized acknowledgment that:
- Thanks them warmly
- Mentions you're working on their personalized guidance
- References their specific age, city, and health profile naturally
- Asks them to wait while you prepare their information

## Personality Traits:
- Wise but approachable
- Caring and empathetic
- Uses natural, varied language
- Feels like talking to a knowledgeable friend
- Patient and understanding

## Important Rules:
- NEVER provide health advice or information beyond collecting data
- Only ask for missing required fields, not all fields every time
- Make each interaction feel personal and unique
- Always validate all three required fields before acknowledgment
- Do not engage in topics outside of information collection
 `,
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

    const completion = await openaiClient.chat.completions.create({
      model: "google/gemini-2.5-flash",
      messages: formattedPreviousMessages,
      stream: true,
    });

    // TODO: Do the research

    // TODO: Generate the research items
    // Add the first bot response with research items
    // await ctx.runMutation(internal.generate.updateBotResponseAtIndex, {
    //   messageId: messageId,
    //   responseIndex: 0,
    //   response: initialBotResponse,
    //   researchItems: [
    //     {
    //       title: "Research current health insurance landscape and options",
    //       content:
    //         "Navigating the world of health insurance can be complex, but understanding your options is crucial for securing the best coverage for your needs. This comprehensive guide aims to demystify health insurance, providing you with the knowledge and strategies to make informed decisions. We will cover various types of health insurance plans, key factors to consider when choosing a plan, and effective comparison strategies.",
    //       isCompleted: true,
    //     },
    //     {
    //       title: "Research the best health insurance plans for you",
    //       content:
    //         "Navigating the world of health insurance can be complex, but understanding your options is crucial for securing the best coverage for your needs. This comprehensive guide aims to demystify health insurance, providing you with the knowledge and strategies to make informed decisions. We will cover various types of health insurance plans, key factors to consider when choosing a plan, and effective comparison strategies.",
    //       isCompleted: true,
    //     },
    //     {
    //       title: "Research the best health insurance plans for your family",
    //       content:
    //         "Navigating the world of health insurance can be complex, but understanding your options is crucial for securing the best coverage for your needs. This comprehensive guide aims to demystify health insurance, providing you with the knowledge and strategies to make informed decisions. We will cover various types of health insurance plans, key factors to consider when choosing a plan, and effective comparison strategies.",
    //       isCompleted: true,
    //     },
    //   ],
    // });

    // TODO: Complete the research item
    await ctx.runMutation(internal.generate.completeResearchItem, {
      messageId: messageId,
      responseIndex: 0,
      researchItemIndex: 0,
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
