import { v } from "convex/values";
import {
  action,
  internalMutation,
  internalQuery,
  ActionCtx,
} from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "./_generated/dataModel";
import { api, internal } from "./_generated/api";
import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions.mjs";
import {
  BOT_POLICIES_SELECTION_PROMPT,
  INITIAL_BOT_PROMPT,
  POLICIES_WORDINGS_URLS,
  POLICY_COMPARISON_PROMPT,
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

export const updateChatTitle = internalMutation({
  args: {
    customChatId: v.string(),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    if (!args.customChatId) {
      return;
    }

    // Find the chat by customChatId
    const chat = await ctx.db
      .query("chats")
      .withIndex("by_custom_chat_id", (q) =>
        q.eq("customChatId", args.customChatId)
      )
      .first();

    if (!chat) {
      return;
    }

    return await ctx.db.patch(chat._id, {
      title: args.title || "Initial Inquiry",
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
    model: "anthropic/claude-sonnet-4",
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

  // reduce the credits
  await ctx.runMutation(api.coupon.useCredits, {
    amount: 5,
  });

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

  await ctx.runMutation(api.chats.disableChat, {
    chatId: args.chatId,
    isDisabled: true,
  });

  await ctx.runMutation(internal.generate.updateChatTitle, {
    customChatId: args.chatId,
    title: "Policy Selection",
  });

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
        title: "Initial Inquiry",
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

    // check if the user has enough credits
    const userCredits = await ctx.runQuery(api.coupon.getUserCredits, {});
    if (userCredits === null || userCredits < 50) {
      // TODO: Send the user a message that they have insufficient credits
      await ctx.runMutation(internal.generate.insertMessage, {
        chatId: chatId,
        userMessage: args.userMessage,
        botResponses: [
          {
            response:
              "I'm sorry, but you don't have enough credits to use this service. Please add more credits to your account.",
            researchItems: [],
          },
        ],
      });
      return;
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
        | {
            city: string;
            age: string;
            pre_existing_diseases: string;
            specific_questions: string;
            other_info: string;
            gender: string;
          }
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

      await ctx.runMutation(internal.generate.updateChatTitle, {
        customChatId: chatId,
        title: "Researching the policies",
      });

      //   --------- Step 1: Customize the questions as per the info provided by user ---------
      const messageId = await ctx.runMutation(internal.generate.insertMessage, {
        chatId: chatId,
        userMessage: args.userMessage,
        botResponses: [
          {
            response:
              "Give me a few minutes to research the policies, then I'll get back to you with a comprehensive analysis of your selected health insurance plans.",
            researchItems: [
              {
                title:
                  "Customize the questions as per the user the user requirements",
                content:
                  "Customize and personalize the questioning framework based on the specific information, preferences, and requirements that the user has shared in their queries, ensuring that each question is directly relevant to their unique needs and situation.",
                isCompleted: false,
              },
            ],
          },
        ],
      });

      // Customize the questions as per the info provided by user
      const USER_QUERY = `User Personal Info:
        City: ${personalInfoJsonObject?.city}
        Age: ${personalInfoJsonObject?.age}
        Gender: ${personalInfoJsonObject?.gender}
        Pre Existing Diseases: ${personalInfoJsonObject?.pre_existing_diseases}
        Other Info: ${personalInfoJsonObject?.other_info}
        Specific Questions: ${personalInfoJsonObject?.specific_questions}

        - Customize the questions as per the user requirements
        - While answering the questions, make sure use the user information to answer the questions
        Here are question that need to be answered:
        ${POLICY_QUESTIONS_PROMPT}
        `;

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
          title: "Generating the comparison report",
          content:
            "Generate a comprehensive comparison report that highlights the key features, benefits, and limitations of the selected health insurance plans, ensuring that the user can easily understand the differences between the plans and make an informed decision.",
          isCompleted: false,
        },
      });

      // map the POLICIES_WORDINGS_URLS with the selectedPoliciesJsonObject
      // Extract the id values from the selected policies array and convert to strings
      const selectedPolicyIds = selectedPoliciesJsonObject.policies.map(
        (policy: { id: number }) => policy.id.toString()
      );
      console.log("selectedPolicyIds", selectedPolicyIds);

      const policiesWordings = POLICIES_WORDINGS_URLS.filter((policy) => {
        return selectedPolicyIds.includes(policy.id);
      }).map((policy) => {
        return {
          policy_name: policy.name,
          policy_description: policy.description,
          policy_pdf_url: policy.pdf_url,
          policy_logo: policy.logo,
        };
      });

      console.log("policiesWordings", policiesWordings);

      await ctx.runMutation(internal.generate.updateChatTitle, {
        customChatId: chatId,
        title: "Generating the comparison report",
      });

      //   --------- Step 2: Shoot the API call to LLM with the Policy and questions ---------
      // Call the Node.js action to process policies with LLM
      const comparisonResponse = await ctx.runAction(
        (internal as any).pdfActions.processPoliciesWithLLM,
        {
          policiesWordings: policiesWordings,
          userQuery: USER_QUERY,
        }
      );

      await ctx.runMutation(internal.generate.completeResearchItem, {
        messageId: messageId,
        responseIndex: 0,
        researchItemIndex: 1,
      });

      // TODO: Convert the final response to markdown then PDF

      await ctx.runMutation(internal.generate.insertResearchItem, {
        messageId: messageId,
        responseIndex: 0,
        researchItemIndex: 2,
        researchItem: {
          title: "Generating the final response",
          content:
            "Generate a final response that summarizes the key findings, recommendations, and next steps for the user, ensuring that the user can easily understand the implications of their selected health insurance plans and make an informed decision.",
          isCompleted: false,
        },
      });

      //   --------- Step 3: Convert the final response to markdown then PDF ---------
      const finalResponseFileId = await ctx.runAction(
        (internal as any).pdfActions.convertToHTML,
        {
          comparisonResponse: comparisonResponse,
        }
      );

      await ctx.runMutation(internal.generate.completeResearchItem, {
        messageId: messageId,
        responseIndex: 0,
        researchItemIndex: 2,
      });

      await ctx.runMutation(internal.generate.updateChatTitle, {
        customChatId: chatId,
        title: "Final Response Generated",
      });

      // reduce the credits
      await ctx.runMutation(api.coupon.useCredits, {
        amount: 60,
      });

      // TODO: Send the final response to the user
      await ctx.runMutation(internal.generate.insertBotResponse, {
        messageId: messageId,
        response: `Here is the final response: 
\`\`\` final_response_file
{
  "file_id": "${finalResponseFileId}"
}
\`\`\`
`,
        researchItems: [],
      });
    }
  },
});
