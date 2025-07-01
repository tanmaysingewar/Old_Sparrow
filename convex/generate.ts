import { v } from "convex/values";
import {
  action,
  internalMutation,
  internalQuery,
  ActionCtx,
} from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";
import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions.mjs";
import {
  BOT_POLICIES_SELECTION_PROMPT,
  INITIAL_BOT_PROMPT,
  POLICY_QUESTIONS_PROMPT,
} from "./prompts";

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

// Helper internal mutation to insert a bot response
export const insertBotResponse = internalMutation({
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

// Helper internal mutation to insert a research item
export const insertResearchItem = internalMutation({
  args: {
    messageId: v.id("messages"),
    responseIndex: v.number(),
    researchItemIndex: v.number(),
    researchItem: v.object({
      title: v.string(),
      content: v.string(),
      isCompleted: v.optional(v.boolean()),
    }),
  },
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.messageId);
    // Update the research item at the given index
    if (!message) {
      return;
    }
    const botResponses = message.botResponses || [];
    if (botResponses.length > args.responseIndex) {
      botResponses[args.responseIndex].researchItems = [
        ...(botResponses[args.responseIndex].researchItems || []),
        args.researchItem,
      ];
    }
    return await ctx.db.patch(args.messageId, {
      botResponses: botResponses,
    });
  },
});

// Helper internal mutation to complete a research item
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

// Helper function to handle the initial bot response
const handleInitialBotResponse = async (
  ctx: ActionCtx,
  openaiClient: OpenAI,
  formattedPreviousMessages: ChatCompletionMessageParam[],
  args: { chatId: string; userMessage: string }
) => {
  // get the user message
  let userMessage = args.userMessage;

  formattedPreviousMessages.push({
    role: "user",
    content: userMessage,
  });

  console.log(formattedPreviousMessages);

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
  const jsonObject = initialBotResponse.match(
    /```personal_info\n{[\s\S]*?}\n```/g
  );

  // Create initial message with preBotResponse bot responses
  const messageId = await ctx.runMutation(internal.generate.insertMessage, {
    chatId: args.chatId,
    userMessage: userMessage,
    botResponses: [
      {
        response: initialBotResponse,
        researchItems: [],
      },
    ],
  });

  // if json is not there then break the flow
  if (!jsonObject) {
    return;
  }

  // Extract just the JSON content from the markdown code block
  const jsonContent = jsonObject[0]
    .replace(/```personal_info\n/, "")
    .replace(/\n```$/, "");
  const jsonObjectJson = JSON.parse(jsonContent);
  console.log(jsonObjectJson);

  // Send the policies selection prompt
  await ctx.runMutation(internal.generate.insertBotResponse, {
    messageId: messageId,
    response: BOT_POLICIES_SELECTION_PROMPT,
    researchItems: [],
  });

  return;
};

// Main action to generate the bot response
export const generate = action({
  args: {
    chatId: v.optional(v.string()),
    userMessage: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    let chatId: string;
    let formattedPreviousMessages: ChatCompletionMessageParam[] = [];

    const openaiClient = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env.OPENROUTER_API_KEY,
    });

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

    // ------------ Function to handle the initial bot response -------------------------

    let selectedPoliciesJsonObject;

    // check for the ```selected_policies``` in the user message
    const selectedPolicies = args.userMessage.match(
      /```selected_policies\s*\n\s*{[\s\S]*?}\s*\n\s*```/g
    );

    console.log("selectedPolicies", selectedPolicies);
    if (selectedPolicies && selectedPolicies.length > 0) {
      const selectedPoliciesJson = selectedPolicies[0];
      const selectedPoliciesJsonString = selectedPoliciesJson
        .replace(/```selected_policies\s*\n\s*/, "")
        .replace(/\s*\n\s*```$/, "");
      selectedPoliciesJsonObject = JSON.parse(selectedPoliciesJsonString);
      console.log("selectedPoliciesJsonObject", selectedPoliciesJsonObject);
    }

    if (!selectedPoliciesJsonObject) {
      await handleInitialBotResponse(
        ctx,
        openaiClient,
        formattedPreviousMessages,
        { chatId, userMessage: args.userMessage }
      );
      return;
    } else {
      let personalInfoJsonObject:
        | { city: string; age: string; prd: string; specific_questions: string }
        | undefined;

      formattedPreviousMessages.map((message) => {
        if (message.role === "assistant") {
          const rawJSONObject = message.content
            ?.toString()
            .match(/```personal_info\n{[\s\S]*?}\n```/g);
          const jsonContent = rawJSONObject?.[0]
            .replace(/```personal_info\n/, "")
            .replace(/\n```$/, "");
          if (jsonContent) {
            personalInfoJsonObject = JSON.parse(jsonContent);
          }
        }
      });

      console.log("personalInfoJsonObject", personalInfoJsonObject);

      // TODO: Do the research
      const messageId = await ctx.runMutation(internal.generate.insertMessage, {
        chatId: chatId,
        userMessage: args.userMessage,
        botResponses: [
          {
            response:
              "Just give me few minutes to research the policies and then I will get back to you with the best options",
            researchItems: [
              {
                title:
                  "Customize the questions as per the user provided queries",
                content: "Crafting the questions",
                isCompleted: false,
              },
            ],
          },
        ],
      });

      // TODO: Customize the questions as per the info provided by user

      const All_Questions =
        POLICY_QUESTIONS_PROMPT +
        "User personal question:" +
        personalInfoJsonObject?.specific_questions;

      //   Create the research items
      await ctx.runMutation(internal.generate.completeResearchItem, {
        messageId: messageId,
        responseIndex: 0,
        researchItemIndex: 0,
      });

      // TODO: Update the research item
      await ctx.runMutation(internal.generate.insertResearchItem, {
        messageId: messageId,
        responseIndex: 0,
        researchItemIndex: 1,
        researchItem: {
          title: "Shoot the API call to LLM with the Policy and questions",
          content: "Shooting the API call to LLM with the Policy and questions",
          isCompleted: false,
        },
      });
      // TODO: Parallel - Shoot the API call to LLM with the Policy and questions
      const completion = await openaiClient.chat.completions.create({
        model: "deepseek/deepseek-r1-0528",
        messages: [
          { role: "system", content: "You are a helpful assistant" },
          {
            role: "user",
            content: "I have selected the following policies: ",
          },
        ],
      });

      await ctx.runMutation(internal.generate.completeResearchItem, {
        messageId: messageId,
        responseIndex: 0,
        researchItemIndex: 1,
      });

      // TODO: Make the another call to LLM combine all the responses and give the final response

      // TODO: Convert the final response to markdown then PDF

      // TODO: Send the final response to the user
    }

    // ----------- Function to handle the initial bot response --------------------------

    // Add the first bot response with research items
    // await ctx.runMutation(internal.generate.updateBotResponseAtIndex, {
    //   messageId: messageId,
    //   responseIndex: 2,
    //   response: "I am working on it",
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
    //       isCompleted: false,
    //     },
    //   ],
    // });

    // TODO: Complete the research item
    // await ctx.runMutation(internal.generate.completeResearchItem, {
    //   messageId: messageId,
    //   responseIndex: 1,
    //   researchItemIndex: 2,
    // });

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
