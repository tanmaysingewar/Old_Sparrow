import React, { useEffect, useState } from "react";
import { useUserSearchInput } from "@/store/userSearchInput";

export default function RenderPolicies({
  policies,
}: {
  policies: { name: string; description: string; logo: string }[];
}) {
  const [selectedPolicies, setSelectedPolicies] = useState<string[]>([]);
  const { userSearchInput, setUserSearchInput } = useUserSearchInput();

  useEffect(() => {
    if (selectedPolicies.length > 0) {
      let text = `\`\`\`selected_policies
      {
      "policies_selection": true 
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
    setSelectedPolicies((prev) =>
      prev.includes(policyName)
        ? prev.filter((name) => name !== policyName)
        : [...prev, policyName]
    );
  };

  return (
    <div className="flex flex-col bg-[#1a1a1a] rounded-sm p-3 border border-neutral-800 font-lora">
      <span className="text-neutral-400 text-xs font-lora">
        Select the policies you are interested in
      </span>
      <div className="flex flex-row flex-wrap select-none mt-2">
        {policies.map(
          (policy: { name: string; description: string; logo: string }) => (
            <div
              key={policy.name}
              className="flex items-center pr-1 pb-2 transition-colors cursor-pointer"
              onClick={() => handlePolicyToggle(policy.name)}
            >
              <span
                className={`text-xs font-medium whitespace-nowrap rounded-xl p-1 px-2 ${
                  selectedPolicies.includes(policy.name)
                    ? "bg-white text-black"
                    : "bg-neutral-800 text-white "
                }`}
              >
                {policy.name}
              </span>
            </div>
          )
        )}
      </div>
    </div>
  );
}
