import {
  useEffect,
  useRef,
  memo,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import { useUserSearchInput } from "@/store/userSearchInput";

interface TextInputProps {
  height: number;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
}

// Define methods that can be called on the TextInput ref
export interface TextInputRef {
  focus: () => void;
}

const TextInput = memo(
  forwardRef<TextInputRef, TextInputProps>(function TextInput(
    { height, onKeyDown },
    ref
  ) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const { userSearchInput, setUserSearchInput } = useUserSearchInput();

    // Expose focus method to parent components
    useImperativeHandle(ref, () => ({
      focus: () => {
        textareaRef.current?.focus();
      },
    }));

    const adjustHeight = useCallback(() => {
      const textarea = textareaRef.current;
      if (textarea) {
        // Reset height to auto first to get the correct scrollHeight
        textarea.style.height = height + "px";
        // Set the height to match the content
        const scrollHeight = textarea.scrollHeight;
        textarea.style.height = `${Math.min(scrollHeight, 200)}px`;
      }
    }, [height]);

    // Adjust height when input changes
    useEffect(() => {
      adjustHeight();
    }, [userSearchInput.text, adjustHeight]);

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setUserSearchInput({
          ...userSearchInput,
          text: e.target.value,
        });
      },
      [userSearchInput, setUserSearchInput]
    );

    return (
      <div className="relative w-full">
        <textarea
          ref={textareaRef}
          placeholder="How can I help you"
          value={userSearchInput.text}
          className="w-full bg-transparent resize-none overflow-y-auto rounded-lg focus:outline-none caret-black dark:caret-white p-3 placeholder:text-neutral-400 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-track]:bg-transparent dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500"
          style={{
            fontSize: "16px",
            fontWeight: "400",
            maxHeight: "200px",
            height: height + "px",
          }}
          onChange={handleChange}
          onKeyDown={onKeyDown}
        />
      </div>
    );
  })
);

export default TextInput;
