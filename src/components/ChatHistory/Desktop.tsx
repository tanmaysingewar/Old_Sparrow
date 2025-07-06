import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useUserStore } from "@/store/userStore";
import { Sidebar, Trash, User } from "lucide-react";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import Settings from "../Setting";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Loader2 } from "lucide-react";
import { DialogTitle } from "@radix-ui/react-dialog";
import { api } from "../../../convex/_generated/api";
import { useMutation } from "convex/react";

import { toast } from "sonner";

// Interface for individual chat items
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

export default function ChatHistoryDesktop({
  hideChatHistory,
  setHideChatHistory,
  chats,
  chatLoadings,
}: {
  hideChatHistory: boolean;
  setHideChatHistory: (hideChatHistory: boolean) => void;
  chats: Chat[];
  chatLoadings: boolean;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [openSettings, setOpenSettings] = useState(false);
  const { user } = useUserStore();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Reference for the chat list container
  const chatListRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filter chats based on search term - computed only when dependencies change
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

  // Setup virtualization
  const rowVirtualizer = useVirtualizer({
    count: displayedChats.length,
    getScrollElement: () => chatListRef.current,
    estimateSize: () => 55, // Height of each chat item
    overscan: 5,
  });

  const handleChatClick = useCallback(
    (chatId: string, chatTitle: string, customChatId: string) => {
      const currentSearchParams = new URLSearchParams(window.location.search);

      document.title = chatTitle + " - Old Sparrow";
      currentSearchParams.set("chatId", customChatId);
      currentSearchParams.delete("new");
      window.history.pushState({}, "", `/chat?${currentSearchParams}`);
    },
    [router]
  );

  const handleNewChatClick = useCallback(() => {
    const currentSearchParams = new URLSearchParams(window.location.search);
    currentSearchParams.set("new", "true");
    currentSearchParams.delete("chatId");
    document.title = "Old Sparrow";
    window.history.pushState({}, "", `/chat?${currentSearchParams}`);
  }, []);

  // Get current chat ID from URL for highlighting active chat
  const currentChatId = useMemo(() => {
    return searchParams.get("chatId");
  }, [searchParams]);

  const handleDeleteChat = useMutation(api.chats.deleteChat);

  const deleteChat = async (chatId: string) => {
    try {
      await handleDeleteChat({ chatId });
      toast.success("Chat deleted successfully");
      const currentSearchParams = new URLSearchParams(window.location.search);
      currentSearchParams.set("new", "true");
      currentSearchParams.delete("chatId");
      document.title = "Old Sparrow";
      window.history.pushState({}, "", `/chat?${currentSearchParams}`);
    } catch (error) {
      toast.error("Failed to delete chat");
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col h-full dark:bg-[#212122] bg-[#ebebeb] select-none">
      <div className="flex flex-row items-center gap-2 justify-between">
        <div
          className="m-1 ml-2 mt-3 hover:cursor-pointer hover:bg-neutral-200 dark:hover:bg-[#1a1a1a] rounded-sm p-1 w-fit text-neutral-400"
          onClick={() => setHideChatHistory(!hideChatHistory)}
        >
          <Sidebar size={20} />
        </div>
      </div>
      <Button
        onClick={handleNewChatClick}
        className="mx-3 mt-2 cursor-pointer dark:bg-[#323233] bg-white"
        variant="secondary"
      >
        <p className="text-[14px] font-semibold flex flex-row items-center gap-2">
          New Task{" "}
          {/* <span className="text-xs bg-neutral-200 dark:bg-[#3a3a3b] rounded p-1 px-2 text-neutral-500 dark:text-neutral-400">
            ⌘
          </span>
          <span className="text-xs bg-neutral-200 dark:bg-[#3a3a3b] rounded p-1 px-2 text-neutral-500 dark:text-neutral-400">
            K
          </span> */}
        </p>
      </Button>
      <div className="flex-shrink-0 text-center mt-5">
        <Input
          ref={searchInputRef}
          placeholder="Search chats..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ fontSize: "14px" }}
          className="w-full border-0 ring-0 h-[40px] border-b rounded-none px-4 focus-visible:ring-0 focus-visible:ring-offset-0"
        />
      </div>
      <div
        ref={chatListRef}
        className="flex-1 overflow-y-auto no-scrollbar h-screen relative"
      >
        {chatLoadings && (
          <div className="flex justify-center items-center py-2 bg-[#212122]/5 backdrop-blur-xs z-10 sticky top-0">
            <Loader2 className="h-5 w-5 animate-spin text-neutral-400" />
          </div>
        )}

        {displayedChats.length === 0 && (
          <p className="text-center text-gray-500 text-sm mt-8 ">
            {`No chats found`}
          </p>
        )}

        <div className="p-2">
          {displayedChats.length > 0 && (
            <div
              style={{
                height: `${rowVirtualizer.getTotalSize()}px`,
                width: "100%",
                position: "relative",
              }}
            >
              {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const chat = displayedChats[virtualRow.index];

                return (
                  <div
                    key={chat.customChatId}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: `${virtualRow.size}px`,
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                    onClick={() =>
                      handleChatClick(chat.id, chat.title, chat.customChatId)
                    }
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) =>
                      e.key === "Enter" &&
                      handleChatClick(chat.id, chat.title, chat.customChatId)
                    }
                  >
                    <div
                      className={`hover:bg-neutral-200 dark:hover:bg-[#1a1a1a] cursor-pointer rounded-sm p-2 px-3 transition-colors duration-150 group relative ${
                        currentChatId === chat.customChatId
                          ? "bg-white dark:bg-[#1a1a1a] hover:bg-white"
                          : ""
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <>
                          <div className="">
                            <p className="text-sm font-medium truncate flex-1">
                              <span className="flex flex-row items-center">
                                {chat.title || "Untitled Chat"}
                              </span>
                            </p>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                              {chat.category || "Untitled Chat"}
                            </p>
                          </div>
                        </>
                        <div className="flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <Trash
                            size={14}
                            onClick={() => {
                              deleteChat(chat.customChatId);
                            }}
                            className=" text-neutral-500 hover:text-red-800 dark:text-neutral-400 hover:dark:text-red-800 hover:scale-110 transition-all duration-300 cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-col border-t border-neutral-200 dark:border-[#323233]">
        <div
          className="flex items-center gap-2 p-3 mx-2 mb-0 mt-0  rounded-md cursor-pointer"
          onClick={() => {
            setOpenSettings(true);
          }}
        >
          <div className="bg-neutral-700 p-0 rounded-full">
            {user?.image ? (
              <img
                src={user.image}
                alt="Profile picture"
                className="h-9 w-9 rounded-full"
              />
            ) : (
              <User size={20} className="dark:text-white" />
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium dark:text-white">
              {user?.name || "User"}
            </span>
            <span className="text-xs dark:text-neutral-400 text-neutral-600 truncate max-w-[200px]">
              {user?.email || ""}
            </span>
          </div>
        </div>
        <Dialog open={openSettings} onOpenChange={setOpenSettings}>
          <DialogContent className="dark:bg-[#212122] h-[60vh] w-[53vw]">
            <DialogHeader>
              <DialogTitle className="hidden">Settings</DialogTitle>
              <Settings />
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
