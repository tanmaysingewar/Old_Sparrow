"use client";
import React, { useState, useRef, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import InputBox from "@/components/InputArea/InputBox";
import Header from "@/components/Header";
import Spinner from "@/components/Spinner";
import Head from "next/head";
import MemoizedRenderMessageOnScreen from "./RenderMessage";

import { Pacifico } from "next/font/google";
import { Libre_Baskerville } from "next/font/google";
import { cn } from "@/lib/utils";
import ChatHistoryDesktop from "@/components/ChatHistory/Desktop";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { useUserStore } from "@/store/userStore";
import { saveLocalMessages, getLocalMessages } from "@/store/saveMessages";

const pacifico = Pacifico({
  subsets: ["latin"],
  weight: ["400"],
});

const libreBaskerville = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"],
});

export default function ChatPage() {
  const searchParams = useSearchParams();
  const [input, setInput] = useState<string>("");
  const { user } = useUserStore();
  const [messages, setMessages] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatId = searchParams.get("chatId");
  const getMessages = useQuery(
    api.messages.get,
    chatId ? { chatId: chatId as Id<"chats"> } : "skip"
  );

  useEffect(() => {
    if (searchParams.get("new")) {
      setMessages([]);
    }
  }, [searchParams]);

  useEffect(() => {
    if (chatId) {
      const messages = getLocalMessages(chatId);
      setMessages(messages);
    }

    if (chatId && getMessages) {
      if (getMessages.length === 0) {
        const newMessages = [
          {
            role: "assistant",
            content: "Hello, how can I help you today?",
            createdAt: Date.now(),
          },
        ];
        setMessages(newMessages);
        saveLocalMessages(newMessages, chatId);
      } else {
        const newMessages = getMessages
          .slice()
          .reverse()
          .flatMap((message) => [
            {
              role: "user",
              content: message.userMessage,
              createdAt: message.createdAt,
              fileUrl: "",
              fileType: "",
              fileName: "",
            },
            {
              role: "assistant",
              content: message.botResponse,
              createdAt: message.createdAt,
              fileUrl: "",
              fileType: "",
              fileName: "",
            },
          ]);
        setMessages(newMessages);
        saveLocalMessages(newMessages, chatId);
      }
    }
  }, [getMessages, chatId]);

  const handleSendMessage = useCallback(
    async (messageContent: string, isInitialMessage: boolean) => {
      console.log("handleSendMessage", messageContent, isInitialMessage);
      return Promise.resolve();
    },
    []
  );

  return (
    <div className={`flex w-full h-full dark:bg-[#222325] bg-[#f8f8f7]`}>
      {/* Chat History - Hidden on mobile by default */}
      <Head>
        <title>Better Index</title>
        <meta name="description" content="example description" />
      </Head>
      <div
        className={cn(
          "hidden lg:block max-w-[300px] w-full h-full fixed md:relative z-50 transition-transform duration-200 ease-in-out scrollbar-hide"
        )}
      >
        <ChatHistoryDesktop isNewUser={false} isLoading={false} />
      </div>

      {/* Main Chat Area */}
      <div
        className={`flex flex-col w-full dark:bg-[#272728] bg-[#f8f8f7] lg:mt-0 `}
      >
        <div className="lg:hidden">
          <Header />
        </div>

        <div
          className={`flex flex-col w-full ${
            searchParams.get("new")
              ? "h-[calc(100vh-150px)] items-center justify-center"
              : "h-full"
          }`}
        >
          {/* Show HeroSection for new chats */}
          {searchParams.get("new") ? (
            // <HeroSection setInput={setInput} />
            <div className="mx-auto px-4 text-center md:w-[750px] select-none">
              <p
                className={`text-3xl text-left ml-2 font-[400] dark:text-[#dadada] font-sans ${libreBaskerville.className}`}
              >
                <span className={`${pacifico.className} text-3xl`}></span>
                Hello {user?.name || "there"}
              </p>
              <p
                className={`text-2xl text-left ml-2 font-[400] text-[#7f7f7f] mt-2 ${libreBaskerville.className}`}
              >
                What can I do for you?
              </p>
            </div>
          ) : /* Show loading spinner when loading an existing chat with no messages yet */
          messages.length === 0 && !input ? (
            <div className="flex justify-center items-center h-full">
              <Spinner />
            </div>
          ) : (
            /* Show main chat interface */
            <>
              <div className="overflow-y-scroll h-full [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-track]:bg-transparent dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500 mt-12 lg:mt-0">
                <div className="max-w-[780px] mx-auto px-4 mt-5 md:pl-10">
                  {messages.map((message, index) => (
                    <MemoizedRenderMessageOnScreen
                      key={index}
                      message={message}
                      index={index}
                      messages={messages}
                      chatInitiated={false}
                      setMessages={setMessages}
                      handleSendMessage={handleSendMessage}
                    />
                  ))}
                  <div ref={messagesEndRef} className="pb-[130px]" />
                </div>
              </div>
            </>
          )}

          <div className="w-full mx-auto max-w-[750px]">
            <div
              className={`mx-auto ${
                searchParams.get("new")
                  ? "mt-4"
                  : "fixed bottom-0 pb-2 bg-white dark:bg-[#272728]"
              }`}
            >
              <InputBox />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
