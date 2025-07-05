"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Trash2, Loader2, GitBranch, Image } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import { useMutation } from "convex/react";
import { toast } from "sonner";

// Interface for individual chat items (matching Desktop.tsx)
interface Chat {
  id: string;
  title: string;
  createdAt: string;
  isShared: boolean;
  userId: string;
  category: string;
  customChatId: string;
  isDisabled: boolean;
}

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

interface ChatHistoryProps {
  chats: Chat[];
  chatLoadings: boolean;
  onClose: () => void;
}

export default function ChatHistory({
  chats,
  chatLoadings,
  onClose,
}: ChatHistoryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(
    null
  );
  const [selectionTimer, setSelectionTimer] = useState<NodeJS.Timeout | null>(
    null
  );

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Convex mutations
  const handleDeleteChat = useMutation(api.chats.deleteChat);

  // Filter chats based on search term
  const displayedChats = useMemo(() => {
    if (!chats) return [];

    if (!debouncedSearchTerm) {
      return chats;
    }

    const searchTermLower = debouncedSearchTerm.toLowerCase();
    return chats.filter((chat) =>
      (chat.title || "Untitled Chat").toLowerCase().includes(searchTermLower)
    );
  }, [chats, debouncedSearchTerm]);

  // Get current chat ID from URL for highlighting active chat
  const currentChatId = useMemo(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      return searchParams.get("chatId");
    }
    return null;
  }, []);

  // Handle chat deletion
  const handleDeleteChatAction = useCallback(
    async (chatId: string, event: React.MouseEvent) => {
      event.stopPropagation();

      try {
        await handleDeleteChat({ chatId });
        toast.success("Chat deleted successfully");

        // If we deleted the currently active chat, redirect to new chat
        if (currentChatId === chatId) {
          const currentSearchParams = new URLSearchParams(
            window.location.search
          );
          currentSearchParams.set("new", "true");
          currentSearchParams.delete("chatId");
          window.history.pushState({}, "", `/chat?${currentSearchParams}`);
          onClose();
        }
      } catch (error) {
        toast.error("Failed to delete chat");
        console.error(error);
      }
    },
    [handleDeleteChat, currentChatId, onClose]
  );

  // Handle long press for mobile
  const [isLongPress, setIsLongPress] = useState(false);

  const handleTouchStart = useCallback((chatId: string) => {
    setIsLongPress(false);
    const timer = setTimeout(() => {
      setIsLongPress(true);
      setSelectedChatId(chatId);

      // Set up auto-clear timer (5 seconds)
      const clearTimer = setTimeout(() => {
        setSelectedChatId(null);
      }, 5000);
      setSelectionTimer(clearTimer);

      // Add haptic feedback if available
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }, 500); // 500ms long press
    setLongPressTimer(timer);
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  }, [longPressTimer]);

  // Cleanup effect for touch timers
  useEffect(() => {
    return () => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
      }
      if (selectionTimer) {
        clearTimeout(selectionTimer);
      }
    };
  }, [longPressTimer, selectionTimer]);

  const handleChatClick = (
    chatId: string,
    chatTitle: string,
    customChatId: string
  ) => {
    const currentPath = window.location.pathname;
    const currentSearchParams = new URLSearchParams(window.location.search);
    const currentChatIdFromUrl = currentSearchParams.get("chatId");

    if (currentPath === "/chat" && currentChatIdFromUrl === customChatId) {
      onClose();
      return;
    }

    document.title = chatTitle + " - Old Sparrow";
    currentSearchParams.set("chatId", customChatId);
    currentSearchParams.delete("new");
    window.history.pushState({}, "", `/chat?${currentSearchParams}`);

    onClose();
  };

  const handleChatSelect = useCallback((chat: Chat) => {
    handleChatClick(chat.id, chat.title, chat.customChatId);
  }, []);

  return (
    <div className="flex flex-col h-full border-r">
      <div className="flex-shrink-0">
        <Input
          placeholder="Search chats..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ fontSize: "16px" }}
          className="w-full border-0 ring-0 h-[60px] border-b rounded-none px-4 focus-visible:ring-0 focus-visible:ring-offset-0"
        />
      </div>

      <div className="flex-grow p-4 overflow-y-auto min-h-0">
        {chatLoadings && (
          <div className="flex justify-center items-center py-2">
            <Loader2 className="h-5 w-5 animate-spin text-neutral-400" />
          </div>
        )}

        {!chatLoadings && displayedChats.length === 0 && (
          <p className="text-center text-gray-500">
            {debouncedSearchTerm
              ? `No chats found matching "${debouncedSearchTerm}".`
              : "No chats found."}
          </p>
        )}

        {!chatLoadings && displayedChats.length > 0 && (
          <>
            <div className="text-xs text-gray-500 mb-2 px-1 text-center">
              Tap to open • Long press to delete
            </div>
            <div className="gap-1 flex flex-col max-h-80 overflow-y-auto">
              {displayedChats.map((chat) => {
                const isSelected = selectedChatId === chat.customChatId;
                const isActive = currentChatId === chat.customChatId;

                return (
                  <div
                    key={chat.customChatId}
                    className={`active:bg-neutral-200 dark:active:bg-neutral-800 cursor-pointer rounded-lg p-3 transition-colors duration-150 relative select-none ${
                      isActive ? "bg-neutral-100 dark:bg-neutral-700/80" : ""
                    } ${
                      isSelected
                        ? "bg-neutral-200 dark:bg-neutral-700 ring-2 ring-blue-300 dark:ring-blue-600"
                        : ""
                    }`}
                    onClick={(e) => {
                      if (isSelected && !isLongPress) {
                        const target = e.target as HTMLElement;
                        if (!target.closest("button")) {
                          handleChatSelect(chat);
                        }
                      } else if (!isLongPress) {
                        if (selectionTimer) {
                          clearTimeout(selectionTimer);
                          setSelectionTimer(null);
                        }
                        setSelectedChatId(null);
                        handleChatSelect(chat);
                      }
                      setIsLongPress(false);
                    }}
                    onTouchStart={() => handleTouchStart(chat.customChatId)}
                    onTouchEnd={handleTouchEnd}
                    onTouchCancel={handleTouchEnd}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleChatSelect(chat);
                      }
                    }}
                  >
                    <div className="flex items-center justify-between relative">
                      <div className="flex-1">
                        <p className="text-[15px] font-medium truncate">
                          <span className="flex flex-row items-center">
                            {(() => {
                              const isBranched =
                                chat.title?.startsWith("Branched - ");
                              const isImage = chat.title?.includes("Image:");
                              let displayTitle = chat.title || "Untitled Chat";

                              if (isBranched) {
                                displayTitle = displayTitle.replace(
                                  "Branched - ",
                                  ""
                                );
                              }
                              if (isImage) {
                                displayTitle = displayTitle
                                  .replace("Image:", "")
                                  .trim();
                              }

                              return (
                                <>
                                  {isBranched && (
                                    <GitBranch className="h-4 w-4 mr-1 text-neutral-600 dark:text-neutral-400 flex-shrink-0" />
                                  )}
                                  {isImage && (
                                    <Image className="h-4 w-4 mr-2 text-neutral-600 dark:text-neutral-400 flex-shrink-0" />
                                  )}
                                  {displayTitle || "Untitled Chat"}
                                </>
                              );
                            })()}
                          </span>
                        </p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                          {chat.category || "General"}
                        </p>
                      </div>
                      {isSelected && (
                        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 flex items-center gap-1 bg-transparent rounded-lg shadow-lg border-none px-1">
                          <button
                            onClick={(e) =>
                              handleDeleteChatAction(chat.customChatId, e)
                            }
                            className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg text-red-600 dark:text-red-400 flex-shrink-0 cursor-pointer active:bg-red-200 dark:active:bg-red-900/50"
                            title="Delete chat"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      <div className="flex-shrink-0 border-t h-[60px] flex items-center justify-center px-4">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {displayedChats.length}{" "}
          {displayedChats.length === 1 ? "chat" : "chats"}
        </span>
      </div>
    </div>
  );
}
