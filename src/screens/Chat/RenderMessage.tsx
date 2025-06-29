"use client";
import React, { memo, useState } from "react";
import MessageRenderer from "@/screens/Chat/Markdown";
import Spinner from "@/components/Spinner";
import PDFIcon from "@/components/InputArea/assets/pdf";
import DOCIcon from "@/components/InputArea/assets/doc";
import { CheckCircle2, ChevronDown, ChevronRight, Circle } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  preBotResponse: string;
  content: string;
  fileUrl?: string;
  fileType?: string;
  fileName?: string;
  researchItems?: {
    title: string;
    content: string;
    isCompleted: boolean;
  }[];
}

interface RenderMessageProps {
  message: Message;
  index: number;
  messages: Message[];
  chatInitiated: boolean;
  setMessages: (messages: Message[]) => void;
  handleSendMessage: (
    messageContent: string,
    editedMessage: boolean,
    messagesUpToEdit?: Message[]
  ) => Promise<void>;
}

/**
 * Helper function to highlight special words in text
 */
const highlightSpecialWords = (text: string) => {
  // Split the text into words while preserving spaces and punctuation
  return text.split(/(\s+)/).map((word, index) => {
    if (word.includes("#")) {
      return (
        <span
          key={index}
          className="bg-blue-500/30 rounded px-1 py-1 text-sm font-semibold font-lora"
        >
          {word}
        </span>
      );
    } else if (word.includes("@")) {
      return (
        <span
          key={index}
          className="bg-pink-500/30 rounded px-1 py-1 text-sm font-semibold font-lora"
        >
          {word}
        </span>
      );
    } else if (word.includes("$")) {
      return (
        <span
          key={index}
          className="bg-orange-500/30 rounded px-1 py-1 text-sm font-semibold font-lora"
        >
          {word}
        </span>
      );
    }
    return word;
  });
};

const LoadingIndicator = () => {
  const loadingText = "Generating response...";

  return (
    <div className="flex items-center space-x-2">
      <Spinner className="w-5 h-5" />
      <span className="loading-text-shine">{loadingText}</span>
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
        }`}
        style={{
          minHeight: `${
            messages.length - 1 === index &&
            message.role === "user" &&
            chatInitiated
              ? "calc(-300px + 100vh)"
              : messages.length - 1 === index &&
                  message.role === "assistant" &&
                  chatInitiated
                ? "calc(-240px + 100vh)"
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
        }`}
        style={{
          minHeight: `${
            messages.length - 1 === index &&
            chatInitiated &&
            message.role === "user"
              ? "calc(-360px + 100vh)"
              : messages.length - 1 === index &&
                  chatInitiated &&
                  message.role === "assistant"
                ? "calc(-380px + 100vh)"
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
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  const toggleItem = (index: number) => {
    const newExpandedItems = new Set(expandedItems);
    if (newExpandedItems.has(index)) {
      newExpandedItems.delete(index);
    } else {
      newExpandedItems.add(index);
    }
    setExpandedItems(newExpandedItems);
  };

  return (
    <>
      <div>
        {/* User */}
        {message.role === "user" && (
          <div className="ml-auto max-w-full w-fit">
            <div
              className={`rounded-3xl bg-gray-100  dark:text-white rounded-br-lg   font-lora p-2 px-4 dark:bg-[#42414369]`}
            >
              <div className="font-lora">
                <p>{highlightSpecialWords(message.content)}</p>
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
            {/* <div className="flex flex-row justify-end items-end">
                {CopyClicked ? (
                  <Check className="w-4 h-4 m-2" />
                ) : (
                  <CopyIcon
                    className="w-4 h-4 cursor-pointer m-2"
                    onClick={handleCopyClick}
                  />
                )}
              </div> */}
          </div>
        )}

        {/* Bot  */}
        {message.role === "assistant" && (
          <div>
            <div
              className={`p-3 rounded-3xl w-fit max-w-full  dark:bg-transparent dark:text-white rounded-bl-lg mr-auto`}
            >
              {message.content === "Loading..." ? (
                <LoadingIndicator />
              ) : (
                <div className="markdown-content">
                  {message.preBotResponse && (
                    <MessageRenderer
                      key={`${message.preBotResponse}-${Date.now()}-preBotResponse`}
                      content={message.preBotResponse || " "}
                    />
                  )}
                  {message.researchItems?.map((item, index) => {
                    const isExpanded = expandedItems.has(index);
                    return (
                      <div key={index} className="relative mb-3">
                        {/* First CheckCircle2 item */}
                        <div
                          className="flex flex-row justify-start items-center cursor-pointer w-fit select-none"
                          onClick={() => toggleItem(index)}
                        >
                          {item.isCompleted ? (
                            <CheckCircle2 className="w-4 h-4 text-neutral-400" />
                          ) : (
                            <Circle className="w-4 h-4 text-neutral-400" />
                          )}

                          <span className="text-[14px] text-neutral-500 dark:text-neutral-200 ml-1 flex items-center justify-left font-medium truncate w-full">
                            {item.title}
                          </span>
                          {isExpanded ? (
                            <ChevronDown className="w-3 h-3 text-neutral-400 ml-1" />
                          ) : (
                            <ChevronRight className="w-3 h-3 text-neutral-400 ml-1" />
                          )}
                        </div>

                        {/* Content between items - collapsible */}
                        {isExpanded && (
                          <div className="ml-5 my-1">
                            <span className="text-[12px] text-neutral-500 dark:text-neutral-400 block font-medium">
                              {item.content}
                            </span>
                          </div>
                        )}

                        {/* Vertical dashed line spanning the full height */}
                        {index !== (message.researchItems?.length || 0) - 1 && (
                          <div className="absolute left-[7px] top-5 bottom-[-14px] w-0 border-l-1 border-dashed border-gray-300 dark:border-[#4a4a4b]"></div>
                        )}
                      </div>
                    );
                  })}
                  <div className="mt-5"></div>
                  <MessageRenderer
                    key={`${message.content}-${Date.now()}`}
                    content={message.content || " "}
                  />
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
