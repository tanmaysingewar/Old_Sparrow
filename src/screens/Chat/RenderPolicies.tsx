import React, { useEffect, useState } from "react";
import { useUserSearchInput } from "@/store/userSearchInput";
import { Poppins } from "next/font/google";
import Image from "next/image";

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

  useEffect(() => {
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
      setUserSearchInput({
        ...userSearchInput,
        text: text,
      });
    } else {
      setUserSearchInput({
        ...userSearchInput,
        text: "",
      });
    }
  }, [selectedPolicies]);

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

  return (
    <div
      className={`flex h-fit flex-col bg-transparent rounded-sm ${poppins.className}`}
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
    </div>
  );
}
