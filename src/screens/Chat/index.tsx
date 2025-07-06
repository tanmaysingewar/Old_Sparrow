"use client";
import React, { useState, useRef, useEffect } from "react";
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
import { useUserStore } from "@/store/userStore";
import { saveLocalMessages, getLocalMessages } from "@/store/saveMessages";
import { Sidebar } from "lucide-react";
import { useUserChats } from "@/store/userChats";
import { useCredits } from "@/store/creditStore";

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
  const { user } = useUserStore();
  const [hideChatHistory, setHideChatHistory] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [messages, setMessages] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatId = searchParams.get("chatId");
  const [disableChat, setDisableChat] = useState(false);
  const getMessages = useQuery(
    api.messages.get,
    chatId ? { chatId: chatId } : "skip"
  );
  const credits = useQuery(api.coupon.getUserCredits);
  const getChats = useQuery(api.chats.get);
  const [chats, setChats] = useState<Chat[]>([]);
  const [chatLoadings, setChatLoadings] = useState(true);

  useEffect(() => {
    if (searchParams.get("new")) {
      setMessages([]);
      setDisableChat(false);
    }
  }, [searchParams]);

  useEffect(() => {
    if (chatId) {
      const messages = getLocalMessages(chatId);
      setMessages(messages);
      setDisableChat(false);
    }

    // get userChat and set isDisabled
    const userChat = useUserChats
      .getState()
      .userChats.find((chat) => chat.customChatId === chatId);
    if (userChat) {
      setDisableChat(userChat.isDisabled || false);
    }

    if (chatId && getMessages) {
      if (getMessages.length === 0) {
        return;
      } else {
        const newMessages = getMessages
          .slice()
          .reverse()
          .flatMap((message) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const messages: any[] = [
              {
                role: "user" as const,
                content: message.userMessage,
                createdAt: message.createdAt,
                fileUrl: "",
                fileType: "",
                fileName: "",
              },
            ];

            // Add assistant messages for each bot response
            if (message.botResponses && message.botResponses.length > 0) {
              message.botResponses.forEach((botResponse, index) => {
                messages.push({
                  role: "assistant" as const,
                  content: botResponse.response,
                  createdAt: message.createdAt,
                  fileUrl: "",
                  fileType: "",
                  fileName: "",
                  researchItems: botResponse.researchItems,
                  botResponseIndex: index,
                });
              });
            }

            return messages;
          });
        setMessages(newMessages);
        saveLocalMessages(newMessages, chatId);
      }
    }
  }, [getMessages, chatId]);

  useEffect(() => {
    const userChats = useUserChats.getState().userChats;
    setChats(
      userChats.map((chat) => ({
        id: chat._id,
        title: chat.title,
        createdAt: chat.createdAt.toString(),
        isShared: chat.isShared || false,
        userId: chat.userId,
        category: chat.category || "Untitled Chat",
        customChatId: chat.customChatId,
        isDisabled: chat.isDisabled || false,
      })) || []
    );

    setChatLoadings(true);

    if (getChats) {
      const newChats = getChats.map((chat) => ({
        id: chat._id,
        title: chat.title,
        createdAt: chat.createdAt.toString(),
        isShared: chat.isShared || false,
        userId: chat.userId,
        category: chat.category || "Untitled Chat",
        customChatId: chat.customChatId,
        isDisabled: chat.isDisabled || false,
      }));
      useUserChats.setState({ userChats: newChats || [] });
      setChats(newChats);
      setChatLoadings(false);
      // set isDisabled for the chat
      const userChat = newChats.find((chat) => chat.customChatId === chatId);
      if (userChat) {
        setDisableChat(userChat.isDisabled || false);
      }
    }
  }, [getChats]);

  useEffect(() => {
    if (credits !== null) {
      useCredits.setState({ credits: { credits: credits || 0 } });
    } else {
      useCredits.setState({ credits: { credits: 0 } });
    }
  }, [credits]);

  return (
    <div
      className={`flex w-full h-full dark:bg-[#222325] bg-[#f8f8f7] overflow-hidden`}
    >
      {/* Chat History - Hidden on mobile by default */}
      <Head>
        <title>Old Sparrow</title>
        <meta name="description" content="example description" />
      </Head>

      {!hideChatHistory ? (
        <div
          className={cn(
            "hidden lg:block max-w-[300px] w-full h-full fixed md:relative z-50 transition-transform duration-200 ease-in-out scrollbar-hide"
          )}
        >
          <ChatHistoryDesktop
            hideChatHistory={hideChatHistory}
            setHideChatHistory={setHideChatHistory}
            chats={chats}
            chatLoadings={chatLoadings}
          />
        </div>
      ) : (
        <div className="bg-[#f8f8f7] dark:bg-[#272728]">
          <div
            className="m-1 ml-2 mt-3 hover:cursor-pointer hover:bg-neutral-200 dark:hover:bg-[#1a1a1a] rounded-sm p-1 w-fit text-neutral-400"
            onClick={() => setHideChatHistory(!hideChatHistory)}
          >
            <Sidebar size={20} />
          </div>
        </div>
      )}

      {/* Main Chat Area */}
      <div
        className={`flex flex-col w-full dark:bg-[#272728] bg-[#f8f8f7] lg:mt-0 h-full`}
      >
        <div className="lg:hidden">
          <Header chats={chats} chatLoadings={chatLoadings} />
        </div>

        <div
          className={`flex flex-col w-full ${
            searchParams.get("new")
              ? "h-[calc(100vh-150px)] items-center justify-center"
              : "flex-1 min-h-0"
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
          messages.length === 0 ? (
            <div className="flex justify-center items-center h-full">
              <Spinner />
            </div>
          ) : (
            /* Show main chat interface */
            <>
              <div className="overflow-y-scroll h-full [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-track]:bg-transparent dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500 lg:mt-0">
                <div className="max-w-[780px] mx-auto px-4 mt-5 md:pl-10">
                  {messages.map((message, index) => (
                    <MemoizedRenderMessageOnScreen
                      key={index}
                      message={message}
                      index={index}
                      messages={messages}
                      setMessages={setMessages}
                    />
                  ))}
                  <div ref={messagesEndRef} className="pb-[130px]" />
                </div>
              </div>
            </>
          )}

          {!disableChat && (
            <div className="w-full mx-auto max-w-[750px]">
              <div
                className={`mx-auto ${
                  searchParams.get("new")
                    ? "mt-4"
                    : "fixed bottom-0 pb-2 bg-[#f8f8f7] dark:bg-[#272728]"
                }`}
              >
                <InputBox setMessages={setMessages} messages={messages} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
