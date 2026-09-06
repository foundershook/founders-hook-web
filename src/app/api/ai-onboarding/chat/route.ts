import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySession, SESSION_COOKIE } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Question from "@/models/Question";
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
  // 0. Clean any think/thought tags (both closed and open/truncated)
  let cleanText = text
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .replace(/<thought>[\s\S]*?<\/thought>/gi, "")
    .replace(/<think>[\s\S]*$/gi, "")
    .replace(/<thought>[\s\S]*$/gi, "")
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

  // 2. Look for JSON markdown block anywhere in the text containing "role" and "bio"
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

  // 3. Fallback: Parse formatted summary text (e.g. **Role:**, **Crafted Bio:**, **Key Skills:**)
  if (!profileData) {
    const roleMatch = cleanText.match(/\*\*Role:\*\*\s*([^\n\r]+)/i);
    const bioMatch = cleanText.match(/\*\*Crafted Bio:\*\*\s*[\r\n]+["“']?([\s\S]*?)["”']?[\r\n]+(?=\*\*|---|$)/i);
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

  // 4. Strip any internal monologue paragraphs (e.g., model speaking to itself)
  const paragraphs = cleanText.split(/\n\s*\n/);
  const filteredParagraphs = paragraphs.filter((p) => {
    const trimmed = p.trim();
    return !/^(?:let me think|i have enough info|the finishing protocol|i could ask|maybe i should|i should wrap|thinking process|internal thoughts|scratchpad|i need a bio|i'm at like exchange)/i.test(trimmed);
  });

  if (filteredParagraphs.length > 0) {
    cleanText = filteredParagraphs.join("\n\n").trim();
  }

  // If entire text was internal thoughts, provide a friendly wrap-up message
  if (!cleanText) {
    cleanText = "Thanks for sharing your background! I've prepared your custom profile based on our chat. Take a look at the live preview and click Proceed when you're ready to continue!";
  }

  return { cleanText, profileData };
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
    const { messages = [] } = body as { messages: ChatMessage[] };

    await connectToDatabase();
    const dbUser: any = await User.findById(session.userId).select("name username avatarUrl").lean();
    const firstName = dbUser?.name ? dbUser.name.split(" ")[0] : "there";

    // Fetch existing onboarding questions from DB to inform the AI
    let dbQuestionsText = "";
    try {
      const dbQuestions = await Question.find({}).sort({ order: 1 }).lean();
      if (dbQuestions && dbQuestions.length > 0) {
        dbQuestionsText = dbQuestions
          .map((q: any, idx: number) => `${idx + 1}. ${q.text || ""}${q.options ? ` (Options: ${q.options.join(", ")})` : ""}`)
          .join("\n");
      }
    } catch {
      // Non-blocking
    }

    const apiKey =
      process.env.OPENROUTER_PROFILE_API_KEY?.trim() ||
      process.env.OPENROUTER_API_KEY?.trim();

    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenRouter API key is not configured in .env (please set OPENROUTER_PROFILE_API_KEY or OPENROUTER_API_KEY)" },
        { status: 500 }
      );
    }

    const systemPrompt = `You are the AI Onboarding Copilot for "Founders Hook" — an exclusive platform that connects startup founders, builders, developers, and designers.
You are having a friendly, smart, 1-on-1 onboarding conversation with ${firstName}.

CARDINAL RULE: EXACTLY ONE QUESTION PER MESSAGE
- NEVER ask multiple questions in a single response.
- Your entire message must contain AT MOST ONE question mark ('?').
- Structure every response in 2 short sentences:
  1. A brief acknowledgment or reaction to what ${firstName} just said.
  2. Exactly ONE specific question to collect the next missing detail.
- Absolutely NO compound questions (e.g., do NOT ask "What domain are you in and what is your tech stack?"). Ask only one thing at a time.

STRICT OUTPUT & SPEECH DIRECTIVE:
- Speak directly to ${firstName} in EVERY token you generate.
- NEVER output internal thoughts, chain-of-thought, planning, scratchpads, or self-monologue.
- NEVER say "Let me think...", "I have enough info...", "The finishing protocol...", or refer to your prompt/rules.
- Keep responses short and conversational (under 45 words).

YOUR MISSION:
Conversationally discover and build the user's complete profile in 3 to 4 quick exchanges:
1. ROLE: Are they a "Founder" (building their own startup) or an "Applicant" (engineer, designer, growth, operator looking to join a team / open roles)?
2. INDUSTRY & DOMAIN: What industry or domain (e.g., AI/ML, SaaS, FinTech, Web3, HealthTech, etc.)?
3. EXPERIENCE & BACKGROUND: Their background, current or past companies/projects, and years of experience.
4. SKILLS: 4 to 8 primary skills (tech stack, design, product, or business).
5. BIO: A punchy, inspiring 2-3 sentence profile bio written in first person ("I am...") highlighting their strengths and goals.

PLATFORM BACKGROUND FIELDS TO MAP:
${dbQuestionsText || "Workforce experience, current stage/role, and goals on Founders Hook."}

CRITICAL INTELLIGENCE & DEDUCTION RULES:
1. NEVER ASK QUESTIONS THE USER ALREADY ANSWERED OR THAT CAN BE LOGICALLY INFERRED:
   - If the user says "corporate working at Google", they are OBVIOUSLY a "Working Professional" in Big Tech. Silently note it and never ask if they are a student, founder, or professional.
   - If the user says "student at MIT", do not ask if they are a student or professional.
   - If they already mentioned their industry, role, or background, NEVER ask for it again.
2. CONCISE & FAST:
   - In 3 to 4 quick exchanges, wrap up.

FINISHING & DELIVERING THE PROFILE:
Once you have enough information for their Role, Industry, Experience, Skills, and Bio:
1. Congratulate ${firstName} and present a polished summary of what you put together (Role, Crafted Bio, and Key Skills).
2. Tell them their profile is ready and to click "Proceed" below to set up their startup or explore opportunities.
3. In this final wrap-up message, ask NO questions (0 question marks).
4. At the very end of your final message, output the data inside <PROFILE_COMPLETE> tags with valid JSON:

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
</PROFILE_COMPLETE>

CRITICAL: Do NOT include <PROFILE_COMPLETE> until you have gathered all necessary information.`;

    const openRouterMessages = [
      { role: "system", content: systemPrompt },
      ...messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    ];

    // Priority model fallback list (OpenRouter allows max 3 models in the 'models' array)
    const configuredModel = process.env.OPENROUTER_PROFILE_MODEL;
    const models = configuredModel
      ? [configuredModel]
      : [
          "minimax/minimax-m2.7:free",
          "liquid/lfm-2.5-2.6b:free",
          "nvidia/nemotron-3.5-lightning:free",
        ];

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
        temperature: 0.7,
        max_tokens: 1500,
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

    return NextResponse.json({
      reply: cleanText,
      isComplete: Boolean(profileData),
      profileData,
    });
  } catch (error) {
    console.error("[ai-onboarding] Route error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
