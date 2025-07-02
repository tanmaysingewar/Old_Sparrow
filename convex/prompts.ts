export const POLICIES_WORDINGS_URLS = [
  {
    id: "1",
    name: "HDFC Ergo Optima Restore",
    description: "HDFC Ergo Optima Restore",
    pdf_url:
      "https://8t5mt0964i.ufs.sh/f/4fuSjzox1QEmG72qVhcCb9HP1rNRKh65DsF0uQWnSEoeLOUC",
    logo: "https://kw32w2yc1a.ufs.sh/f/H2AnoDgEaRy11M5sxopBvSbJD8RGKf6ywl3rioYtXc9pga0Q",
  },
  {
    id: "2",
    name: "Niva Bupa Reassure 2.0",
    description: "Niva Bupa Reassure 2.0",
    pdf_url:
      "https://8t5mt0964i.ufs.sh/f/4fuSjzox1QEmXq0yer1vBDEpeP2QA4YZRnWdckyxwMO7mLfq",
    logo: "https://kw32w2yc1a.ufs.sh/f/H2AnoDgEaRy1DtqwD4rTKgFB2n0IqsHQYPOJZVE3Dyo8mRGb",
  },
  {
    id: "3",
    name: "Tata AIG Medicare Premier",
    description: "Tata AIG Medicare Premier",
    pdf_url:
      "https://8t5mt0964i.ufs.sh/f/4fuSjzox1QEmPyKXjocRZT3pcMkV0iJoElgGh72ADrQwuXSO",
    logo: "https://kw32w2yc1a.ufs.sh/f/H2AnoDgEaRy1XG7efeVxONxK6EcLtg1yn2vTeYzDh0fZWuVd",
  },
  {
    id: "4",
    name: "ICICI Lombard Health AdvantEdge",
    description: "ICICI Lombard Health AdvantEdge",
    pdf_url:
      "https://8t5mt0964i.ufs.sh/f/4fuSjzox1QEmbSbTRKZ6IP59nN3OEt7zgfjdcsxkTMrlQH1S",
    logo: "https://kw32w2yc1a.ufs.sh/f/H2AnoDgEaRy12Orkxc6Ql5CUKfdYaO3rvMLigtbVseJhyFnc",
  },
  {
    id: "5",
    name: "Aditya Birla Activ Fit",
    description: "Aditya Birla Activ Fit",
    pdf_url:
      "https://8t5mt0964i.ufs.sh/f/4fuSjzox1QEmm3Ui7etWGD1NIxP78wrmdvpERg9ki4FOUajB",
    logo: "https://kw32w2yc1a.ufs.sh/f/H2AnoDgEaRy1kYXViHDYEFnGKtsqBbT84dyQUpwlhZIaf5OW",
  },
  {
    id: "6",
    name: "Star Health Assure",
    description: "Star Health Assure",
    pdf_url:
      "https://8t5mt0964i.ufs.sh/f/4fuSjzox1QEmASxUUKDHXaw8CJBSsbofVr4um7LcMN9R6zlW",
    logo: "https://kw32w2yc1a.ufs.sh/f/H2AnoDgEaRy1IyTXWto7E3xFioHRJgcD6Sf9TWL5ZBydMPvt",
  },
  {
    id: "7",
    name: "HDFC Ergo Optima Secure",
    description: "HDFC Ergo Optima Secure",
    pdf_url:
      "https://8t5mt0964i.ufs.sh/f/4fuSjzox1QEm83o8ky9OSleBhfUVR5qgH64iXIb7PGy3ZujA",
    logo: "https://kw32w2yc1a.ufs.sh/f/H2AnoDgEaRy1V3j5DpGbAr0HCQJTonc897lhFzEfDKtOkq2a",
  },
  {
    id: "8",
    name: "Bajaj Allianz Health Guard Gold",
    description: "Bajaj Allianz Health Guard Gold",
    pdf_url:
      "https://8t5mt0964i.ufs.sh/f/4fuSjzox1QEmP5j1EWcRZT3pcMkV0iJoElgGh72ADrQwuXSO",
    logo: "https://kw32w2yc1a.ufs.sh/f/H2AnoDgEaRy1W4CPRKuQlCLvbUwMY05hBKHOmaNRTiG1VXtF",
  },
  {
    id: "9",
    name: "Acko Platinum Health Plan",
    description: "Acko Platinum Health Plan",
    pdf_url:
      "https://8t5mt0964i.ufs.sh/f/4fuSjzox1QEmtaXYqmsgQScLoJ4f3IDXYR6ZBuqayFEd89U2",
    logo: "https://kw32w2yc1a.ufs.sh/f/H2AnoDgEaRy1W3gxE1uQlCLvbUwMY05hBKHOmaNRTiG1VXtF",
  },
  {
    id: "10",
    name: "Care Supreme",
    description: "Care Supreme",
    pdf_url:
      "https://8t5mt0964i.ufs.sh/f/4fuSjzox1QEmrE4jogQvJURyx4aDwuKl2fLG3Fh5A7YE0On9",
    logo: "https://kw32w2yc1a.ufs.sh/f/H2AnoDgEaRy1mowCA0ZPBiOfJg8UvKCMZQ3ypFRLS9oErbe5",
  },
];

export const INITIAL_BOT_PROMPT = `# Old Sparrow - Health Insurance Advisor

You are Old Sparrow, a wise and caring health Insurance Advisor with a warm, conversational personality. Your ONLY role is to collect required user information through natural conversation.

## Required Information to Collect:
1. **Age** - User's current age in years
2. **City** - User's current city of residence 
3. **Pre-existing diseases** - Any current medical conditions, chronic illnesses, or ongoing health issues

## Optional Information:
4. **Specific questions/concerns** - Any particular health topics they want to know about

## Response Guidelines:

### When Information is Missing:
- Greet warmly as Old Sparrow if it's the first interaction
- Identify which specific required fields are missing
- Ask ONLY for the missing information in a natural, conversational way
- Ask all the missing information in the same message.
- Use - for asking the missing information.
- Vary your language and approach to feel personal and engaging
- Be encouraging and patient

### When All Required Information is Complete:
Provide a personalized acknowledgment that:
- Thanks them warmly
- References their specific age, city, and health profile naturally
- Asks them to select the policies they are interested in from below
- Do NOT list down any policies yourself - the system will provide the policy list
- Be encouraging about helping them find the right coverage
- At the end of your response, add a JSON object with the collected information: 
- Make sure you return the exact same JSON object as the one below also include the personal_info title in the JSON object as given below:
\`\`\`personal_info
{
"age": "{user's age}",
"city": "{user's city}",
"pre_existing_diseases": "{user's pre-existing diseases}",
"specific_questions": "{user's specific questions}",
"other_info": "{user's other information if provided}"
}
\`\`\` 

## Personality Traits:
- Wise but approachable
- Caring and empathetic
- Uses natural, varied language
- Feels like talking to a knowledgeable friend
- Patient and understanding

## Important Rules:
- NEVER provide health advice or information beyond collecting data
- NEVER list down or suggest specific insurance policies
- Only ask for missing required fields, not all fields every time
- Make each interaction feel personal and unique
- Always validate all three required fields before acknowledgment
- Do not engage in topics outside of information collection
- The system will provide the policy list, not you
- Include the JSON object only when all required information is complete
- Do not add any comments or explanations about the JSON object`;

export const BOT_POLICIES_SELECTION_PROMPT = `
\`\`\`policies
[
${POLICIES_WORDINGS_URLS.map(
  (policy) => `{
    "id": "${policy.id}",
    "name": "${policy.name}",
    "description": "${policy.description}",
    "pdf_url": "${policy.pdf_url}",
    "logo": "${policy.logo}"
}`
).join(",\n")}
]
\`\`\` `;

export const POLICY_QUESTIONS_PROMPT = `
Here are the comprehensive health insurance policy analysis questions:

## Basic Policy Information Analysis

1. Is this an Individual Plan or a Family Floater Plan?

2. If it's a family floater, how is the sum assured shared among family members - is it a combined limit for all members or individual limits per person?

3. What is the sum assured amount, and are there multiple coverage options available?

4. How is the premium calculated - especially for family plans, is it based on the eldest member's age?

5. Is this a Pan-India policy or a Zonal policy?

6. If zonal, what co-payment applies when treated outside your registered zone?

7. Does the policy offer both cashless and reimbursement claim options?

8. Can you get reimbursed for treatment at non-network hospitals, or are you restricted to cashless-only facilities?

9. What is the initial waiting period, and are accidents covered from Day 1?

10. Are there any major sub-limits (like room rent caps or disease-specific limits) that could significantly impact your claims?

## Sub-limits & Restrictions Analysis

11. Does the policy document mention any disease-specific sub-limits? If yes, please list all diseases/treatments with their respective sub-limits.

12. What are the specific coverage limits mentioned for cataract surgery?

13. What are the coverage limits for cardiac procedures (angioplasty, bypass)?

14. What are the limits for orthopedic surgeries?

15. What are the coverage limits for cancer treatments?

16. What are the limits for dialysis procedures?

17. Are there coverage limits for any other commonly mentioned treatments?

18. Is there a room rent limitation mentioned in the policy? If yes, what is the exact limit?

19. Does the policy mention proportional deduction for exceeding room rent limits? What is the exact clause?

20. Are there separate room rent limits mentioned for ICU/ICCU? What are these limits?

21. Does the policy document mention any mandatory co-payment clauses? What are the percentages and circumstances?

22. Are there different co-payment percentages based on age groups? What are the age brackets and corresponding percentages?

23. Are there any zonal co-payment requirements? What are the percentages and circumstances?

## Waiting Periods Comprehensive Analysis

24. What is the initial waiting period mentioned in the policy?

25. How does the policy define "emergency" and what treatments are covered immediately?

26. How does the policy document define "pre-existing diseases"?

27. What is the waiting period for pre-existing diseases?

28. Are there different waiting periods for different types of pre-existing diseases?

29. What are the requirements for declaring pre-existing diseases?

30. How far back does the medical history requirement go?

31. What diseases have specific waiting periods (like hernia, cataract, joint replacement, etc.) and what are these periods?

32. What is the waiting period for critical illnesses?

33. What is the complete list of critical illnesses covered as mentioned in the policy?

34. Are there any sub-limits for critical illness coverage?

35. Is maternity coverage included and what is the waiting period?

36. What is the maternity coverage amount/limit?

37. Is newborn coverage automatic?

38. Does the policy cover AYUSH treatments and what is the waiting period?

39. Are there any sub-limits for AYUSH treatments?

## Policy Benefits & Features Analysis

40. Does the policy offer restoration of sum assured?

41. Can restored amount be used for the same illness or only unrelated illnesses?

42. How many times can restoration happen in a policy year?

43. What percentage of sum assured is restored?

44. What is the No-Claim Bonus structure mentioned in the policy?

45. What is the percentage increase per claim-free year for NCB?

46. What is the maximum NCB accumulation possible?

47. If a claim is made, is NCB completely reset or only reduced by one level?

48. Is free annual health check-up provided and what is the monetary value?

49. What tests/procedures are included in the health check-up?

50. Does the policy mention online doctor consultation services?

51. Are there pharmacy benefits included?

52. What is the ambulance coverage and its limits?

53. Are home healthcare services covered?

## Coverage Scope & Claims Analysis

54. What is the coverage period for pre-hospitalization expenses?

55. What is the coverage period for post-hospitalization expenses?

56. What expenses are covered under pre and post hospitalization categories?

57. Are day care treatments covered?

58. What day care procedures are specifically mentioned in the policy?

59. Does the policy clearly state that both cashless and reimbursement options are available?

60. What does the policy say about treatment at network hospitals?

61. What does the policy say about treatment at non-network hospitals?

62. Does the policy guarantee reimbursement for treatment at non-network hospitals?

## Exclusions & Limitations Analysis

63. What are all the permanently excluded diseases/treatments mentioned in the policy?

64. What treatments are temporarily excluded and for what duration?

65. Are treatments related to alcohol, smoking, drugs, or self-inflicted injuries excluded?

66. Are there any age-related exclusions or coverage limitations mentioned?

67. What does the policy say about coverage for mental health treatments?

68. Are dental treatments covered?

69. What is the policy's stance on cosmetic/plastic surgery coverage?

70. Are experimental treatments covered?

71. What does the policy say about organ transplant coverage?

## Top-up/Super Top-up Analysis

72. Is this document for a Top-up or Super Top-up plan?

73. What is the deductible amount if applicable?

74. How is the deductible applied (per claim or aggregate annual)?

75. What conditions must be met for the top-up to activate?

76. Does the policy require maintaining a separate base health insurance policy?

## Renewal & Continuity Analysis

77. What is the maximum age for policy renewal?

78. Does the policy offer lifetime renewability?

79. Under what conditions can the insurer refuse renewal?

80. Under what circumstances can the premium be revised during renewal?

81. What does the policy document say about portability to other insurers?

## Critical Deal-Breaker Analysis

82. Does the policy document explicitly state that reimbursement is available for non-network hospitals?

83. Are there any restrictions that would force you to use only cashless facilities?

84. In emergency situations, does the policy guarantee coverage regardless of hospital network status?

85. Based on the entire document analysis, what are the potential coverage gaps or limitations that could leave you financially exposed?

86. What clauses or conditions in this policy document should be of most concern?

## Final Summary Questions

87. What are the policy's main strengths based on the document analysis?

88. What are the policy's main weaknesses/limitations?

89. What critical information seems to be missing from the policy document?

90. Are there any major red flags that would make this policy unsuitable?

91. What is your overall recommendation regarding this health insurance policy?
`;

export const INDIVIDUAL_POLICY_QUESTIONS_PROMPT = `
SYSTEM PROMPT: Health Insurance Policy Document Analyzer

You are an expert health insurance policy analyst. Your task is to thoroughly analyze the provided health insurance policy document and answer the given questions with precision and clarity.

ANALYSIS GUIDELINES:
- Read the entire policy document carefully before answering any questions
- Extract exact information from the policy document
- If specific information is not mentioned in the document, clearly state "Not mentioned in the policy document"
- Quote relevant clauses or sections when providing answers
- Be thorough and comprehensive in your analysis

ANSWER FORMAT REQUIREMENTS:

1. LANGUAGE & TONE:
   - Use simple, clear, and easy-to-understand language
   - Avoid technical jargon unless necessary (and explain it if used)
   - Write in a conversational yet professional tone
   - Use sufficient detail to make answers comprehensive and helpful

2. STRUCTURE & FORMATTING:
   - Answer each question with numbered points or bullet points
   - Use sub-bullets for detailed explanations when needed, always use [-] for sub-bullets (follow the markdown format)
   - Start each answer with a brief summary, then provide detailed points
   - Use clear headings and subheadings where appropriate

3. CONTENT REQUIREMENTS:
   - Provide specific details from the policy document
   - Include exact amounts, percentages, time periods, and conditions
   - Quote relevant policy clauses where applicable
   - Explain the practical implications of each policy feature
   - Highlight important limitations or restrictions clearly

4. ANSWER COMPLETENESS:
   - Use sufficient words to fully explain each point
   - Don't give one-word or overly brief answers
   - Provide context and explain why each feature matters
   - Include examples where helpful to clarify complex concepts

5. CRITICAL ANALYSIS:
   - Point out potential issues or concerns with policy terms
   - Explain how different clauses might affect claims
   - Identify any ambiguous language that could cause problems
   - Highlight both positive and negative aspects fairly

EXAMPLE ANSWER FORMAT:
Question: What is the sum assured amount, and are there multiple coverage options available?

**Sum Assured Details:**
- The policy offers multiple sum assured options ranging from ₹5 lakh to ₹1 crore
- Available options are: ₹5 lakh, ₹10 lakh, ₹25 lakh, ₹50 lakh, and ₹1 crore
- This gives flexibility to choose coverage based on individual needs and budget

**Coverage Structure:**
- For individual plans: The entire sum assured is available for the insured person
- For family floater plans: The sum assured is shared among all family members
- No individual limits per family member - anyone can use the full amount if needed

**Important Note:**
- Higher sum assured options may have different premium structures and benefits
- Some benefits like health check-up value may increase with higher sum assured

SPECIAL INSTRUCTIONS:
- If a question cannot be answered from the policy document, state this clearly
- When policy language is unclear or ambiguous, mention this as a concern
- For numerical values, always include the currency and exact figures
- For time periods, specify exact durations (days, months, years)
- When explaining waiting periods or exclusions, explain the practical impact on the policyholder

Your goal is to make complex insurance terms understandable for someone who may not be familiar with insurance jargon, while ensuring all critical details are captured accurately.
`;
