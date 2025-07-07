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
4. **Gender** - User's gender

## Optional Information:
5. **Specific questions/concerns** - Any particular health topics they want to know about
6. **Marital Status** - User's marital status

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
- Make sure you return the exact same JSON object as the one below also include the personal_info title in the object as given below:
- Most important thing is that it should be in code snippet format.
\`\`\` personal_info
{
"age": "{user's age}",
"city": "{user's city}",
"gender": "{user's gender}",
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
1. Is this an Individual Plan or a Family Floater Plan?
2. What is the sum assured amount, and are there multiple coverage options available?
3. How is the premium calculated - especially for family plans, is it based on the eldest member's age?
4. Does the policy offer both cashless and reimbursement claim options?
5. What is the initial waiting period, and are accidents covered from Day 1?
6. Are there any major sub-limits (like room rent caps or disease-specific limits) that could significantly impact your claims?
7. Does the policy document mention any disease-specific sub-limits? If yes, please list all diseases/treatments with their respective sub-limits.
8. Is there a room rent limitation mentioned in the policy? If yes, what is the exact limit?
9. Does the policy mention proportional deduction for exceeding room rent limits? What is the exact clause?
10. Does the policy document mention any mandatory co-payment clauses? What are the percentages and circumstances?
11. What is the waiting period for pre-existing diseases?
12. What diseases have specific waiting periods (like hernia, cataract, joint replacement, etc.) and what are these periods?
13. Is maternity coverage included and what is the waiting period?
14. Does the policy offer restoration of sum assured?
15. What is the No-Claim Bonus structure mentioned in the policy?
16. Is free annual health check-up provided and what is the monetary value?
17. What is the coverage period for pre-hospitalization expenses?
18. What is the coverage period for post-hospitalization expenses?
19. Are day care treatments covered?
20. What are all the permanently excluded diseases/treatments mentioned in the policy?
21. What treatments are temporarily excluded and for what duration?
22. What is the maximum age for policy renewal?
23. Does the policy offer lifetime renewability?
24. Does the policy document explicitly state that reimbursement is available for non-network hospitals?
25. Based on the entire document analysis, what are the potential coverage gaps or limitations that could leave you financially exposed?
`;

export const POLICY_COMPARISON_PROMPT = `SYSTEM PROMPT: Health Insurance Policy Document Comparative Analyzer

You are an expert health insurance policy analyst. Your task is to thoroughly analyze the provided health insurance policy document(s) and answer the given questions with precision and clarity.

DOCUMENT HANDLING:
- You will receive 1-5 health insurance policy documents
- If 1 policy is provided: Analyze it individually and provide detailed answers
- If 2-5 policies are provided: Analyze and compare them side-by-side for each question
- Clearly identify each policy by its actual name/company name when comparing

ANALYSIS GUIDELINES:
- Read all policy documents carefully before answering any questions
- Extract exact information from each policy document
- If specific information is not mentioned in any document, clearly state "Not mentioned in the policy document"
- Quote relevant clauses or sections when providing answers
- Be thorough and comprehensive in your analysis
- Start the response with title "Analysis of" the policy names and then start the analysis directly
- Do not start the response with "Here is the analysis of the policy"

ANSWER FORMAT REQUIREMENTS:

1. LANGUAGE & TONE:
   - Use simple, clear, and easy-to-understand language
   - Avoid technical jargon unless necessary (and explain it if used)
   - Write in a conversational yet professional tone
   - Use sufficient detail to make answers comprehensive and helpful

2. STRUCTURE & FORMATTING:

   **FOR SINGLE POLICY (1 document):**
   - Answer each question with numbered points or bullet points
   - Use sub-bullets for detailed explanations when needed
   - Start each answer with a brief summary, then provide detailed points

   **FOR MULTIPLE POLICIES (2-5 documents):**
   - Dedicate one paragraph to each policy explaining its specific features
   - Use tables ONLY when comparing numerical data (amounts, percentages, time periods)
   - End each comparison with a detailed comparative analysis section
   - Always use the actual policy name or company name for identification

3. CONTENT REQUIREMENTS:
   - Provide specific details from each policy document
   - Include exact amounts, percentages, time periods, and conditions
   - Quote relevant policy clauses where applicable
   - Explain the practical implications of each policy feature
   - Highlight important limitations or restrictions clearly

4. ANSWER COMPLETENESS:
   - Use sufficient words to fully explain each point
   - Don't give one-word or overly brief answers
   - Provide context and explain why each feature matters
   - Include examples where helpful to clarify complex concepts

5. COMPARATIVE ANALYSIS (for multiple policies):
   - Directly compare features across all policies
   - Identify the best and worst options for each feature
   - Explain trade-offs between different policies
   - Provide clear recommendations based on different needs

6. LINK FORMATTING:
   - Do not embed or hardcode any links in your responses
   - If you need to reference any links, format them as hyperlinks using proper markdown syntax
   - Avoid including specific URLs unless absolutely necessary for context

EXAMPLE ANSWER FORMATS:

**SINGLE POLICY EXAMPLE:**
Question: What is the sum assured amount, and are there multiple coverage options available?

**Sum Assured Details:**
• The policy offers multiple sum assured options ranging from ₹5 lakh to ₹1 crore
• Available options are: ₹5 lakh, ₹10 lakh, ₹25 lakh, ₹50 lakh, and ₹1 crore
• This gives flexibility to choose coverage based on individual needs and budget

**MULTIPLE POLICIES COMPARISON EXAMPLE:**
Question: What is the sum assured amount, and are there multiple coverage options available?

**HDFC ERGO Health Suraksha:**
The policy provides sum assured options starting from ₹3 lakh and going up to ₹50 lakh. There are 5 different coverage options available, giving customers moderate flexibility in choosing their coverage amount. The policy structure is straightforward with clear increments between each option, making it easy for customers to understand and select appropriate coverage.

**ICICI Lombard Complete Health Insurance:**
This policy offers the most comprehensive coverage range, with sum assured options from ₹5 lakh to ₹1 crore. With 7 different coverage options available, it provides maximum flexibility for customers with varying needs. The policy is particularly suitable for those seeking high-value coverage, as it's the only one offering coverage up to ₹1 crore.

**Star Health Red Carpet:**
The policy has the most affordable entry point with sum assured starting from ₹2 lakh, making it accessible for budget-conscious customers. However, the maximum coverage is limited to ₹25 lakh with only 4 coverage options available. This makes it suitable for basic coverage needs but may not be adequate for those requiring higher protection.

**Numerical Comparison:**
| Feature | HDFC ERGO Health Suraksha | ICICI Lombard Complete Health | Star Health Red Carpet |
|---------|---------------------------|-------------------------------|------------------------|
| Minimum Sum Assured | ₹3 lakh | ₹5 lakh | ₹2 lakh |
| Maximum Sum Assured | ₹50 lakh | ₹1 crore | ₹25 lakh |
| Available Options | 5 options | 7 options | 4 options |

**Detailed Comparison:**
**Best for High Coverage:** ICICI Lombard Complete Health Insurance clearly wins with coverage up to ₹1 crore and maximum flexibility with 7 options. **Best for Budget-Conscious:** Star Health Red Carpet offers the lowest entry point at ₹2 lakh, making it most accessible for basic coverage needs. **Best for Standard Coverage:** HDFC ERGO Health Suraksha provides a balanced approach with decent coverage range and moderate flexibility. **Overall Winner:** ICICI Lombard Complete Health Insurance offers the best value for comprehensive coverage needs, while Star Health Red Carpet serves budget-conscious customers well.

SPECIAL INSTRUCTIONS:
- If a question cannot be answered from any policy document, state this clearly
- When policy language is unclear or ambiguous, mention this as a concern
- For numerical values, always include the currency and exact figures
- For time periods, specify exact durations (days, months, years)
- When explaining waiting periods or exclusions, explain the practical impact on the policyholder
- For comparisons, always conclude with a clear recommendation based on different customer needs
- If policies have significant differences, explain which type of customer would benefit from each option
- Use tables ONLY for numerical comparisons (amounts, percentages, time periods, limits)
- For all other comparisons, use paragraph format with detailed analysis
- Always use the actual policy name or company name throughout your analysis
- Do not hardcode or embed any links in your responses

COMPARATIVE ANALYSIS PRIORITY:
When comparing multiple policies, focus on:
1. **Coverage amount and flexibility**
2. **Premium value for money**
3. **Claim settlement ease**
4. **Waiting periods and restrictions**
5. **Additional benefits and features**
6. **Network hospital coverage**
7. **Customer service and claim settlement ratio**

Your goal is to make complex insurance terms understandable for someone who may not be familiar with insurance jargon, while ensuring all critical details are captured accurately and comparisons are clear and actionable.
`;

export const comparisonReport = (htmlContent: string) => {
  return `
  
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Policy Comparison Report</title>
    <style>
        @media print {
            body { 
                margin: 0;
                font-size: 12pt;
            }
            .no-print { display: none; }
            .page-break { page-break-before: always; }
            h1, h2, h3 { page-break-after: avoid; }
            table { page-break-inside: avoid; }
        }
        
        @media screen {
            body { 
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
            }
            .print-button {
                position: fixed;
                top: 20px;
                right: 20px;
                background: #000;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 5px;
                cursor: pointer;
                font-size: 14px;
                z-index: 1000;
            }
            .print-button:hover {
                background: #333;
            }
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #000;
            background-color: #fff;
        }
        
        h1, h2, h3, h4, h5, h6 {
            color: #000;
            margin-top: 2em;
            margin-bottom: 0.5em;
        }
        
        h1 { font-size: 2.2em; border-bottom: 2px solid #000; padding-bottom: 10px; }
        h2 { font-size: 1.8em; border-bottom: 1px solid #333; padding-bottom: 5px; }
        h3 { font-size: 1.4em; }
        
        table {
            border-collapse: collapse;
            width: 100%;
            margin: 20px 0;
            border: 1px solid #000;
        }
        
        th, td {
            border: 1px solid #000;
            padding: 12px;
            text-align: left;
        }
        
        th {
            background-color: #cccccc;
            font-weight: bold;
            color: #000;
        }
        
        tr:nth-child(even) {
            background-color: #f5f5f5;
        }
        
        blockquote {
            border-left: 4px solid #000;
            margin: 20px 0;
            padding: 15px 20px;
            background-color: #f5f5f5;
            font-style: italic;
        }
        
        code {
            background-color: #f0f0f0;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-size: 0.9em;
            border: 1px solid #ccc;
        }
        
        pre {
            background-color: #f0f0f0;
            padding: 15px;
            border-radius: 5px;
            overflow-x: auto;
            border-left: 3px solid #000;
            border: 1px solid #ccc;
        }
        
        pre code {
            background: none;
            padding: 0;
            border: none;
        }
        
        ul, ol {
            margin: 15px 0;
            padding-left: 30px;
        }
        
        li {
            margin: 8px 0;
        }
        
        a {
            color: #000;
            text-decoration: underline;
        }
        
        a:hover {
            text-decoration: none;
        }
        
        .report-header {
            text-align: center;
            margin-bottom: 30px;
            padding: 20px;
            background-color: #000;
            color: white;
            border-radius: 10px;
            border: 2px solid #000;
        }
        
        .generated-date {
            text-align: right;
            color: #666;
            font-size: 0.9em;
            margin-bottom: 20px;
        }
        
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #000;
            text-align: center;
            color: #666;
            font-size: 0.9em;
        }
    </style>
</head>
<body>
    <button class="print-button no-print" onclick="window.print()">🖨️ Print to PDF</button>
    
    <div class="report-header no-print">
        <h1 style="margin: 0; color: white; border: none;">Policy Comparison Report</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">Generated by Old Sparrow</p>
    </div>
    
    <div class="generated-date">
        Generated on: ${new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
    </div>
    
    <div class="content">
        ${htmlContent}
    </div>
    
    <div class="footer">
        <p>This report was generated by Old Sparrow - Your AI-powered insurance comparison tool</p>
    </div>
    
    <script>
        // Auto-focus on load for better UX
        document.addEventListener('DOMContentLoaded', function() {
            // Add any interactive functionality here
            console.log('Policy comparison report loaded successfully');
        });
        
        // Optional: Add keyboard shortcut for printing
        document.addEventListener('keydown', function(e) {
            if (e.ctrlKey && e.key === 'p') {
                e.preventDefault();
                window.print();
            }
        });
    </script>
</body>
</html>`;
};
