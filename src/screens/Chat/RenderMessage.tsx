"use client";
import React, { memo, useState, useRef, useEffect } from "react";
import MessageRenderer from "@/screens/Chat/Markdown";
import Spinner from "@/components/Spinner";
import PDFIcon from "@/components/InputArea/assets/pdf";
import DOCIcon from "@/components/InputArea/assets/doc";
import { CheckCircle2, ChevronRight, Circle } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  fileUrl?: string;
  fileType?: string;
  fileName?: string;
  researchItems?: {
    title: string;
    content: string;
    isCompleted?: boolean;
  }[];
  botResponseIndex?: number;
}

interface RenderMessageProps {
  message: Message;
  index: number;
  messages: Message[];
  chatInitiated: boolean;
  setMessages: (messages: Message[]) => void;
}

/**
 * Helper function to highlight special words in text
 */

const LoadingIndicator = () => {
  return (
    <div className="flex items-center space-x-2">
      <Spinner className="w-5 h-5" />
      <span className="loading-text-shine">Generating response...</span>
    </div>
  );
};

const RenderMessageOnScreen = ({
  message,
  index,
  messages,
  chatInitiated,
}: RenderMessageProps) => {
  // const [CopyClicked, setCopyClicked] = useState(false);

  // const handleCopyClick = () => {
  //   setCopyClicked(true);
  //   navigator.clipboard.writeText(message.content);
  //   setTimeout(() => {
  //     setCopyClicked(false);
  //   }, 2000);
  // };

  return (
    <>
      {/* Desktop Message Bubble */}
      <div
        className={`mb-2 hidden md:block font-lora ${
          message.role === "user" ? "ml-auto" : "mr-auto"
        } ${
          messages.length - 1 === index && message.role === "user"
            ? "sticky top-4 z-10"
            : ""
        }`}
        style={{
          minHeight: `${
            messages.length - 1 === index && message.role === "assistant"
              ? "calc(-200px + 100vh)"
              : "auto"
          }`,
        }}
      >
        <MessageBubble message={message} />
      </div>

      {/* Mobile Message Bubble */}
      <div
        className={`mb-2 block md:hidden font-lora ${
          message.role === "user" ? "ml-auto" : "mr-auto"
        } ${
          messages.length - 1 === index &&
          chatInitiated &&
          message.role === "user"
            ? "sticky top-4 z-10"
            : ""
        }`}
        style={{
          minHeight: `${
            messages.length - 1 === index &&
            chatInitiated &&
            message.role === "assistant"
              ? "calc(-400px + 100vh)"
              : "auto"
          }`,
        }}
      >
        <MessageBubble message={message} />
      </div>
    </>
  );
};

const MessageBubble = ({ message }: { message: Message }) => {
  const [itemHeights, setItemHeights] = useState<{ [key: number]: number }>({});
  const contentRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  useEffect(() => {
    // Calculate heights for all research items
    const heights: { [key: number]: number } = {};
    message.researchItems?.forEach((_, index) => {
      const contentElement = contentRefs.current[index];
      if (contentElement) {
        heights[index] = contentElement.scrollHeight;
      }
    });
    setItemHeights(heights);
  }, [message.researchItems]);

  return (
    <>
      <div className="h-full">
        {/* User */}
        {message.role === "user" && (
          <div className="ml-auto max-w-full w-fit">
            <div
              className={`rounded-3xl bg-gray-100 dark:text-white rounded-br-lg font-lora p-2 px-4 dark:bg-[#42414369]`}
            >
              <div className="font-lora">
                <p>{message.content.replace(/```[\s\S]*?```/g, "")}</p>
              </div>
            </div>
            {message.fileUrl && (
              <div className="mt-1 flex flex-row items-end ml-auto w-full">
                {message.fileType?.startsWith("image/") ? (
                  <div className="relative">
                    <img
                      key={`${message.fileUrl}-${Date.now()}`}
                      src={message.fileUrl}
                      alt={message.fileName || "Uploaded image"}
                      className="max-w-[300px] max-h-[200px] object-cover rounded-lg border cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() =>
                        message.fileUrl &&
                        window.open(message.fileUrl, "_blank")
                      }
                      title="Click to open in new tab"
                      onError={(e) => {
                        console.error("Image failed to load:", message.fileUrl);
                        e.currentTarget.src = ""; // Clear the src on error
                      }}
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      {message.fileName}
                    </div>
                  </div>
                ) : (
                  <div className="mb-2 w-full ml-auto max-w-[250px]">
                    <div
                      className={`flex items-end rounded-xl px-3 py-2 bg-[#f3f3f3] dark:bg-[#42414369] w-fit`}
                    >
                      <div className="flex items-center space-x-2 mr-10">
                        {message.fileType === "application/pdf" ? (
                          <PDFIcon className="w-8 h-8" />
                        ) : (
                          <DOCIcon className="w-8 h-8" />
                        )}
                        <div className="flex flex-col">
                          <span
                            className={`text-sm text-white dark:text-white truncate max-w-[145px]`}
                          >
                            {message.fileName}
                          </span>
                          <span className="text-xs text-neutral-500 dark:text-neutral-400">
                            {message.fileType?.split("/")[1].toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Bot  */}
        {message.role === "assistant" && (
          <div>
            <div
              className={`p-3 rounded-3xl w-fit max-w-full dark:bg-transparent dark:text-white rounded-bl-lg mr-auto mb-[-25px]`}
            >
              {message.content === "Loading..." ? (
                <LoadingIndicator />
              ) : (
                <div className="markdown-content">
                  <MessageRenderer
                    key={`${message.content}-${Date.now()}`}
                    content={message.content || " "}
                  />
                  {message.researchItems?.map((item, index) => {
                    // const isExpanded = expandedItems.has(index);
                    return (
                      <ResearchProcess
                        key={index}
                        item={item}
                        index={index}
                        itemHeights={itemHeights}
                        contentRefs={contentRefs.current}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

// Create the memoized version of the component
const MemoizedRenderMessageOnScreen = memo(RenderMessageOnScreen);

export default MemoizedRenderMessageOnScreen;

const ResearchProcess = ({
  item,
  index,
  itemHeights,
  contentRefs,
}: {
  item: {
    title: string;
    content: string;
    isCompleted?: boolean;
  };
  index: number;
  itemHeights: { [key: number]: number };
  contentRefs: { [key: number]: HTMLDivElement | null } | null;
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const toggleItem = () => {
    setIsExpanded(!isExpanded);
  };
  return (
    <div key={index} className="relative mb-3">
      {/* First CheckCircle2 item */}
      <div
        className="flex flex-row justify-start items-center cursor-pointer w-fit select-none"
        onClick={toggleItem}
      >
        {item.isCompleted ? (
          <CheckCircle2 className="w-4 h-4 text-neutral-400" />
        ) : (
          <Circle className="w-4 h-4 text-neutral-400" />
        )}

        <span className="text-[14px] text-neutral-500 dark:text-neutral-200 ml-1 flex items-center justify-left font-medium truncate w-full">
          {item.title}
        </span>
        <ChevronRight
          className={`w-3 h-3 text-neutral-400 ml-1 transition-transform duration-200 ${
            isExpanded ? "rotate-90" : "rotate-0"
          }`}
        />
      </div>

      {/* Content between items - collapsible with animation only on collapse */}
      <div
        className={`ml-5 overflow-hidden ${
          isExpanded
            ? "opacity-100 my-1 transition-all duration-200"
            : "opacity-0 my-0 transition-all duration-200"
        }`}
        style={{
          height: isExpanded ? `${itemHeights[index] || 0}px` : "0px",
        }}
      >
        <div
          ref={(el) => {
            if (contentRefs) {
              contentRefs[index] = el;
            }
          }}
          className="py-1"
        >
          <div className="text-[12px] text-neutral-500 dark:text-neutral-400 block font-medium mb-[-20px]">
            {/* {item.content} */}
            <MessageRenderer
              key={`${item.content}-${Date.now()}`}
              content={item.content || " "}
            />
          </div>
        </div>
      </div>

      {/* Vertical dashed line spanning the full height */}
      {index !== (Object.keys(itemHeights).length || 0) - 1 && (
        <div className="absolute left-[7px] top-5 bottom-[-14px] w-0 border-l-1 border-dashed border-gray-300 dark:border-[#4a4a4b]"></div>
      )}
    </div>
  );
};
