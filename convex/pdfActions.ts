"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import OpenAI from "openai";
import { comparisonReport, POLICY_COMPARISON_PROMPT } from "./prompts";
import { marked } from "marked";

export const encodePDFToBase64 = async (pdfUrl: string): Promise<string> => {
  try {
    const response = await fetch(pdfUrl);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch PDF: ${response.status} ${response.statusText}`
      );
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64PDF = buffer.toString("base64");
    return `data:application/pdf;base64,${base64PDF}`;
  } catch (error) {
    console.error("Error encoding PDF to base64:", error);
    throw error;
  }
};

export const processPoliciesWithLLM = action({
  args: {
    policiesWordings: v.array(
      v.object({
        policy_name: v.string(),
        policy_description: v.string(),
        policy_pdf_url: v.string(),
        policy_logo: v.string(),
      })
    ),
    userQuery: v.string(),
  },
  handler: async (ctx, args) => {
    const openaiClient = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env.OPENROUTER_API_KEY,
    });

    //   --------- Shoot the API call to LLM with the Policy and questions ---------
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let content: any[] = [
      {
        type: "text",
        text: args.userQuery,
      },
    ];
    await Promise.all(
      args.policiesWordings.map(async (policy) => {
        const base64PDF = await encodePDFToBase64(policy.policy_pdf_url);
        content.push({
          type: "file",
          file: {
            filename: policy.policy_name + ".pdf",
            file_data: base64PDF,
          },
        });
      })
    );

    const completion = await openaiClient.chat.completions.create({
      model: "google/gemini-2.5-flash",
      messages: [
        {
          role: "system",
          content: POLICY_COMPARISON_PROMPT,
        },
        {
          role: "user",
          content: content,
        },
      ],
    });

    return completion.choices[0].message.content;
  },
});

export const convertToHTML = action({
  args: {
    comparisonResponse: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      // Convert markdown to HTML
      const htmlContent = await marked(args.comparisonResponse);

      // Create a print-ready HTML document
      const printReadyHtml = comparisonReport(htmlContent);

      // Store the HTML file
      const htmlFileId = await ctx.storage.store(
        new Blob([printReadyHtml], {
          type: "text/html",
        })
      );

      return htmlFileId;
    } catch (error) {
      console.error("Error converting markdown to HTML:", error);
      throw error;
    }
  },
});
