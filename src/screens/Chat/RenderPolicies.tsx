import React, { useEffect, useState } from "react";
import { useUserSearchInput } from "@/store/userSearchInput";
import { Poppins } from "next/font/google";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { getLocalMessages, saveLocalMessages } from "@/store/saveMessages";
import { useSearchParams } from "next/navigation";
import { useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Loader2 } from "lucide-react";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function RenderPolicies({
  policies,
}: {
  policies: {
    id: string;
    name: string;
    description: string;
    logo: string;
    pdf_url: string;
  }[];
}) {
  const [selectedPolicies, setSelectedPolicies] = useState<string[]>([]);
  const { userSearchInput, setUserSearchInput } = useUserSearchInput();
  const generate = useAction(api.generate.generate);
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {}, [selectedPolicies]);

  const handlePolicyToggle = (policyName: string) => {
    setSelectedPolicies((prev) => {
      if (prev.includes(policyName)) {
        // Always allow deselection
        return prev.filter((name) => name !== policyName);
      } else {
        // Only allow selection if we haven't reached the limit of 5
        if (prev.length < 5) {
          return [...prev, policyName];
        }
        // If limit reached, don't add the new policy
        return prev;
      }
    });
  };

  const handleSend = async () => {
    setIsLoading(true);
    const chatIdParam = searchParams.get("chatId");
    // update the local messages with the new message

    if (selectedPolicies.length > 0) {
      let text = `\`\`\`selected_policies
      {
      "policies_selection": true,
      "policies": [
        ${policies
          .filter((policy) => selectedPolicies.includes(policy.name))
          .map(
            (policy) => `{
          "id": "${policy.id}"
        }`
          )
          .join(",\n")}
        ]
      }
      \`\`\`I am interested in the following policies:`;
      selectedPolicies.forEach((policy) => {
        text += policy + ", ";
      });
      console.log(text);

      if (chatIdParam) {
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

        saveLocalMessages(localMessages, chatIdParam);
        // generate the response
        await generate({
          chatId: chatIdParam,
          userMessage: text,
        });
      }
    }
    setIsLoading(false);
  };

  return (
    <div
      className={`flex flex-col bg-transparent rounded-sm ${poppins.className}`}
    >
      <span className="text-neutral-700 text-sm dark:text-neutral-300">
        Select up to 5 policies in which you are interested (
        {selectedPolicies.length}/5 selected)
      </span>
      <div className="flex flex-row flex-wrap select-none mt-2">
        {policies.map(
          (policy: { name: string; description: string; logo: string }) => {
            const isSelected = selectedPolicies.includes(policy.name);
            const isDisabled = !isSelected && selectedPolicies.length >= 5;

            return (
              <div
                key={policy.name}
                className={`flex flex-row items-center mr-1 mb-2 transition-colors ${
                  isDisabled
                    ? "cursor-not-allowed opacity-50"
                    : "cursor-pointer"
                }`}
                onClick={() => !isDisabled && handlePolicyToggle(policy.name)}
              >
                <div
                  className={`text-xs font-medium whitespace-nowrap h-7 p-1 px-1 pr-2 flex flex-row items-center gap-2 rounded-full ${
                    isSelected
                      ? "dark:bg-white dark:text-black bg-[#262626] text-white"
                      : "dark:bg-[#323234] dark:text-white bg-white text-black "
                  }`}
                >
                  <Image
                    src={policy.logo}
                    alt={policy.name}
                    width={20}
                    height={20}
                    className="rounded-full object-cover"
                  />
                  <span className="text-xs">{policy.name}</span>
                </div>
              </div>
            );
          }
        )}
      </div>
      <div className="flex flex-row gap-2">
        <Button
          className="mt-2 w-fit cursor-pointer"
          variant={"secondary"}
          onClick={() => {
            setSelectedPolicies([]);
          }}
        >
          Clear
        </Button>
        <Button
          className="mt-2 w-fit cursor-pointer"
          onClick={handleSend}
          disabled={selectedPolicies.length === 0 || isLoading}
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send"}
        </Button>
      </div>
    </div>
  );
}
