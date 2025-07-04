import { Check, CopyIcon } from "lucide-react";
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

import { Poppins } from "next/font/google";

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
      <svg
        version="1.1"
        id="Layer_1"
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        x="0px"
        y="0px"
        width="46"
        height="46"
        viewBox="0 0 960 960"
        xmlSpace="preserve"
      >
        <g>
          <g>
            <path
              fill="#33B98C"
              d="M621.9,813.4H146.3V146.6h475.5c16.3,0,29.5,13.2,29.5,29.5v607.8C651.3,800.2,638.1,813.4,621.9,813.4z"
            />
            <path
              fill="#F2F2F2"
              d="M558.8,457.9H310.2c-8.8,0-16-7.2-16-16v-146c0-8.8,7.2-16,16-16h248.6c8.8,0,16,7.2,16,16v146
			C574.8,450.7,567.7,457.9,558.8,457.9z"
            />
            <path
              fill="#FBB03B"
              d="M674.5,305h-23.2V194.4h23.2c7.9,0,14.4,6.4,14.4,14.4v81.8C688.9,298.5,682.5,305,674.5,305z"
            />
            <path
              fill="#F7931E"
              d="M674.5,429.1h-23.2V318.6h23.2c7.9,0,14.4,6.4,14.4,14.4v81.8C688.9,422.7,682.5,429.1,674.5,429.1z"
            />
            <path
              fill="#F15A24"
              d="M674.5,555.2h-23.2V444.6h23.2c7.9,0,14.4,6.4,14.4,14.4v81.8C688.9,548.8,682.5,555.2,674.5,555.2z"
            />
            <path
              fill="#C1272D"
              d="M674.5,683.1h-23.2V572.5h23.2c7.9,0,14.4,6.4,14.4,14.4v81.8C688.9,676.7,682.5,683.1,674.5,683.1z"
            />
            <rect
              x="146.3"
              y="146.6"
              fill="#135468"
              width="69.3"
              height="666.7"
            />
            <rect
              x="343.6"
              y="323.5"
              fill="#135468"
              width="183.3"
              height="15.3"
            />
            <rect
              x="343.6"
              y="358.6"
              fill="#135468"
              width="183.3"
              height="15.3"
            />
            <rect
              x="343.6"
              y="393.6"
              fill="#135468"
              width="183.3"
              height="15.3"
            />
          </g>
          <g>
            <ellipse
              transform="matrix(1 -3.676774e-03 3.676774e-03 1 -2.4737 2.4287)"
              fill="#FFFFFF"
              cx="659.3"
              cy="674"
              rx="110.2"
              ry="110.2"
            />
            <ellipse
              transform="matrix(1 -3.676774e-03 3.676774e-03 1 -2.4737 2.4287)"
              fill="#D1B07C"
              cx="659.3"
              cy="674"
              rx="82"
              ry="82"
            />
            <path
              fill="#A67C52"
              d="M593.5,688.5c-0.2-45.3,36.4-82.1,81.7-82.3c14.5-0.1,28.2,3.7,40.1,10.3c-14.7-13.7-34.5-22.1-56.2-22
			c-45.3,0.2-81.8,37-81.7,82.3c0.1,30.7,17.1,57.4,42.2,71.4C603.6,733.2,593.6,712,593.5,688.5z"
            />
            <path
              fill="#FFFFFF"
              d="M799.8,655.1l-39.6,0.1c-7.7,0-13.8,6.3-13.8,13.9v2.5c0,7.7,6.3,13.8,13.9,13.8l39.6-0.1
			c7.7,0,13.8-6.3,13.8-13.9v-2.5C813.6,661.2,807.4,655.1,799.8,655.1z"
            />
          </g>
        </g>
      </svg>
    </div>
  );
};
