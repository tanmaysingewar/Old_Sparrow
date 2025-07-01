import React, { useEffect, useState } from "react";
import { useUserSearchInput } from "@/store/userSearchInput";
import { Poppins } from "next/font/google";
import Image from "next/image";
import logo from "@/assets/image.png";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

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
    <div
      className={`flex h-fit flex-col bg-transparent rounded-sm border border-neutral-800 ${poppins.className}`}
    >
      <span className="text-neutral-300 text-sm ">
        Select any 5 policies in which you are interested
      </span>
      <div className="flex flex-row flex-wrap select-none mt-2">
        {policies.map(
          (policy: { name: string; description: string; logo: string }) => (
            <div
              key={policy.name}
              className="flex flex-row items-center mr-1 mb-2 transition-colors cursor-pointer"
              onClick={() => handlePolicyToggle(policy.name)}
            >
              <div
                className={`text-xs font-medium whitespace-nowrap p-1 px-1 pr-2 flex flex-row items-center gap-2 rounded-full ${
                  selectedPolicies.includes(policy.name)
                    ? "bg-white text-black"
                    : "bg-[#323234] text-white "
                }`}
              >
                <Image
                  src={logo}
                  alt={policy.name}
                  width={20}
                  height={20}
                  className="rounded-full"
                />
                <span className="text-xs">{policy.name}</span>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
