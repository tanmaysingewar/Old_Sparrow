import { Check, CopyIcon, Loader2 } from "lucide-react";
import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";
import RenderPolicies from "./RenderPolicies";
import { getLocalMessages } from "@/store/saveMessages";
import { useSearchParams } from "next/navigation";
import { api } from "../../../convex/_generated/api";
import { useQuery } from "convex/react";
import { Id } from "../../../convex/_generated/dataModel";
import PDFIcon from "@/components/InputArea/assets/pdf";
import ReportIconPNG from "@/assets/report.png";

import { Poppins } from "next/font/google";
import Image from "next/image";
import { useDisplaySetting } from "@/store/displaySetting";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

interface MessageRendererProps {
  content: string;
}

// Copy button component (no changes needed from previous version)
const CopyButton = ({ text }: { text: string }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setIsCopied(true);
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
      });
  };

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;
    if (isCopied) {
      timeoutId = setTimeout(() => {
        setIsCopied(false);
      }, 1000);
    }
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isCopied]);

  return (
    <button
      onClick={handleCopy}
      disabled={isCopied}
      // Adjusted styling: remove absolute positioning, maybe add slight margin
      className={`bg-transparent text-white border-none rounded-sm px-2 py-1 cursor-pointer text-sm transition-opacity duration-200 ${
        isCopied ? "opacity-60 cursor-default" : "hover:opacity-70" // Added active state
      }`}
      aria-label={isCopied ? "Copied!" : "Copy code"}
    >
      {isCopied ? <Check size={16} /> : <CopyIcon size={16} />}
      {/* Slightly smaller icon for the header */}
    </button>
  );
};

const MessageRenderer = ({ content }: MessageRendererProps) => {
  const searchParams = useSearchParams();
  const chatId = searchParams.get("chatId");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [messages, setMessages] = useState<any[]>([]);
  const [fileID, setFileID] = useState("");

  useEffect(() => {
    if (chatId) {
      const messages = getLocalMessages(chatId);
      setMessages(messages);
    }
  }, [chatId]);
  const lastMessage = messages[messages.length - 1];
  const isLastMessage = content === lastMessage?.content;

  const getFileUrl = useQuery(
    api.messages.getFileUrl,
    fileID
      ? {
          storageId: fileID as Id<"_storage">,
        }
      : "skip"
  );

  useEffect(() => {
    // Look for final_response_file code blocks and extract the file_id
    const codeBlockRegex = /```\s*final_response_file\s*\n([\s\S]*?)```/;
    const match = codeBlockRegex.exec(content);
    if (match) {
      try {
        const jsonContent = JSON.parse(match[1].trim());
        if (jsonContent.file_id) {
          setFileID(jsonContent.file_id);
        }
      } catch (error) {
        console.error(
          "Failed to parse file_id from final_response_file block:",
          error
        );
      }
    }
  }, [content, chatId]);

  return (
    <div className={`md:max-w-[710px] max-w-svw`}>
      <section>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            code(props) {
              const { children, className, ...rest } = props;
              const match = /language-(\w+)/.exec(className || "");
              const codeText = String(children).replace(/\n$/, "");
              const language = match ? match[1] : null;

              if (language === "policies") {
                if (isLastMessage) {
                  const json = JSON.parse(codeText);
                  return <RenderPolicies policies={json} />;
                }
                return;
              }

              if (language === "personal_info") {
                return;
              }

              if (language === "final_response_file") {
                return (
                  <div className="mb-2 w-full">
                    <div
                      className={`group flex items-start rounded-xl px-3 py-2 bg-[#f3f3f3] dark:bg-[#424143] w-fit cursor-pointer`}
                      onClick={() => {
                        if (getFileUrl) {
                          window.open(getFileUrl, "_blank");
                        }
                      }}
                    >
                      <LoadFile />
                    </div>
                  </div>
                );
              }

              return match ? (
                <div
                  style={{
                    position: "relative",
                    marginBottom: "1em", // Add space below code blocks
                    clear: "both", // Clear any floating images before code blocks
                  }}
                >
                  {/* Wrapper div for header + code block */}
                  <div
                    style={{
                      backgroundColor: "#282c34", // Matches oneDark background
                      borderRadius: "5px",
                      overflow: "hidden", // Clip children to rounded corners
                    }}
                  >
                    {/* Header */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "0.5em 1em", // Adjust padding as needed
                        backgroundColor: "#3a404a", // Slightly lighter header
                        color: "#d1d5db", // Lighter text for header
                        fontSize: "0.85em", // Smaller font for language
                      }}
                    >
                      {/* Language Name */}
                      <span>{language}</span>

                      {/* Copy Button - Now inside the header */}
                      <CopyButton text={codeText} />
                    </div>

                    {/* Syntax Highlighter */}
                    <SyntaxHighlighter
                      // Add the scrollbar utility classes here
                      className="[&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar]:h-[5px] [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-track]:bg-transparent dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500"
                      style={vscDarkPlus}
                      language={language || "text"} // Provide a fallback language
                      customStyle={{
                        // Your existing styles
                        borderBottomLeftRadius: "5px",
                        borderBottomRightRadius: "5px",
                        borderTopLeftRadius: "0",
                        borderTopRightRadius: "0",
                        backgroundColor: "#282c34",
                        padding: "1em",
                        margin: 0, // Remove default margin

                        // Add overflow and height/maxHeight to enable scrolling
                        overflow: "auto", // Or 'scroll'
                        // maxHeight: "500px", // Adjust this value as needed
                        // Or use a fixed height: height: "500px",
                      }}
                      wrapLongLines={true}
                      wrapLines={true}
                    >
                      {codeText}
                    </SyntaxHighlighter>
                  </div>
                </div>
              ) : (
                <code
                  {...rest}
                  className={`${className} bg-gray-200 dark:bg-gray-700 rounded px-1 py-0.5 text-sm font-firaCode`}
                >
                  {children}
                </code>
              );
            },
            p(props) {
              return (
                <p {...props} className="mb-4 leading-relaxed">
                  {props.children}
                </p>
              );
            },
            // Handle images with fixed width
            img(props) {
              return (
                <img
                  {...props}
                  style={{ width: "300px", height: "auto" }}
                  className="rounded-lg my-4"
                />
              );
            },
            // Add a clearfix div after certain elements to ensure proper layout
            hr(props) {
              return (
                <>
                  <div style={{ clear: "both" }} />
                  <hr
                    {...props}
                    className="my-6 border-gray-300 dark:border-gray-600"
                  />
                </>
              );
            },
          }}
        >
          {content}
        </ReactMarkdown>
        {/* Clear any floating elements at the end */}
        <div style={{ clear: "both" }} />
      </section>
    </div>
  );
};

export default MessageRenderer;

export const LoadFile = () => {
  return (
    <div className="flex items-center space-x-2 ">
      <ReportIcon />
      <div className="flex flex-col">
        <span
          className={`text-sm text-black dark:text-white ${poppins.className}`}
        >
          Final Comparison Report
        </span>
        <span
          className={`text-xs text-neutral-500 dark:text-neutral-400 ${poppins.className}`}
        >
          Report
        </span>
      </div>
    </div>
  );
};

export const ReportIcon = () => {
  return (
    <div>
      <Image
        src={ReportIconPNG}
        height={30}
        width={30}
        alt=""
        className="rounded-full"
      />
    </div>
  );
};
