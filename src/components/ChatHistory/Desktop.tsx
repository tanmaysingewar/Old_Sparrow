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
import { useVirtualizer } from "@tanstack/react-virtual";
import { Loader2 } from "lucide-react";
import { DialogTitle } from "@radix-ui/react-dialog";
import { api } from "../../../convex/_generated/api";
import { useQuery } from "convex/react";

// Interface for individual chat items
interface Chat {
  id: string;
  title: string;
  createdAt: string;
  isShared: boolean;
  userId: string;
  category: string;
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
  isNewUser?: boolean;
  isLoading?: boolean;
}

export default function ChatHistoryDesktop({
  isNewUser = true,
  isLoading: isLoadingProp = false,
}: ChatHistoryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [chats, setChats] = useState<Chat[]>([]);
  const [openSettings, setOpenSettings] = useState(false);
  const { user } = useUserStore();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Reference for the chat list container
  const chatListRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const getChats = useQuery(api.chats.get);

  useEffect(() => {
    setChats(
      getChats?.map((chat) => ({
        id: chat._id,
        title: chat.title,
        createdAt: chat.createdAt.toString(),
        isShared: chat.isShared || false,
        userId: chat.userId,
        category: chat.category || "Untitled Chat",
      })) || []
    );
  }, [getChats]);

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
        {isLoadingProp && (
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
                              {chat.category || "Untitled Chat"}
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
    <Button className="cursor-pointer mx-2 mt-3 mb-2" disabled={signLoading}>
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
