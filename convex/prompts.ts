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

\`\`\`personal_info
{
"age": "{user's age}",
"city": "{user's city}",
"prd": "{user's pre-existing diseases}",
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
    {
        "name": "Policy 1",
        "description": "Description 1",
        "logo": "https://example.com/logo.png"
    },
    {
        "name": "Policy 2",
        "description": "Description 2",
        "logo": "https://example.com/logo.png"
    },
    {
        "name": "Policy 3",
        "description": "Description 3",
        "logo": "https://example.com/logo.png"
    },
    {
        "name": "Policy 4",
        "description": "Description 4",
        "logo": "https://example.com/logo.png"
    }
]
\`\`\` `;

export const POLICY_QUESTIONS_PROMPT = `
I. Basic Policy Information Analysis
1. Policy Type & Coverage Structure:
	- Is this an Individual Plan or a Family Floater Plan?
	- If it's a family floater, how is the sum assured shared among family members - is it a combined limit for all members or individual limits per person?
            Types of Plans	                        Ideal Health Insurance Sum Insured
                                        Tier-1 City	            Tier-2 City	            Tier-3 City
    Individual Health Insurance Plan	    ₹10 lakh & above	  ₹5-10 lakh	          ₹5 lakh
    Family Floater Health Insurance Plan	₹30 lakh & above	₹20 lakh & above	₹10 lakh & above
    Senior Citizen Health Insurance Plan	₹20 lakh & above	₹15 lakh & above	₹10 lakh & above
2. Sum Assured & Premium Calculation:
	- What is the sum assured amount, and are there multiple coverage options available?
	- How is the premium calculated - especially for family plans, is it based on the eldest member's age?
3. Geographic Coverage Scope:
	- Is this a Pan-India policy or a Zonal policy?
	- If zonal, what co-payment applies when treated outside your registered zone?
4. Claim Settlement Options:
	- Does the policy offer both cashless and reimbursement claim options?
	- Can you get reimbursed for treatment at non-network hospitals, or are you restricted to cashless-only facilities?
5. Major Restrictions & Waiting Periods:
	- What is the initial waiting period, and are accidents covered from Day 1?
	- Are there any major sub-limits (like room rent caps or disease-specific limits) that could significantly impact your claims?

II. Sub-limits & Restrictions Analysis
Disease-Specific Sub-limits
1. Sub-limit Identification: Does the policy document mention any disease-specific sub-limits? If yes, please list all diseases/treatments with their respective sub-limits and the policy sections where they are mentioned.

2. Common Treatment Limits: What are the specific coverage limits mentioned for:
	- Cataract surgery
	- Cardiac procedures (angioplasty, bypass)
	- Orthopedic surgeries
	- Cancer treatments
	- Dialysis procedures
	- Any other commonly mentioned treatments

Room Rent Analysis
1. Room Rent Cap: Is there a room rent limitation mentioned in the policy? If yes, what is the exact limit (percentage of sum assured or fixed amount)?
2. Proportional Deduction Clause: Does the policy mention proportional deduction for exceeding room rent limits? Please quote the exact clause and explain how it works.
3. ICU/ICCU Limits: Are there separate room rent limits mentioned for ICU/ICCU? What are these limits?

Co-payment Clauses
1. Co-payment Requirements: Does the policy document mention any mandatory co-payment clauses? If yes, what are the percentages and under what circumstances do they apply?
2. Age-based Co-payment: Are there different co-payment percentages based on age groups? Please provide the age brackets and corresponding percentages.
3. Zonal Co-payment: Are there any zonal Co-payment? If yes, what are the percentages and under what circumstances do they apply?

III. Waiting Periods Comprehensive Analysis
Initial & Accident Coverage
1. Initial Waiting Period: What is the initial waiting period mentioned in the policy? Are accidents covered from Day 1?
2. Emergency Definition: How does the policy define "emergency" and what treatments are covered immediately?

Pre-existing Disease Analysis
1. PED Definition: How does the policy document define "pre-existing diseases"? Please quote the exact definition.
2. PED Waiting Period: What is the waiting period for pre-existing diseases? Are there different waiting periods for different types of PED?
3. PED Declaration Requirements: What are the requirements for declaring pre-existing diseases? How far back does the medical history requirement go?

Specific Disease Waiting Periods
1. Specific Illness Waiting Periods: Please list all diseases mentioned in the policy that have specific waiting periods (like hernia, cataract, joint replacement, etc.) along with their waiting periods.

2. Critical Illness Coverage:
	- What is the waiting period for critical illnesses?
	- Please provide the complete list of critical illnesses covered as mentioned in the policy
	- Are there any sub-limits for critical illness coverage?

Maternity & AYUSH Coverage
1. Maternity Benefits:
	- Is maternity coverage included?
	- What is the waiting period?
	- What is the coverage amount/limit?
	- Is newborn coverage automatic?
2. AYUSH Treatment:
	- Does the policy cover AYUSH treatments?
	- What is the waiting period?
	- Are there any sub-limits for AYUSH treatments?

IV. Policy Benefits & Features Analysis
Restoration Benefits
1. Sum Assured Restoration:
	- Does the policy offer restoration of sum assured?
	- Can restored amount be used for the same illness or only unrelated illnesses?
	- How many times can restoration happen in a policy year?
	- What percentage of sum assured is restored?

No-Claim Bonus Analysis
1. NCB Structure:
	- What is the No-Claim Bonus structure mentioned in the policy?
	- What is the percentage increase per claim-free year?
	- What is the maximum NCB accumulation possible?
	- If a claim is made, is NCB completely reset or only reduced by one level?

Additional Benefits
1. Health Check-up:
	- Is free annual health check-up provided?
	- What is the monetary value?
	- What tests/procedures are included?

2. Value-added Services: Does the policy mention:
	- Online doctor consultation
	- Pharmacy benefits
	- Ambulance coverage and limits
	- Home healthcare services

V. Coverage Scope & Claims Analysis
Hospitalization Coverage
1. Pre & Post Hospitalization:
1. 	- What is the coverage period for pre-hospitalization expenses?
	- What is the coverage period for post-hospitalization expenses?
	- What expenses are covered under each category?
2. Day Care Procedures:
	- Are day care treatments covered?
	- Please list all day care procedures mentioned in the policy

Claim Settlement Options
1. Claim Types: Does the policy clearly state that both cashless and reimbursement options are available?
2. Network Hospital Coverage:
	- What does the policy say about treatment at network hospitals?
	- What does it say about treatment at non-network hospitals?
3. Reimbursement Guarantee: Does the policy guarantee reimbursement for treatment at non-network hospitals? Please quote the relevant clause.

VI. Exclusions & Limitations Analysis

Policy Exclusions
1. Permanent Exclusions: Please list all permanently excluded diseases/treatments mentioned in the policy.
2. Temporary Exclusions: What treatments are temporarily excluded and for what duration?
3. Lifestyle Exclusions: Are treatments related to alcohol, smoking, drugs, or self-inflicted injuries excluded?
4. Age-related Limitations: Are there any age-related exclusions or coverage limitations mentioned?

Treatment Coverage
1. Specialized Treatments: What does the policy say about coverage for:
	- Mental health treatments
	- Dental treatments
	- Cosmetic/plastic surgery
	- Experimental treatments
	- Organ transplants

VII. Top-up/Super Top-up Analysis (If Applicable)
1. Plan Type: Is this document for a Top-up or Super Top-up plan?
2. Deductible Structure:
	- What is the deductible amount?
	- How is the deductible applied (per claim or aggregate annual)?
	- What conditions must be met for the top-up to activate?
3. Base Policy Requirements: Does the policy require maintaining a separate base health insurance policy?


VIII. Renewal & Continuity Analysis
1. Renewal Terms:
	- What is the maximum age for policy renewal?
	- Does the policy offer lifetime renewability?
	- Under what conditions can the insurer refuse renewal?
2. Premium Revision: Under what circumstances can the premium be revised during renewal?
3. Policy Portability: What does the policy document say about portability to other insurers?

IX. Critical Deal-Breaker Analysis
Most Important Verification
1. Cashless vs. Reimbursement:
	- Does the policy document explicitly state that reimbursement is available for non-network hospitals?
	- Are there any restrictions that would force me to use only cashless facilities?
	- In emergency situations, does the policy guarantee coverage regardless of hospital network status?
2. Coverage Gaps: Based on your analysis of the entire document, what are the potential coverage gaps or limitations that could leave me financially exposed?
3. Red Flags: What clauses or conditions in this policy document should I be most concerned about? 

Final Summary Request
1. Overall Assessment: Based on your analysis of the policy document, please provide:
	- A summary of the policy's strengths
	- A summary of the policy's weaknesses/limitations
	- Any critical information that seems to be missing from the document
	- Your recommendation on whether this policy has any major red flags that would make it unsuitable
`;
