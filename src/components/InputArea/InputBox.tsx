"use client";
import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import { motion } from "framer-motion";
import {
  OctagonPause,
  Send,
  Paperclip,
  Loader2,
  X,
  MessageSquareMore,
  Atom,
  ZapIcon,
} from "lucide-react";
import { Button } from "../ui/button";
import TextInput, { TextInputRef } from "./TextInput";
import PDFIcon from "./assets/pdf";
import DOCIcon from "./assets/doc";

interface InputBoxProps {}

// Define the ref interface for InputBox
export interface InputBoxRef {
  focus: () => void;
}

const InputBox = forwardRef<InputBoxRef, InputBoxProps>(
  function InputBox(props, ref) {
    const [input, setInput] = useState<string>("");
    const [height, setHeight] = useState<number>(50);
    const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>(
      []
    );
    const [selectedIndex, setSelectedIndex] = useState<number>(0);
    const textInputRef = useRef<TextInputRef>(null);
    const [mode, setMode] = useState<"auto" | "chat" | "agent">("auto");

    return (
      <div>
        <div className="max-w-3xl text-base font-sans lg:px-0 w-screen md:rounded-t-3xl px-2 select-none rounded-3xl">
          <div className="flex flex-col items-center rounded-3xl dark:bg-[#212122] bg-neutral-100/70 p-2 w-full backdrop-blur-xs">
            {/* File Content Indicator */}
            {true && (
              <div className="mx-3 mb-2 w-full">
                <div
                  className={`flex items-start rounded-xl px-3 py-2 bg-[#f3f3f3] dark:bg-[#424143] w-fit`}
                >
                  <div className="flex items-center space-x-2 mr-10">
                    <PDFIcon className="w-8 h-8" />
                    <div className="flex flex-col">
                      <span className={`text-sm text-white dark:text-white`}>
                        empty.pdf
                      </span>
                      <span className="text-xs text-neutral-500 dark:text-neutral-400">
                        PDF - 0 MB
                      </span>
                    </div>
                  </div>
                  <button className="text-[#7bc2de] dark:text-[#7bc2de] hover:text-[#8fdfff] dark:hover:text-[#8fdfff] text-sm cursor-pointer">
                    <X className="w-4 h-4 text-transparent hover:text-white hover:bg-white/10 rounded-full p-1" />
                  </button>
                </div>
              </div>
            )}
            <TextInput
              ref={textInputRef}
              input={input}
              setInput={setInput}
              height={height}
              onSend={() => {}}
              filteredSuggestions={filteredSuggestions}
              selectedIndex={selectedIndex}
              setSelectedIndex={setSelectedIndex}
              handleSelection={() => {}}
              handleInputChange={() => {}}
              disabled={false}
            />
            <div className="flex flex-row justify-between w-full mt-0">
              <div className="flex flex-row mt-2 dark:text-neutral-200 mx-2 mb-2 justify-center items-center gap-2">
                <div className="mt-0 flex flex-row gap-3">
                  <div
                    className={`flex flex-row items-center justify-center rounded-full border cursor-pointer bg-transparent text-neutral-500 dark:text-neutral-400 border-neutral-300 dark:border-neutral-600`}
                  >
                    <label
                      htmlFor="file-upload"
                      className={`flex flex-row items-center p-1.5 ${
                        false ? "cursor-wait" : "cursor-pointer"
                      }`}
                    >
                      {false ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Paperclip className="w-[18px] h-[18px]" />
                      )}
                    </label>
                  </div>
                </div>
                <div className="flex flex-row items-center bg-neutral-200 dark:bg-[#2b2a2c] rounded-full relative w-fit p-[1px]">
                  <motion.div
                    className="absolute bg-white dark:bg-[#3e3d3e] rounded-full shadow-sm"
                    initial={false}
                    animate={{
                      x: mode === "auto" ? 2 : mode === "chat" ? 37 : 72,
                      width: 34,
                      height: 29,
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
                </div>
              </div>
              <div className="flex flex-row justify-center items-center">
                <p className="text-xs dark:text-neutral-400 text-neutral-500 mr-3 hidden md:block select-none">
                  Use{" "}
                  <span className="dark:text-white text-black">
                    shift + return
                  </span>{" "}
                  for new line
                </p>
                <Button className="p-2 h-[38px] w-[38px] rounded-full dark:bg-neutral-200 bg-neutral-800">
                  {/* {!(disabled || isUploading) ? <Send /> : <OctagonPause />} */}
                  <Send />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

const promptSuggestions: string[] = [];

export default InputBox;
