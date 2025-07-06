"use client";
import React, {
  useState,
  useCallback,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
// import { motion } from "framer-motion";
import {
  OctagonPause,
  Send,
  Paperclip,
  Loader2,
  X,
  // MessageSquareMore,
  // Atom,
  // ZapIcon,
} from "lucide-react";
import { Button } from "../ui/button";
import TextInput, { TextInputRef } from "./TextInput";
import PDFIcon from "./assets/pdf";
import { useUserSearchInput } from "@/store/userSearchInput";
import { useMutation, useQuery, useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { useSearchParams } from "next/navigation";
import { getLocalMessages, saveLocalMessages } from "@/store/saveMessages";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface InputBoxProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setMessages: (messages: any[]) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  messages: any[];
}

// Define the ref interface for InputBox
export interface InputBoxRef {
  focus: () => void;
}

const InputBox = forwardRef<InputBoxRef, InputBoxProps>(function InputBox(
  { setMessages, messages },
  ref
) {
  const textInputRef = useRef<TextInputRef>(null);
  const searchParams = useSearchParams();
  // const [mode, setMode] = useState<"auto" | "chat" | "agent">("auto");

  // Expose focus method through ref
  useImperativeHandle(ref, () => ({
    focus: () => {
      textInputRef.current?.focus();
    },
  }));
  const [isDisabled, setIsDisabled] = useState(false);
  const { userSearchInput, setUserSearchInput } = useUserSearchInput();
  const generateUploadUrl = useMutation(api.messages.generateUploadUrl);
  const getFileUrl = useQuery(
    api.messages.getFileUrl,
    userSearchInput.fileId
      ? {
          storageId: userSearchInput.fileId as Id<"_storage">,
        }
      : "skip"
  );
  const deleteFile = useMutation(api.messages.deleteFile);
  const generate = useAction(api.generate.generate);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];

      setIsDisabled(true);
      if (file) {
        setUserSearchInput({
          ...userSearchInput,
          fileId: "",
          fileType: file.type,
          fileName: file.name,
          fileSize: file.size,
        });
        const postUrl = await generateUploadUrl();
        if (postUrl) {
          const result = await fetch(postUrl, {
            method: "POST",
            headers: { "Content-Type": file.type },
            body: file,
          });
          const { storageId } = await result.json();
          setUserSearchInput({
            ...userSearchInput,
            fileId: storageId,
            fileType: file.type,
            fileName: file.name,
            fileSize: file.size,
          });
        }
      }
      setIsDisabled(false);
    },
    [userSearchInput, setUserSearchInput, generateUploadUrl]
  );

  const handleFileDelete = useCallback(() => {
    setIsDisabled(true);
    setUserSearchInput({
      ...userSearchInput,
      fileId: "",
      fileType: "",
      fileName: "",
      fileSize: 0,
    });
    if (userSearchInput.fileId) {
      deleteFile({ storageId: userSearchInput.fileId as Id<"_storage"> });
    }
    setIsDisabled(false);
  }, [userSearchInput, setUserSearchInput, deleteFile]);

  console.log("userSearchInput text", userSearchInput.text);
  const handleSendMessage = useCallback(async () => {
    // Don't send if text is empty or just whitespace
    if (!userSearchInput.text.trim()) {
      return;
    }

    let chatIdParam = searchParams.get("chatId");
    let text = userSearchInput.text;
    // if chatId is not there, create a new chat ID using NanoId
    if (!chatIdParam) {
      const chatId = crypto.randomUUID();
      chatIdParam = chatId;
      text = userSearchInput.text;
      setUserSearchInput({
        ...userSearchInput,
        text: "",
      });

      saveLocalMessages(
        [
          {
            role: "user",
            content: text,
            createdAt: Date.now(),
          },
          {
            role: "assistant",
            content: "Loading...",
            createdAt: Date.now(),
          },
        ],
        chatIdParam
      );

      // redirect to the chat page
      const currentSearchParams = new URLSearchParams(window.location.search);

      document.title = "New Chat" + " - Old Sparrow";
      currentSearchParams.set("chatId", chatIdParam);
      currentSearchParams.delete("new");
      window.history.pushState({}, "", `/chat?${currentSearchParams}`);
    } else {
      // update the local messages with the new message
      const localMessages = getLocalMessages(chatIdParam);
      setUserSearchInput({ ...userSearchInput, text: "" });
      localMessages.push({
        role: "user",
        content: text,
        createdAt: Date.now(),
      });
      localMessages.push({
        role: "assistant",
        content: "Loading...",
        createdAt: Date.now(),
      });

      // Add message to local storage
      setMessages([
        ...messages,
        {
          role: "user",
          content: text,
          createdAt: Date.now(),
        },
        {
          role: "assistant",
          content: "Loading...",
          createdAt: Date.now(),
        },
      ]);
      saveLocalMessages(localMessages, chatIdParam);
    }

    // Scroll to bottom of the chat container after sending message
    setTimeout(() => {
      const scrollContainer = document.querySelector(".overflow-y-scroll");
      if (scrollContainer) {
        scrollContainer.scrollTo({
          top: scrollContainer.scrollHeight,
          behavior: "smooth",
        });
      }
    }, 100);

    // generate the response
    await generate({
      chatId: chatIdParam,
      userMessage: text,
    });
  }, [
    generate,
    userSearchInput,
    searchParams,
    setUserSearchInput,
    setMessages,
    messages,
  ]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage]
  );

  return (
    <div>
      <div className="max-w-3xl text-base font-sans lg:px-0 w-screen md:rounded-t-3xl px-2 select-none rounded-3xl">
        <div className="flex flex-col items-center rounded-3xl dark:bg-[#212122] bg-white p-2 w-full backdrop-blur-xs">
          {/* File Content Indicator */}
          {userSearchInput.fileName && (
            <div className="mx-3 mb-2 w-full">
              <div
                className={`group flex items-start rounded-xl px-3 py-2 bg-[#f3f3f3] dark:bg-[#424143] w-fit cursor-pointer`}
                onClick={() => {
                  if (userSearchInput.fileId && getFileUrl) {
                    window.open(getFileUrl, "_blank");
                  }
                }}
              >
                <div className="flex items-center space-x-2 mr-10 ">
                  {userSearchInput.fileId ? (
                    <PDFIcon className="w-8 h-8" />
                  ) : (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  )}
                  <div className="flex flex-col">
                    <span className={`text-sm text-black dark:text-white`}>
                      {userSearchInput.fileName}
                    </span>
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">
                      {userSearchInput.fileType.includes("image")
                        ? "Image"
                        : userSearchInput.fileType.includes("pdf")
                          ? "PDF"
                          : userSearchInput.fileType.includes("doc")
                            ? "DOC"
                            : userSearchInput.fileType}{" "}
                      - {userSearchInput.fileSize.toLocaleString()}
                    </span>
                  </div>
                </div>
                <button
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-neutral-500 dark:text-neutral-400 hover:text-red-500 dark:hover:text-red-400 text-sm cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFileDelete();
                  }}
                >
                  <X className="w-5 h-5 hover:bg-red-500/10 rounded-full p-1" />
                </button>
              </div>
            </div>
          )}
          <TextInput ref={textInputRef} height={50} onKeyDown={handleKeyDown} />
          <div className="flex flex-row justify-between w-full mt-0">
            <div className="flex flex-row mt-2 dark:text-neutral-200 mx-2 mb-2 justify-center items-center gap-2">
              <div className="mt-0 flex flex-row gap-3">
                <Tooltip>
                  <TooltipTrigger>
                    <div
                      className={`flex flex-row items-center justify-center rounded-full border cursor-pointer bg-transparent text-neutral-500 dark:text-neutral-400 border-neutral-300 dark:border-neutral-600`}
                    >
                      <label
                        htmlFor="file-upload"
                        className={`flex flex-row items-center p-1.5 cursor-pointer`}
                      >
                        <input
                          type="file"
                          id="file-upload"
                          onChange={handleFileChange}
                          className="hidden"
                          disabled={true}
                          accept="application/pdf"
                        />
                        <Paperclip className="w-[18px] h-[18px] text-neutral-300 dark:text-neutral-600" />
                      </label>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Coming Soon</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              {/* <div className="flex flex-row items-center bg-neutral-200 dark:bg-[#2b2a2c] rounded-full relative w-fit p-[1px]">
                <motion.div
                  className="absolute bg-white dark:bg-[#3e3d3e] rounded-full shadow-sm"
                  initial={false}
                  animate={{
                    x: mode === "auto" ? 1 : mode === "chat" ? 37 : 72,
                    width: 35,
                    height: 30,
                    y: 0,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                  }}
                />
                <motion.div
                  className="p-2 rounded-full cursor-pointer relative z-10 flex items-center justify-center w-9 h-8"
                  onClick={() => setMode("auto")}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <ZapIcon className="w-4 h-4" />
                </motion.div>
                <motion.div
                  className="p-2 rounded-full cursor-pointer relative z-10 flex items-center justify-center w-9 h-8"
                  onClick={() => setMode("chat")}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <MessageSquareMore className="w-4 h-4" />
                </motion.div>
                <motion.div
                  className="p-2 rounded-full cursor-pointer relative z-10 flex items-center justify-center w-9 h-8"
                  onClick={() => setMode("agent")}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <Atom className="w-4 h-4" />
                </motion.div>
              </div> */}
            </div>
            <div className="flex flex-row justify-center items-center">
              <p className="text-xs dark:text-neutral-400 text-neutral-500 mr-3 hidden md:block select-none">
                Use{" "}
                <span className="dark:text-white text-black">
                  shift + return
                </span>{" "}
                for new line
              </p>
              <Button
                className="p-2 h-[38px] w-[38px] rounded-full dark:bg-neutral-200 bg-neutral-800"
                onClick={handleSendMessage}
                disabled={isDisabled}
              >
                {isDisabled ? <OctagonPause className="w-4 h-4" /> : <Send />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default InputBox;
