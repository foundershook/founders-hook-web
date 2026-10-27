import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySession, SESSION_COOKIE } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface ProfileData {
  role: "Founder" | "Applicant";
  industry: string;
  experience: string;
  bio: string;
  skills: string[];
  onboardingAnswers: Record<string, any>;
}

function extractProfileJson(text: string): { cleanText: string; profileData: ProfileData | null } {
  // 0. Clean any think/thought/reasoning tags (both closed and open/truncated)
  let cleanText = text
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .replace(/<thought>[\s\S]*?<\/thought>/gi, "")
    .replace(/<reasoning>[\s\S]*?<\/reasoning>/gi, "")
    .replace(/<think>[\s\S]*$/gi, "")
    .replace(/<thought>[\s\S]*$/gi, "")
    .replace(/<reasoning>[\s\S]*$/gi, "")
    .trim();

  // 1. First look for explicit <PROFILE_COMPLETE>...</PROFILE_COMPLETE> tag (case-insensitive)
  const tagRegex = /<PROFILE_COMPLETE>([\s\S]*?)<\/PROFILE_COMPLETE>/i;
  const match = cleanText.match(tagRegex);

  let profileData: ProfileData | null = null;

  if (match) {
    const rawJson = match[1].trim();
    cleanText = cleanText.replace(tagRegex, "").trim();
    try {
      const normalized = rawJson.replace(/```(?:json)?\s*/gi, "").replace(/```/g, "").trim();
      profileData = JSON.parse(normalized);
    } catch (err) {
      console.warn("[ai-onboarding] Failed to parse matched JSON inside tag:", err);
    }
  }

  // Always strip orphaned opening/closing PROFILE_COMPLETE tags that weren't matched
  cleanText = cleanText
    .replace(/<\/?PROFILE_COMPLETE>/gi, "")
    .trim();

  // 2. Try to extract JSON from ANY markdown code block and use as profileData if it has role+bio
  if (!profileData) {
    const jsonBlockRegex = /```(?:json)?\s*(\{[\s\S]*?"role"[\s\S]*?"bio"[\s\S]*?\})\s*```/i;
    const blockMatch = cleanText.match(jsonBlockRegex);
    if (blockMatch) {
      try {
        profileData = JSON.parse(blockMatch[1].trim());
        cleanText = cleanText.replace(jsonBlockRegex, "").trim();
      } catch {
        // continue to fallback
      }
    }
  }

  // 2b. Strip ALL remaining markdown code blocks (json or otherwise) so they never reach the user
  cleanText = cleanText
    .replace(/```[\s\S]*?```/gi, "")
    .trim();

  // 2c. Strip any bare multi-line JSON objects (starts with { or [ and contains "role"/"bio"/"skills")
  cleanText = cleanText
    .replace(/\{[\s\S]*?"(?:role|bio|skills|industry|experience|onboardingAnswers)"[\s\S]*?\}/g, "")
    .replace(/\[[\s\S]*?"[^"]+"[\s\S]*?\]/g, (m) => {
      // Only strip arrays that look like skill lists (short strings, no sentences)
      const items = m.slice(1, -1).split(",").map((s) => s.trim().replace(/^"|"$/g, ""));
      return items.every((i) => i.length < 40 && !i.includes(".")) ? "" : m;
    })
    .trim();

  // 3. Fallback: Parse formatted summary text (e.g. **Role:**, **Crafted Bio:**, **Key Skills:**)
  if (!profileData) {
    const roleMatch = cleanText.match(/\*\*Role:\*\*\s*([^\n\r]+)/i);
    const bioMatch = cleanText.match(/\*\*Crafted Bio:\*\*\s*[\r\n]+["\u201c']?([\s\S]*?)["\u201d']?[\r\n]+(?=\*\*|---|$)/i);
    const skillsMatch = cleanText.match(/\*\*Key Skills:\*\*\s*([^\n\r]+)/i) || cleanText.match(/\*\*Skills:\*\*\s*([^\n\r]+)/i);
    const industryMatch = cleanText.match(/\*\*Industry:\*\*\s*([^\n\r]+)/i);
    const experienceMatch = cleanText.match(/\*\*Experience:\*\*\s*([^\n\r]+)/i);

    if (roleMatch && bioMatch) {
      const rawRole = roleMatch[1].trim();
      const role: "Founder" | "Applicant" = rawRole.toLowerCase().includes("founder") ? "Founder" : "Applicant";
      const bio = bioMatch[1].replace(/^\s*["*]+|["*]+\s*$/g, "").trim();
      const skills = skillsMatch
        ? skillsMatch[1]
            .split(/[,•|]+/)
            .map((s) => s.trim())
            .filter(Boolean)
        : [];
      const industry = industryMatch ? industryMatch[1].trim() : "";
      const experience = experienceMatch ? experienceMatch[1].trim() : "";

      profileData = {
        role,
        industry,
        experience,
        bio,
        skills,
        onboardingAnswers: {
          role,
          industry,
          experience,
          bio,
          skills,
        },
      };
    }
  }

  // 4. Strip internal monologue paragraphs (model self-talk, chain-of-thought)
  const paragraphs = cleanText.split(/\n\s*\n/);
  const filteredParagraphs = paragraphs.filter((p) => {
    const trimmed = p.trim();
    // Skip paragraphs that are purely JSON-like (start/end with { } or [ ])
    if (/^\s*[\{\[][\s\S]*[\}\]]\s*$/.test(trimmed)) return false;
    // Skip common internal-monologue openers that small models produce
    return !/^(?:let me think|i have enough info|the finishing protocol|i could ask|maybe i should|i should wrap|thinking process|internal thoughts|scratchpad|i need a bio|i'm at like exchange|okay, i have|alright, i have|now i need to|i'll now|i will now|step \d)/i.test(trimmed);
  });

  if (filteredParagraphs.length > 0) {
    cleanText = filteredParagraphs.join("\n\n").trim();
  }

  // 5. Final safety net: if the remaining text is pure JSON/empty, replace with friendly message
  const trimmedFinal = cleanText.trim();
  const looksLikePureJson = /^[\[\{]/.test(trimmedFinal) && /[\]\}]$/.test(trimmedFinal);
  if (looksLikePureJson || !cleanText.trim()) {
    cleanText = profileData
      ? "Thanks for sharing your background! I've prepared your custom profile based on our chat. Take a look at the live preview and click Proceed when you're ready to continue!"
      : "Sorry, I had trouble generating a response. Please try again!";
  }

  return { cleanText, profileData };
}

function enforceSingleQuestion(text: string, turnCount: number): string {
  // If the text contains PROFILE_COMPLETE or profile summaries, do nothing
  if (text.includes("<PROFILE_COMPLETE>") || text.includes("**Crafted Bio:**") || text.includes("**Role:**")) {
    return text;
  }

  // Count question marks
  const qCount = (text.match(/\?/g) || []).length;
  if (qCount <= 1) return text;

  // Split into paragraphs (acknowledgment vs question block)
  const paragraphs = text.split(/\n+/).map((p) => p.trim()).filter(Boolean);
  if (paragraphs.length === 0) return text;

  const acknowledgment = paragraphs.length > 1 ? paragraphs[0] : "";
  const questionBlock = paragraphs.length > 1 ? paragraphs.slice(1).join(" ") : paragraphs[0];

  // Split questionBlock into individual sentences
  const sentences = questionBlock
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  let chosenQuestion = "";

  // Turn 2: User just answered Industry -> We ask ONLY for YEARS OF EXPERIENCE
  if (turnCount === 2) {
    const expQ = sentences.find((s) =>
      /year|how long|experience|in the game/i.test(s) && s.includes("?")
    );
    if (expQ) {
      chosenQuestion = expQ.replace(/^(?:and|also|so),?\s*/i, "");
    }
  }

  // Turn 3: User just answered Experience -> We ask ONLY for SKILLS
  if (!chosenQuestion && turnCount === 3) {
    const skillQ = sentences.find((s) =>
      /skill|stack|toolkit|technolog|tools/i.test(s) && s.includes("?")
    );
    if (skillQ) {
      chosenQuestion = skillQ.replace(/^(?:and|also|so),?\s*/i, "");
    }
  }

  // Turn 1: User just answered Role -> We ask ONLY for INDUSTRY
  if (!chosenQuestion && turnCount === 1) {
    const indQ = sentences.find((s) =>
      /industry|domain|sector|building|space/i.test(s) && s.includes("?")
    );
    if (indQ) {
      chosenQuestion = indQ.replace(/^(?:and|also|so),?\s*/i, "");
    }
  }

  // Fallback: choose the primary question sentence
  if (!chosenQuestion) {
    chosenQuestion = sentences.find((s) => s.includes("?")) || sentences[sentences.length - 1];
    chosenQuestion = chosenQuestion.replace(/^(?:and|also|so),?\s*/i, "");
  }

  if (chosenQuestion) {
    chosenQuestion = chosenQuestion.charAt(0).toUpperCase() + chosenQuestion.slice(1);
  }

  if (acknowledgment && chosenQuestion) {
    return `${acknowledgment}\n\n${chosenQuestion}`;
  }
  return chosenQuestion || text;
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    const session = token ? verifySession(token) : null;

    if (!session) {
      return NextResponse.json({ error: "Please log in first" }, { status: 401 });
    }

    const body = await req.json();
    const {
      messages = [],
      mode = "onboarding",
      currentProfile = {},
    } = body as {
      messages: ChatMessage[];
      mode?: "onboarding" | "edit";
      currentProfile?: {
        bio?: string;
        skills?: string[];
        role?: "Founder" | "Applicant";
        industry?: string;
        experience?: string;
      };
    };

    await connectToDatabase();
    const dbUser: any = await User.findById(session.userId)
      .select("name username avatarUrl bio skills isFounder")
      .lean();
    const firstName = dbUser?.name ? dbUser.name.split(" ")[0] : "there";
    const existingBio = currentProfile.bio ?? dbUser?.bio ?? "";
    const existingSkills = currentProfile.skills ?? dbUser?.skills ?? [];
    const existingRole = currentProfile.role ?? (dbUser?.isFounder ? "Founder" : "Applicant");

    const apiKey =
      process.env.OPENROUTER_PROFILE_API_KEY?.trim() ||
      process.env.OPENROUTER_API_KEY?.trim();

    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenRouter API key is not configured in .env (please set OPENROUTER_PROFILE_API_KEY or OPENROUTER_API_KEY)" },
        { status: 500 }
      );
    }

    const userMessages = messages.filter((m) => m.role === "user");
    const userTurnCount = userMessages.length;

    const stepDirective =
      userTurnCount === 1
        ? `CURRENT MANDATORY STEP: STEP 2 (INDUSTRY & DOMAIN)
- Acknowledge their role in exactly 1 short sentence.
- Ask ONLY: "What industry or domain are you building in or exploring (e.g. AI/ML, SaaS, FinTech, Web3)?"
- STRICT: Do NOT ask about experience, skills, or anything else. Exactly ONE question.`
        : userTurnCount === 2
        ? `CURRENT MANDATORY STEP: STEP 3 (YEARS OF EXPERIENCE ONLY)
- Acknowledge their industry in exactly 1 short sentence.
- Ask ONLY: "How many years of experience do you have in the tech or startup world (e.g., <1 year, 1-3, 4-7, or 8+ years)?"
- STRICT PROHIBITION: The user already selected their role in Step 1. NEVER ask about their role, job title, or specialization (e.g. do NOT ask if they are an engineer, researcher, designer, or what hats they wear). Ask ONLY for their years of experience! Exactly ONE question mark ('?').`
        : userTurnCount === 3
        ? `CURRENT MANDATORY STEP: STEP 4 (CORE SKILLS & TECH STACK ONLY)
- Acknowledge their experience in exactly 1 short sentence.
- Ask ONLY: "What are 4 to 8 core skills or technologies in your toolkit (e.g., Python, React, UI/UX, product management, etc.)?"
- STRICT: Do NOT ask about anything else. Exactly ONE question mark ('?').`
        : `CURRENT MANDATORY STEP: STEP 5 (DELIVER COMPLETE PROFILE)
- You have all details: Role, Industry, Experience, and Skills.
- Congratulate ${firstName}, summarize their profile with their crafted 2-3 sentence inspiring bio and key skills.
- Ask ZERO questions (0 question marks '?').
- Append the valid JSON inside <PROFILE_COMPLETE>...</PROFILE_COMPLETE>.`;

    const systemPrompt =
      mode === "edit"
        ? `You are the AI Profile Copilot for "Founders Hook" — an exclusive platform that connects startup founders, builders, developers, and designers.
You are collaborating 1-on-1 with ${firstName} to refine, polish, and elevate their profile bio and skills.

${firstName}'S CURRENT PROFILE DATA:
- Role: ${existingRole}
- Current Bio: ${existingBio ? '"' + existingBio + '"' : "None"}
- Current Skills: ${existingSkills.length > 0 ? existingSkills.join(", ") : "None"}

CARDINAL RULE: EXACTLY ONE QUESTION OR PROMPT PER MESSAGE
- NEVER ask multiple questions in a single response.
- At most ONE question mark ('?').
- Keep every response under 45 words.
- Speak directly to ${firstName} in every token. NEVER output internal thoughts, chain-of-thought, or scratchpads.
- ABSOLUTE PROHIBITION: NEVER output raw JSON, code blocks (\`\`\`), or any structured data in your conversational reply. JSON is ONLY allowed inside <PROFILE_COMPLETE> tags in your FINAL message.

YOUR MISSION:
Help ${firstName} enhance their bio and update their skills to make them stand out to co-founders, investors, or startup teams.
1. Acknowledge what they'd like to improve.
2. Suggest an improved, compelling 2-3 sentence bio in first person ("I am...") and relevant skills.
3. Present the updated bio and skills clearly.

FINISHING & DELIVERING THE UPDATED PROFILE:
When you have drafted the improved bio and updated skills, present them clearly, congratulate ${firstName}, and tell them to tap "Save & Update Profile".
Ask 0 questions in your final message, and append the updated profile JSON inside <PROFILE_COMPLETE> tags:

<PROFILE_COMPLETE>
{
  "role": "${existingRole}",
  "industry": "${currentProfile.industry || "Tech"}",
  "experience": "${currentProfile.experience || ""}",
  "bio": "string (the updated 2-3 sentence bio in first person)",
  "skills": ["Skill1", "Skill2", "Skill3"],
  "onboardingAnswers": {
    "role": "${existingRole}",
    "bio": "string",
    "skills": ["Skill1", "Skill2"]
  }
}
</PROFILE_COMPLETE>`
        : `You are the AI Onboarding Copilot for "Founders Hook" — an exclusive platform that connects startup founders, builders, developers, and designers.
You are having a friendly, smart, 1-on-1 onboarding conversation with ${firstName}.

CARDINAL RULE: STRICTLY EXACTLY ONE QUESTION PER MESSAGE
- NEVER ask multiple questions in a single message.
- Total question marks allowed in your entire response: AT MOST ONE ('?').
- Absolutely NO compound questions (e.g., NEVER combine role/background with years of experience).
- Structure every response in 2 short sentences:
  1. A brief acknowledgment or reaction to what ${firstName} just said.
  2. Exactly ONE specific question for the current step.

STRICT OUTPUT & SPEECH DIRECTIVE:
- Speak directly to ${firstName} in EVERY token you generate.
- NEVER output internal thoughts, chain-of-thought, planning, scratchpads, or self-monologue.
- Keep responses short, punchy, and conversational (under 40 words).
- ABSOLUTE PROHIBITION: NEVER output raw JSON, code blocks (\`\`\`), arrays, or any structured data in conversational messages. JSON is ONLY allowed inside <PROFILE_COMPLETE> tags at the very end of your FINAL message.

${stepDirective}

CRITICAL RULES:
1. The user's role is already chosen (Founder / Applicant / Both). NEVER ask about their role or background again!
2. When asking about experience, ask ONLY for years of experience.
3. Ask ONE question at a time. Never combine two topics into one message.
4. If you are not on the final step, do NOT output any JSON or <PROFILE_COMPLETE> tag.

FINISHING & DELIVERING THE PROFILE:
When all steps are complete:
1. Congratulate ${firstName} and present a polished summary (Role, Crafted Bio, Key Skills).
2. Ask NO questions (0 question marks).
3. At the very end, output the data inside <PROFILE_COMPLETE> tags with valid JSON:

<PROFILE_COMPLETE>
{
  "role": "Founder" or "Applicant",
  "industry": "string",
  "experience": "string",
  "bio": "string (the crafted 2-3 sentence bio in first person)",
  "skills": ["Skill1", "Skill2", "Skill3"],
  "onboardingAnswers": {
    "role": "Founder or Applicant",
    "industry": "string",
    "experience": "string",
    "bio": "string",
    "skills": ["Skill1", "Skill2"]
  }
}
</PROFILE_COMPLETE>`;

    const openRouterMessages = [
      { role: "system", content: systemPrompt },
      ...messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    ];

    // Model selection: prefer a configured model, otherwise fall back to better
    // instruction-following models. Small 7B free models tend to hallucinate and
    // leak raw JSON — use at least a 70B model when possible.
    const configuredModel = process.env.OPENROUTER_PROFILE_MODEL;
    const models = configuredModel
      ? [configuredModel]
      : [
          // Confirmed free on OpenRouter (Sept 2026) — largest/best first:
          "nvidia/nemotron-3-super-120b-a12b:free",   // 120B — best free chat model
          "nvidia/nemotron-3.5-lightning:free",        // fast fallback, 1M context
          "inclusionai/ling-3.0-flash-fin:free",       // last resort
        ];

    // For conversational turns (not the final profile step), cap tokens tightly
    // to prevent verbose hallucinations. Only allow more tokens for the profile step.
    const isProfileStep = userTurnCount >= 4;
    const maxTokens = isProfileStep ? 800 : 200;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://foundershook.in",
        "X-Title": "Founders Hook AI Profile Builder",
      },
      body: JSON.stringify({
        models,
        messages: openRouterMessages,
        // Lower temperature reduces hallucination and improves instruction adherence
        temperature: 0.4,
        max_tokens: maxTokens,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[ai-onboarding] OpenRouter API error:", response.status, errorText);
      return NextResponse.json({ error: "Failed to generate AI response. Please try again." }, { status: 502 });
    }

    const data = await response.json();
    const rawContent: string = data?.choices?.[0]?.message?.content || "";

    if (!rawContent) {
      return NextResponse.json({ error: "Empty response from AI" }, { status: 500 });
    }

    const { cleanText, profileData } = extractProfileJson(rawContent);
    const sanitizedText = profileData ? cleanText : enforceSingleQuestion(cleanText, userTurnCount);

    return NextResponse.json({
      reply: sanitizedText,
      isComplete: Boolean(profileData),
      profileData,
    });
  } catch (error) {
    console.error("[ai-onboarding] Route error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
