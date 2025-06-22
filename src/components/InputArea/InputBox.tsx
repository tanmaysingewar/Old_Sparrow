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
import {
  // UploadButton,
  // UploadDropzone,
  useUploadThing,
} from "@/lib/uploadthing";
import { useDropzone } from "@uploadthing/react";
import {
  generateClientDropzoneAccept,
  generatePermittedFileTypes,
} from "uploadthing/client";
import models from "@/support/models";
import PDFIcon from "./assets/pdf";
import DOCIcon from "./assets/doc";

interface InputBoxProps {
  input: string;
  setInput: (value: string) => void;
  onSend: (message: string) => void;
  height: number;
  disabled?: boolean;
  selectedModel: string;
  fileUrl: string;
  setFileUrl: (value: string) => void;
  fileType: string;
  setFileType: (value: string) => void;
  fileName: string;
  setFileName: (value: string) => void;
}

// Define the ref interface for InputBox
export interface InputBoxRef {
  focus: () => void;
}

const InputBox = forwardRef<InputBoxRef, InputBoxProps>(function InputBox(
  {
    input,
    setInput,
    onSend,
    height,
    disabled,
    selectedModel,
    fileUrl,
    setFileUrl,
    setFileType,
    fileName,
    setFileName,
  },
  ref
) {
  // Create a ref for the TextInput component
  const textInputRef = useRef<TextInputRef>(null);

  // Expose focus method to parent components
  useImperativeHandle(ref, () => ({
    focus: () => {
      textInputRef.current?.focus();
    },
  }));

  // Model definitions

  const lastWord = input.split(" ").slice(-1)[0];
  const hasExistingTone = input
    .split(" ")
    .some((word) => word.startsWith("#") && word !== lastWord);

  const filteredSuggestions =
    lastWord.startsWith("#") && !hasExistingTone
      ? promptSuggestions.filter((suggestion) =>
          suggestion
            .toLowerCase()
            .includes(lastWord.trim().replace("#", "").toLowerCase())
        )
      : // .slice(0, 5)
        [];

  const selectedModelData =
    models.find((m) => m.id === selectedModel) || models[0];

  const [selectedIndex, setSelectedIndex] = useState(0);
  const suggestionsContainerRef = useRef<HTMLDivElement>(null);
  const suggestionItemRefs = useRef<(HTMLParagraphElement | null)[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const [fileData, setFileData] = useState<{
    name: string;
    type: string;
    size: number;
  } | null>(null);

  const [mode, setMode] = useState("auto");

  // Auto-scroll selected item into view
  useEffect(() => {
    if (
      filteredSuggestions.length > 0 &&
      suggestionItemRefs.current[selectedIndex]
    ) {
      suggestionItemRefs.current[selectedIndex]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [selectedIndex, filteredSuggestions.length]);

  // Reset suggestion refs when suggestions change
  useEffect(() => {
    suggestionItemRefs.current = suggestionItemRefs.current.slice(
      0,
      filteredSuggestions.length
    );
  }, [filteredSuggestions]);

  const handleSelection = useCallback(
    (selection: string) => {
      const tokens = input.split(" ");
      const lastToken = tokens[tokens.length - 1];

      if (lastToken.startsWith("#")) {
        const newTokens = tokens.filter((token, index) => {
          // Keep the current token if it's the last one
          if (index === tokens.length - 1) return true;
          // Remove any previous #words
          return !token.startsWith("#");
        });
        newTokens[newTokens.length - 1] = "#" + selection + " ";
        setInput(newTokens.join(" "));
      }
    },
    [input, setInput]
  );

  // Update input change handling in TextInput component
  const handleInputChange = useCallback(
    (newValue: string) => {
      const tokens = newValue.split(" ");
      const exclamationWords = tokens.filter((token) => token.startsWith("#"));

      if (exclamationWords.length > 1) {
        // Keep only the last !word
        const cleanedTokens = tokens.map((token, index) => {
          if (token.startsWith("#")) {
            // Keep only the last !word
            return index ===
              tokens.lastIndexOf(exclamationWords[exclamationWords.length - 1])
              ? token
              : token.substring(1); // Remove ! from other words
          }
          return token;
        });
        setInput(cleanedTokens.join(" "));
      } else {
        setInput(newValue);
      }
    },
    [setInput]
  );

  useEffect(() => {
    // Only reset selection index when the actual list of suggestions changes
    // We'll compare the current input's last token to determine if suggestions changed
    setSelectedIndex(0);
  }, [input.split(" ").slice(-1)[0]]);

  // Determine upload route based on model capabilities
  const uploadRoute =
    selectedModelData.imageUpload && !selectedModelData.docsUpload
      ? "imageUploader"
      : "mediaUploader";

  const { startUpload, routeConfig } = useUploadThing(uploadRoute, {
    onClientUploadComplete: (res) => {
      console.log("Upload completed:", res);
      setIsUploading(false);
      if (res && res.length > 0) {
        setFileUrl(res[0].url || "");
        setFileType(res[0].type || "");
      }
    },
    onUploadError: (error) => {
      console.error("Upload error:", error);
      setIsUploading(false);
    },
    onUploadBegin: (file) => {
      console.log("upload has begun for", file);
      setIsUploading(true);
    },
  });

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        setIsUploading(true); // Set loading immediately
        setFileName(acceptedFiles[0].name);
        startUpload(acceptedFiles);
        setFileData({
          name: acceptedFiles[0].name,
          type: acceptedFiles[0].type,
          size: acceptedFiles[0].size,
        });
        console.log({
          name: acceptedFiles[0].name,
          type: acceptedFiles[0].type,
          size: acceptedFiles[0].size,
        });
      }
    },
    [startUpload]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: generateClientDropzoneAccept(
      generatePermittedFileTypes(routeConfig).fileTypes
    ),
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsUploading(true);
    const file = e.target.files?.[0];
    if (file) {
      console.log(
        "Selected file:",
        file.name,
        "Type:",
        file.type,
        "Size:",
        file.size
      );
      setFileName(file.name);
      startUpload([file]);
      setFileData({
        name: file.name,
        type: file.type,
        size: file.size,
      });
      console.log({
        name: file.name,
        type: file.type,
        size: file.size,
      });
      setFileUrl(file.name);
      setFileType(file.type);
      setFileName(file.name);
    }
  };

  return (
    <div>
      <div className="max-w-3xl text-base font-sans lg:px-0 w-screen md:rounded-t-3xl px-2 select-none rounded-3xl">
        {filteredSuggestions.length > 0 && (
          <div className="mx-5">
            <div
              ref={suggestionsContainerRef}
              className="bg-[#303335]/20 backdrop-blur-xs rounded-t-md p-2 pb-3 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent no-scrollbar"
            >
              {filteredSuggestions.map((match, index) => (
                <p
                  key={index}
                  ref={(el) => {
                    suggestionItemRefs.current[index] = el;
                  }}
                  className={`mb-1 cursor-pointer rounded-sm p-1 ${
                    index === selectedIndex ? "bg-white/20" : ""
                  }`}
                  onClick={() => handleSelection(match)}
                >
                  <span className="text-white rounded-md px-2 py-1">
                    {match}
                  </span>
                </p>
              ))}
            </div>
          </div>
        )}
        <div className="flex flex-col items-center rounded-3xl dark:bg-[#363537] bg-neutral-100/70 p-2 w-full backdrop-blur-xs">
          {/* File Content Indicator */}
          {fileUrl && (
            <div className="mx-3 mb-2 w-full">
              <div
                className={`flex items-start rounded-xl px-3 py-2 bg-[#f3f3f3] dark:bg-[#424143] w-fit`}
              >
                <div className="flex items-center space-x-2 mr-10">
                  {fileData?.type === "application/pdf" ? (
                    <PDFIcon className="w-8 h-8" />
                  ) : (
                    <DOCIcon className="w-8 h-8" />
                  )}
                  <div className="flex flex-col">
                    <span className={`text-sm text-white dark:text-white`}>
                      {fileName}
                    </span>
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">
                      {fileData?.type.split("/")[1].toUpperCase()} -{" "}
                      {fileData
                        ? (fileData.size / 1024 / 1024).toFixed(2) + " MB"
                        : "0 MB"}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setFileUrl("");
                    setFileType("");
                    setFileName("");
                  }}
                  className="text-[#7bc2de] dark:text-[#7bc2de] hover:text-[#8fdfff] dark:hover:text-[#8fdfff] text-sm cursor-pointer"
                >
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
            onSend={onSend}
            filteredSuggestions={filteredSuggestions}
            selectedIndex={selectedIndex}
            setSelectedIndex={setSelectedIndex}
            handleSelection={handleSelection}
            handleInputChange={handleInputChange}
            disabled={disabled || isUploading}
          />
          <div className="flex flex-row justify-between w-full mt-0">
            <div className="flex flex-row mt-2 dark:text-neutral-200 mx-2 mb-2 justify-center items-center gap-2">
              <div className="mt-0 flex flex-row gap-3">
                {(selectedModelData.docsUpload ||
                  selectedModelData.imageUpload) && (
                  <div
                    className={`flex flex-row items-center justify-center rounded-full border cursor-pointer bg-transparent text-neutral-500 dark:text-neutral-400 border-neutral-300 dark:border-neutral-600`}
                    {...getRootProps()}
                  >
                    <input
                      type="file"
                      id="file-upload"
                      className="hidden"
                      accept={
                        selectedModelData.imageUpload &&
                        !selectedModelData.docsUpload
                          ? ".jpg,.jpeg,.png,.gif,.bmp,.webp,.svg"
                          : ".txt,.pdf,.doc,.docx"
                      }
                      onChange={handleFileUpload}
                      {...getInputProps()}
                      disabled={isUploading}
                    />
                    <label
                      htmlFor="file-upload"
                      className={`flex flex-row items-center p-1.5 ${
                        isUploading ? "cursor-wait" : "cursor-pointer"
                      }`}
                    >
                      {isUploading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Paperclip className="w-[18px] h-[18px]" />
                      )}
                    </label>
                  </div>
                )}
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
              <Button
                className="p-2 h-[38px] w-[38px] rounded-full dark:bg-neutral-200 bg-neutral-800"
                onClick={() => onSend(input)}
                disabled={disabled || isUploading}
              >
                {!(disabled || isUploading) ? <Send /> : <OctagonPause />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

const promptSuggestions: string[] = [];

export default InputBox;
