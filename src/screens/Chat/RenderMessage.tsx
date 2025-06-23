"use client";
import React, { useState, useRef, useEffect, useCallback, memo } from "react";
import { Check, CopyIcon } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import MessageRenderer from "@/screens/Chat/MessageRenderer";
import Spinner from "@/components/Spinner";

interface Message {
  role: "user" | "assistant";
  content: string;
  fileUrl?: string;
  fileType?: string;
  fileName?: string;
  imageResponseId?: string; // For tracking OpenAI image generation response IDs
  model?: string; // Model name used for the message
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

const handleEditKeyPress = (
  e: React.KeyboardEvent,
  index: number,
  editingText: string,
  setEditingMessageIndex: (index: number | null) => void,
  setEditingText: (text: string) => void,
  messages: Message[],
  setMessages: (messages: Message[]) => void,
  handleSendMessage: (
    messageContent: string,
    editedMessage: boolean,
    messagesUpToEdit?: Message[]
  ) => Promise<void>
) => {
  if (e.key === "Enter") {
    e.preventDefault();
    // Handle the edit here
    console.log("Editing message:", editingText);

    // Filter messages to only include those before the edited message
    const messagesUpToEdit = messages.filter((_, i) => i < index);

    // Set the filtered messages immediately
    setMessages(messagesUpToEdit);

    // Clear editing state
    setEditingMessageIndex(null);
    setEditingText("");

    // Send the edited message with the correct context
    const editedMessage = true;
    handleSendMessage(editingText, editedMessage, messagesUpToEdit);
  }
};

const RenderMessageOnScreen = ({
  message,
  index,
  messages,
  chatInitiated,
  setMessages,
  handleSendMessage,
}: RenderMessageProps) => {
  const [CopyClicked, setCopyClicked] = useState(false);
  const [editingMessageIndex, setEditingMessageIndex] = useState<number | null>(
    null
  );
  const [editingText, setEditingText] = useState<string>("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [imageKey, setImageKey] = useState<string>(
    `${message.content}-${Date.now()}`
  );

  // Update image key when message changes
  useEffect(() => {
    if (message.fileUrl) {
      setImageKey(`${message.fileUrl}-${Date.now()}`);
    }
  }, [message.fileUrl]);

  // Auto-resize textarea based on content
  useEffect(() => {
    // Add a small delay to ensure the textarea is rendered
    const timeoutId = setTimeout(() => {
      if (textareaRef.current && editingMessageIndex === index) {
        const textarea = textareaRef.current;
        console.log("Textarea ref found:", textarea); // Debug log

        // Reset height to auto to get the correct scrollHeight
        textarea.style.height = "auto";
        textarea.style.overflow = "hidden";
        textarea.style.resize = "none";

        // Set height to scrollHeight to fit content
        const newHeight = Math.max(textarea.scrollHeight, 60); // minimum height
        textarea.style.height = newHeight + "px";

        textarea.focus();
      } else {
        console.log("Textarea ref not found or not editing:", {
          current: textareaRef.current,
          editingMessageIndex,
          index,
        }); // Debug log
      }
    }, 10); // Small delay to ensure DOM is updated

    return () => clearTimeout(timeoutId);
  }, [editingText, editingMessageIndex, index]);

  // Create a callback ref that handles auto-resizing
  const textareaCallbackRef = useCallback(
    (textarea: HTMLTextAreaElement | null) => {
      if (textarea && editingMessageIndex === index) {
        console.log("Textarea callback ref called:", textarea); // Debug log

        // Store the ref for other uses
        textareaRef.current = textarea;

        // Auto-resize logic
        textarea.style.height = "auto";
        textarea.style.overflow = "hidden";
        textarea.style.resize = "none";

        const newHeight = Math.max(textarea.scrollHeight, 60);
        textarea.style.height = newHeight + "px";
        console.log("heightOfTheTextArea from callback:", newHeight);

        textarea.scrollIntoView({
          behavior: "smooth",
          block: "end",
          inline: "nearest",
        });

        textarea.focus();
      }
    },
    [editingText, editingMessageIndex, index]
  );

  const handleCopyClick = () => {
    setCopyClicked(true);
    navigator.clipboard.writeText(message.content);
    setTimeout(() => {
      setCopyClicked(false);
    }, 2000);
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
        <div>
          {/* User */}
          {message.role === "user" && (
            <div className="ml-auto max-w-full w-fit">
              <div
                className={`rounded-3xl bg-gray-100  dark:text-white rounded-br-lg   font-lora ${
                  editingMessageIndex === index
                    ? "px-[1px] w-screen max-w-[720px] dark:bg-neutral-900"
                    : "p-2 px-4 dark:bg-[#343435]"
                }`}
              >
                {editingMessageIndex === index ? (
                  <Textarea
                    ref={textareaCallbackRef}
                    value={editingText}
                    className="rounded-xl p-3 border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 text-xl font-lora dark:bg-neutral-900 bg-neutral-200"
                    style={{
                      fontSize: "17px",
                    }}
                    onChange={(e) => setEditingText(e.target.value)}
                    onKeyDown={(e) =>
                      handleEditKeyPress(
                        e,
                        index,
                        editingText,
                        setEditingMessageIndex,
                        setEditingText,
                        messages,
                        setMessages,
                        handleSendMessage
                      )
                    }
                  />
                ) : (
                  <div className="font-lora">
                    <p>{highlightSpecialWords(message.content)}</p>
                    {message.fileUrl && (
                      <div className="mt-1">
                        {message.fileType?.startsWith("image/") ? (
                          <div className="relative">
                            <img
                              key={imageKey}
                              src={message.fileUrl}
                              alt={message.fileName || "Uploaded image"}
                              className="max-w-[300px] max-h-[200px] object-cover rounded-lg border cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() =>
                                message.fileUrl &&
                                window.open(message.fileUrl, "_blank")
                              }
                              title="Click to open in new tab"
                              onError={(e) => {
                                console.error(
                                  "Image failed to load:",
                                  message.fileUrl
                                );
                                e.currentTarget.src = ""; // Clear the src on error
                              }}
                            />
                            <div className="text-xs text-gray-500 mt-1">
                              {message.fileName}
                            </div>
                          </div>
                        ) : (
                          <div
                            className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 dark:bg-[#344d58] max-w-[300px] cursor-pointer hover:bg-gray-100 dark:hover:bg-[#2e444e] transition-colors mb-2"
                            onClick={() =>
                              message.fileUrl &&
                              window.open(message.fileUrl, "_blank")
                            }
                            title="Click to open in new tab"
                          >
                            <div className="flex-shrink-0">
                              <svg
                                className="w-8 h-8 text-gray-400"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {message.fileName}
                              </div>
                              <div className="text-xs text-gray-500">
                                {message.fileType}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="flex flex-row justify-end items-end">
                {CopyClicked ? (
                  <Check className="w-4 h-4 m-2" />
                ) : (
                  <CopyIcon
                    className="w-4 h-4 cursor-pointer m-2"
                    onClick={handleCopyClick}
                  />
                )}
              </div>
            </div>
          )}

          {/* Bot  */}
          {message.role === "assistant" && (
            <div>
              <div
                className={`p-3 rounded-3xl w-fit max-w-full  dark:bg-transparent dark:text-white rounded-bl-lg mr-auto`}
              >
                {message.content === "loading" ? (
                  <LoadingIndicator />
                ) : (
                  <div className="markdown-content">
                    <MessageRenderer
                      key={imageKey}
                      content={message.content || " "}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
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
        <div>
          {/* User */}
          {message.role === "user" && (
            <div className="ml-auto max-w-full w-fit">
              <div
                className={`rounded-3xl bg-gray-100 dark:bg-[#343435] dark:text-white rounded-br-lg font-lora ${
                  editingMessageIndex === index
                    ? "px-[1px] w-screen max-w-[720px]"
                    : "p-3 px-4"
                }`}
              >
                {editingMessageIndex === index ? (
                  <Textarea
                    ref={textareaCallbackRef}
                    value={editingText}
                    className="rounded-xl p-3 border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 text-lg font-lora bg-neutral-900"
                    style={{
                      fontSize: "16px",
                      resize: "none",
                      overflow: "hidden",
                    }}
                    onChange={(e) => setEditingText(e.target.value)}
                    onKeyDown={(e) =>
                      handleEditKeyPress(
                        e,
                        index,
                        editingText,
                        setEditingMessageIndex,
                        setEditingText,
                        messages,
                        setMessages,
                        handleSendMessage
                      )
                    }
                  />
                ) : (
                  <div>
                    <div>{highlightSpecialWords(message.content)}</div>
                    {message.fileUrl && (
                      <div className="mt-3">
                        {message.fileType?.startsWith("image/") ? (
                          <div className="relative">
                            <img
                              key={imageKey}
                              src={message.fileUrl}
                              alt={message.fileName || "Uploaded image"}
                              className="max-w-[250px] max-h-[150px] object-cover rounded-lg border cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() =>
                                message.fileUrl &&
                                window.open(message.fileUrl, "_blank")
                              }
                              title="Click to open in new tab"
                              onError={(e) => {
                                console.error(
                                  "Image failed to load:",
                                  message.fileUrl
                                );
                                e.currentTarget.src = ""; // Clear the src on error
                              }}
                            />
                            <div className="text-xs text-gray-500 mt-1">
                              {message.fileName}
                            </div>
                          </div>
                        ) : (
                          <div
                            className="flex items-center gap-2 p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 max-w-[250px] cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                            onClick={() =>
                              message.fileUrl &&
                              window.open(message.fileUrl, "_blank")
                            }
                            title="Click to open in new tab"
                          >
                            <div className="flex-shrink-0">
                              <svg
                                className="w-6 h-6 text-gray-400"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-medium text-gray-900 dark:text-white truncate">
                                {message.fileName}
                              </div>
                              <div className="text-xs text-gray-500">
                                {message.fileType}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="flex flex-row justify-end items-end">
                {CopyClicked ? (
                  <Check className="w-4 h-4 m-2" />
                ) : (
                  <CopyIcon
                    className="w-4 h-4 cursor-pointer m-2"
                    onClick={handleCopyClick}
                  />
                )}
              </div>
            </div>
          )}

          {/* Bot  */}
          {message.role === "assistant" && (
            <div>
              <div
                className={`p-3 rounded-3xl w-fit max-w-full  dark:bg-transparent dark:text-white rounded-bl-lg mr-auto`}
              >
                {message.content === "loading" ? (
                  <LoadingIndicator />
                ) : (
                  <div className="markdown-content">
                    <MessageRenderer
                      key={imageKey}
                      content={message.content || " "}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// Create the memoized version of the component
const MemoizedRenderMessageOnScreen = memo(RenderMessageOnScreen);

export default MemoizedRenderMessageOnScreen;
