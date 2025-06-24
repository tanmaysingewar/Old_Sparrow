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
import { User } from "lucide-react";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import Settings from "../Setting";
import { authClient } from "@/lib/auth-client";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Loader2 } from "lucide-react";
import { CHAT_CACHE_UPDATED_EVENT } from "@/support/fetchChats";
import { DialogTitle } from "@radix-ui/react-dialog";

// Interface for individual chat items
interface Chat {
  id: string;
  title: string;
  createdAt: string;
}

// Interface for the NEW structure stored in localStorage
interface RawCacheData {
  chats: Chat[];
  totalChats: number;
  timestamp: number;
}

// Updated cache key
const CACHE_KEY = "chatHistoryCache";

// Updated function to load data from the new cache format
const loadFromCache = (): RawCacheData | null => {
  if (typeof window === "undefined") return null;
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    const data: RawCacheData = JSON.parse(cached);

    // Validate the new structure
    if (
      !data ||
      !Array.isArray(data.chats) ||
      typeof data.totalChats !== "number" ||
      typeof data.timestamp !== "number"
    ) {
      console.warn(
        "Invalid cache structure found for key",
        CACHE_KEY,
        ". Clearing."
      );
      localStorage.removeItem(CACHE_KEY);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Failed to load or parse cache:", error);
    localStorage.removeItem(CACHE_KEY);
    return null;
  }
};

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
  isNewUser?: boolean;
  isLoading?: boolean;
}

export default function ChatHistoryDesktop({
  isNewUser = true,
  isLoading: isLoadingProp = false,
}: ChatHistoryProps) {
  // Use a single source of truth for all chats data
  const [cacheData, setCacheData] = useState<RawCacheData | null>(null);
  const [isLoadingCache, setIsLoadingCache] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  // const [deletingChatId, setDeletingChatId] = useState<string | null>(null);
  // const [editingChatId, setEditingChatId] = useState<string | null>(null);
  // const [editingTitle, setEditingTitle] = useState("");
  // const [updatingChatId, setUpdatingChatId] = useState<string | null>(null);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [openSettings, setOpenSettings] = useState(false);
  const { user } = useUserStore();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Reference for the chat list container
  const chatListRef = useRef<HTMLDivElement>(null);
  // Reference for the search input
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Load cache data only once on component mount or when localStorage changes
  useEffect(() => {
    const loadCacheData = () => {
      setIsLoadingCache(true);
      try {
        const data = loadFromCache();
        setCacheData(data);
      } catch (err) {
        console.error("Error loading cache data:", err);
        setError("Failed to load chat history from cache.");
        console.log(error);
      } finally {
        setIsLoadingCache(false);
      }
    };

    loadCacheData();

    // Listen for both storage changes (from other tabs) and our custom event (same tab)
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === CACHE_KEY) {
        console.log("Chat history cache updated in localStorage");
        loadCacheData();
      }
    };

    const handleCacheUpdate = () => {
      console.log("Chat history cache updated in current tab");
      loadCacheData();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener(CHAT_CACHE_UPDATED_EVENT, handleCacheUpdate);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(CHAT_CACHE_UPDATED_EVENT, handleCacheUpdate);
    };
  }, []);

  // Filter chats based on search term - computed only when dependencies change
  const displayedChats = useMemo(() => {
    if (!cacheData?.chats) return [];

    if (!debouncedSearchTerm) {
      return cacheData.chats;
    }

    const searchTermLower = debouncedSearchTerm.toLowerCase();
    return cacheData.chats.filter((chat) =>
      (chat.title || "Untitled Chat").toLowerCase().includes(searchTermLower)
    );
  }, [cacheData, debouncedSearchTerm]);

  // Setup virtualization
  const rowVirtualizer = useVirtualizer({
    count: displayedChats.length,
    getScrollElement: () => chatListRef.current,
    estimateSize: () => 55, // Height of each chat item
    overscan: 5,
  });

  const handleChatClick = useCallback(
    (chatId: string, chatTitle: string) => {
      const currentSearchParams = new URLSearchParams(window.location.search);

      document.title = chatTitle + " - Better Index";
      currentSearchParams.set("chatId", chatId);
      currentSearchParams.delete("new");
      window.history.pushState({}, "", `/chat?${currentSearchParams}`);
    },
    [router]
  );

  const handleNewChatClick = useCallback(() => {
    const currentSearchParams = new URLSearchParams(window.location.search);
    currentSearchParams.set("new", "true");
    currentSearchParams.delete("chatId");
    document.title = "Better Index";
    window.history.pushState({}, "", `/chat?${currentSearchParams}`);
  }, []);

  // Get current chat ID from URL for highlighting active chat
  const currentChatId = useMemo(() => {
    return searchParams.get("chatId");
  }, [searchParams]);

  // Handle chat deletion
  // const handleDeleteChat = useCallback(
  //   async (chatId: string, event: React.MouseEvent) => {
  //     event.stopPropagation(); // Prevent chat click when deleting

  //     if (deletingChatId) return; // Prevent multiple deletions

  //     setDeletingChatId(chatId);

  //     try {
  //       const response = await fetch(`/api/chat/${chatId}`, {
  //         method: "DELETE",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         credentials: "include",
  //       });

  //       if (!response.ok) {
  //         throw new Error("Failed to delete chat");
  //       }

  //       // Update local cache immediately for better UX
  //       setCacheData((prevData) => {
  //         if (!prevData) return prevData;

  //         const updatedChats = prevData.chats.filter(
  //           (chat) => chat.id !== chatId
  //         );
  //         const updatedData = {
  //           ...prevData,
  //           chats: updatedChats,
  //           totalChats: updatedChats.length,
  //           timestamp: Date.now(),
  //         };

  //         // Update localStorage
  //         localStorage.setItem(CACHE_KEY, JSON.stringify(updatedData));

  //         // Dispatch event to notify other components
  //         window.dispatchEvent(new CustomEvent(CHAT_CACHE_UPDATED_EVENT));

  //         return updatedData;
  //       });

  //       // If we deleted the currently active chat, redirect to new chat
  //       const currentChatId = searchParams.get("chatId");
  //       if (currentChatId === chatId) {
  //         handleNewChatClick();
  //       }
  //     } catch (error) {
  //       console.error("Error deleting chat:", error);
  //       setError("Failed to delete chat. Please try again.");
  //     } finally {
  //       setDeletingChatId(null);
  //     }
  //   },
  //   [deletingChatId, searchParams, handleNewChatClick]
  // );

  // Handle starting chat title edit
  // const handleStartEditTitle = useCallback(
  //   (chatId: string, currentTitle: string, event: React.MouseEvent) => {
  //     event.stopPropagation(); // Prevent chat click when editing
  //     setEditingChatId(chatId);
  //     setEditingTitle(currentTitle || "Untitled Chat");
  //   },
  //   []
  // );

  // Handle saving chat title edit
  // const handleSaveEditTitle = useCallback(
  //   async (chatId: string, event?: React.MouseEvent) => {
  //     if (event) {
  //       event.stopPropagation(); // Prevent chat click when saving
  //     }

  //     if (updatingChatId || !editingTitle.trim()) return;

  //     setUpdatingChatId(chatId);

  //     try {
  //       const response = await fetch(`/api/chat/${chatId}`, {
  //         method: "PATCH",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         credentials: "include",
  //         body: JSON.stringify({ title: editingTitle.trim() }),
  //       });

  //       if (!response.ok) {
  //         throw new Error("Failed to update chat title");
  //       }

  //       // Update local cache immediately for better UX
  //       setCacheData((prevData) => {
  //         if (!prevData) return prevData;

  //         const updatedChats = prevData.chats.map((chat) =>
  //           chat.id === chatId ? { ...chat, title: editingTitle.trim() } : chat
  //         );
  //         const updatedData = {
  //           ...prevData,
  //           chats: updatedChats,
  //           timestamp: Date.now(),
  //         };

  //         // Update localStorage
  //         localStorage.setItem(CACHE_KEY, JSON.stringify(updatedData));

  //         // Dispatch event to notify other components
  //         window.dispatchEvent(new CustomEvent(CHAT_CACHE_UPDATED_EVENT));

  //         return updatedData;
  //       });

  //       // Clear editing state
  //       setEditingChatId(null);
  //       setEditingTitle("");
  //     } catch (error) {
  //       console.error("Error updating chat title:", error);
  //       setError("Failed to update chat title. Please try again.");
  //     } finally {
  //       setUpdatingChatId(null);
  //     }
  //   },
  //   [editingTitle, updatingChatId]
  // );

  // Handle canceling chat title edit
  // const handleCancelEditTitle = useCallback((event?: React.MouseEvent) => {
  //   if (event) {
  //     event.stopPropagation(); // Prevent chat click when canceling
  //   }
  //   setEditingChatId(null);
  //   setEditingTitle("");
  // }, []);

  // Handle keyboard events in edit mode
  // const handleEditKeyDown = useCallback(
  //   (event: React.KeyboardEvent, chatId: string) => {
  //     if (event.key === "Enter") {
  //       event.preventDefault();
  //       handleSaveEditTitle(chatId);
  //     } else if (event.key === "Escape") {
  //       event.preventDefault();
  //       handleCancelEditTitle();
  //     }
  //   },
  //   [handleSaveEditTitle, handleCancelEditTitle]
  // );

  // Handle chat navigation shortcuts
  const handleChatNavigation = useCallback(
    (event: KeyboardEvent) => {
      // Check for cmd/ctrl + [ or ]
      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const modifierKey = isMac ? event.metaKey : event.ctrlKey;

      if (!modifierKey || displayedChats.length === 0) return;

      if (event.key === "[" || event.key === "]") {
        event.preventDefault();

        const currentIndex = displayedChats.findIndex(
          (chat) => chat.id === currentChatId
        );

        if (event.key === "[") {
          // Previous chat
          const prevIndex =
            currentIndex > 0 ? currentIndex - 1 : displayedChats.length - 1;
          const prevChat = displayedChats[prevIndex];
          if (prevChat) {
            handleChatClick(prevChat.id, prevChat.title);
          }
        } else if (event.key === "]") {
          // Next chat
          const nextIndex =
            currentIndex < displayedChats.length - 1 ? currentIndex + 1 : 0;
          const nextChat = displayedChats[nextIndex];
          if (nextChat) {
            handleChatClick(nextChat.id, nextChat.title);
          }
        }
      }

      // Handle search focus shortcut (cmd/ctrl + k)
      if (event.key === "k" || event.key === "K") {
        event.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }
    },
    [displayedChats, currentChatId, handleChatClick]
  );

  // Add keyboard event listeners for chat navigation
  useEffect(() => {
    document.addEventListener("keydown", handleChatNavigation);
    return () => {
      document.removeEventListener("keydown", handleChatNavigation);
    };
  }, [handleChatNavigation]);

  // Determine UI states
  const hasChats = cacheData?.chats && cacheData.chats.length > 0;
  const showEmptySearchResults =
    !isLoadingCache &&
    !isLoadingProp &&
    hasChats &&
    displayedChats.length === 0 &&
    !!debouncedSearchTerm;

  return (
    <div className="flex flex-col h-full dark:bg-[#212122] bg-[#ebebeb] select-none">
      {/* <span className={cn("text-xl text-center mt-5", pacifico.className)}>
        {" "}
        Better Index
      </span> */}
      <Button
        onClick={handleNewChatClick}
        className="mx-3 mt-8 cursor-pointer dark:bg-[#323233] bg-white"
        variant="secondary"
      >
        <p className="text-[14px] font-semibold flex flex-row items-center gap-2">
          New Task{" "}
          <span className="text-xs bg-neutral-200 dark:bg-[#3a3a3b] rounded p-1 px-2 text-neutral-500 dark:text-neutral-400">
            ⌘
          </span>
          <span className="text-xs bg-neutral-200 dark:bg-[#3a3a3b] rounded p-1 px-2 text-neutral-500 dark:text-neutral-400">
            K
          </span>
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
        {(isLoadingCache || isLoadingProp) && (
          <div className="flex justify-center items-center py-2 bg-[#212122]/5 backdrop-blur-xs z-10 sticky top-0">
            <Loader2 className="h-5 w-5 animate-spin text-neutral-400" />
          </div>
        )}

        {showEmptySearchResults && (
          <p className="text-center text-gray-500 text-sm mx-10 mt-8">
            {`No chats found matching "${debouncedSearchTerm}"`}
          </p>
        )}

        {displayedChats.length === 0 && !showEmptySearchResults && (
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
                const isDeleting = "1" === chat.id;
                const isEditing = "1" === chat.id;
                const isUpdating = "1" === chat.id;

                return (
                  <div
                    key={chat.id}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: `${virtualRow.size}px`,
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                    onClick={
                      isEditing
                        ? undefined
                        : () => handleChatClick(chat.id, chat.title)
                    }
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) =>
                      !isEditing &&
                      e.key === "Enter" &&
                      handleChatClick(chat.id, chat.title)
                    }
                  >
                    <div
                      className={`hover:bg-neutral-200 dark:hover:bg-[#1a1a1a] cursor-pointer rounded-sm p-2 px-3 transition-colors duration-150 group relative ${
                        currentChatId === chat.id
                          ? "bg-white dark:bg-[#1a1a1a] hover:bg-white"
                          : ""
                      } ${
                        isDeleting || isUpdating
                          ? "opacity-50 pointer-events-none"
                          : ""
                      } ${isEditing ? "cursor-default" : ""}`}
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
                              {"Health Insurance"}
                            </p>
                          </div>
                        </>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-col border-t border-neutral-200 dark:border-[#323233] ">
        {/* <BringYourOwnKey /> */}
        {user?.emailVerified === false || !user || isNewUser ? (
          <SignInComponent />
        ) : (
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
        )}
        <Dialog open={openSettings} onOpenChange={setOpenSettings}>
          <DialogContent className="dark:bg-[#1d1e20] h-[60vh] w-[53vw]">
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

const SignInComponent = () => {
  const [signLoading, setSignLoading] = useState(false);
  return (
    <Button
      className="cursor-pointer mx-2 mt-3 mb-2"
      onClick={async () => {
        setSignLoading(true);
        await authClient.signIn.social({
          provider: "google",
          callbackURL: "/chat?login=true",
        });
      }}
      disabled={signLoading}
    >
      {signLoading ? (
        <svg
          fill="#000000"
          version="1.1"
          id="Capa_1"
          xmlns="http://www.w3.org/2000/svg"
          xmlnsXlink="http://www.w3.org/1999/xlink"
          width="900px"
          height="900px"
          viewBox="0 0 26.349 26.35"
          style={{ animation: "spin 1s linear infinite" }}
        >
          <style>
            {`
                    @keyframes spin {
                      from {
                        transform: rotate(0deg);
                      }
                      to {
                        transform: rotate(360deg);
                      }
                    }
                `}
          </style>
          <g>
            <g>
              <circle cx="13.792" cy="3.082" r="3.082" />
              <circle cx="13.792" cy="24.501" r="1.849" />
              <circle cx="6.219" cy="6.218" r="2.774" />
              <circle cx="21.365" cy="21.363" r="1.541" />
              <circle cx="3.082" cy="13.792" r="2.465" />
              <circle cx="24.501" cy="13.791" r="1.232" />
              <path d="M4.694,19.84c-0.843,0.843-0.843,2.207,0,3.05c0.842,0.843,2.208,0.843,3.05,0c0.843-0.843,0.843-2.207,0-3.05 C6.902,18.996,5.537,18.988,4.694,19.84z" />
              <circle cx="21.364" cy="6.218" r="0.924" />
            </g>
          </g>
        </svg>
      ) : (
        "Sign In"
      )}
    </Button>
  );
};
