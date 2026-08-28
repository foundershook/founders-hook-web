/**
 * analyzeWebsite.ts  –  Server-only utility
 *
 * Fetches a founder's website, strips HTML to plain text, then asks
 * OpenRouter to produce three structured insights:
 *   1. What is this startup about?
 *   2. What problem are they solving?
 *   3. What is their solution?
 *
 * Design choices to stay within rate-limits / minimise cost:
 *   - Hard 8-second timeout on the webpage fetch
 *   - Scraped text is capped at 4 000 characters before sending to the LLM
 *   - Uses `google/gemini-flash-1.5` (cheap, fast) via OpenRouter
 *   - Returns null on ANY failure — never throws, never blocks the API route
 */

export interface AiInsights {
  about: string;
  problem: string;
  solution: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function stripHtml(html: string): string {
  return html
    // Remove <script> and <style> blocks entirely
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    // Remove all other HTML tags
    .replace(/<[^>]+>/g, " ")
    // Collapse whitespace
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchWithTimeout(url: string, timeoutMs = 8000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      signal: controller.signal,
      headers: {
        // Politely identify ourselves; some sites block blank UA
        "User-Agent":
          "Mozilla/5.0 (compatible; FoundersHookBot/1.0; +https://foundershook.in)",
      },
    });
  } finally {
    clearTimeout(timer);
  }
}

// ── Main export ───────────────────────────────────────────────────────────────

export async function analyzeWebsite(url: string): Promise<AiInsights | null> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    console.warn("[analyzeWebsite] OPENROUTER_API_KEY not set – skipping analysis");
    return null;
  }

  // Normalise the URL
  let normalised = url.trim();
  if (!/^https?:\/\//i.test(normalised)) normalised = "https://" + normalised;

  // ── 1. Scrape the website ────────────────────────────────────────────────
  let pageText = "";
  try {
    const resp = await fetchWithTimeout(normalised);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const html = await resp.text();
    pageText = stripHtml(html).slice(0, 4000); // cap tokens
  } catch (err) {
    console.warn("[analyzeWebsite] Failed to fetch website:", err);
    return null;
  }

  if (!pageText.trim()) return null;

  // ── 2. Call OpenRouter ───────────────────────────────────────────────────
  const systemPrompt = `You are a startup analyst. Given website text, return ONLY a raw JSON object. No thinking, no reasoning, no explanation, no markdown fences. Just the JSON.

The JSON must have exactly three keys:
- "about": A 1–2 sentence description of what the startup does.
- "problem": A 1–2 sentence description of the core problem they solve.
- "solution": A 1–2 sentence description of their solution.

Example output:
{"about":"Acme Corp builds AI-powered tools for recruiters.","problem":"Hiring managers spend too much time screening resumes manually.","solution":"They use NLP to auto-rank candidates and surface the best fits in seconds."}`;

  const userPrompt = `Analyze the following website content. Return ONLY the JSON object with real, specific insights about THIS company:\n\n${pageText}`;

  const requestBody = {
    // OpenRouter's native fallback: tries models in order server-side
    models: [
      "inclusionai/ling-3.0-flash-fin:free",
      "liquid/lfm-2.5-2.6b:free",
      "nvidia/nemotron-3.5-content-safety:free"
    ],
    max_tokens: 512,
    temperature: 0.2,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  };

  // Try up to 2 times (to handle a single 429 with a brief cooldown)
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://foundershook.in",
          "X-Title": "Founders Hook",
        },
        body: JSON.stringify(requestBody),
      });

      if (res.status === 429) {
        console.warn(`[analyzeWebsite] Rate-limited (attempt ${attempt + 1}), retrying in 3s...`);
        await new Promise((r) => setTimeout(r, 3000));
        continue;
      }

      if (!res.ok) {
        const errText = await res.text();
        console.warn("[analyzeWebsite] OpenRouter error:", res.status, errText);
        return null;
      }

      const json = await res.json();
      const content: string = json?.choices?.[0]?.message?.content ?? "";

      const parsed = extractJson(content);

      // Check for valid parsed result
      const isInvalid = !parsed || !parsed.about || !parsed.problem || !parsed.solution;

      // Reject placeholder/echoed responses (model copying instructions instead of analyzing)
      const isPlaceholder = parsed && (
        parsed.about.includes("1-2 sentence") ||
        parsed.about.includes("what this startup") ||
        parsed.about.includes("<") ||
        parsed.problem.includes("1-2 sentence") ||
        parsed.solution.includes("1-2 sentence")
      );

      if (isInvalid || isPlaceholder) {
        console.warn("[analyzeWebsite] Bad response (invalid or placeholder). Raw content:", content);
        if (attempt < 1) {
          console.warn(`[analyzeWebsite] Retrying (attempt ${attempt + 1})...`);
          await new Promise((r) => setTimeout(r, 1000));
          continue;
        }
        return null;
      }

      return {
        about: parsed.about.trim(),
        problem: parsed.problem.trim(),
        solution: parsed.solution.trim(),
      };
    } catch (err) {
      console.warn("[analyzeWebsite] LLM call failed:", err);
      return null;
    }
  }

  console.warn("[analyzeWebsite] All retries exhausted");
  return null;
}

// ── JSON extraction helper ───────────────────────────────────────────────────
// Models sometimes wrap JSON in markdown fences or prose. This tries multiple
// strategies to extract a valid JSON object from the response.
function extractJson(raw: string): AiInsights | null {
  // 1. Strip markdown code fences
  let cleaned = raw.replace(/```(?:json)?\s*/gi, "").replace(/```/g, "").trim();

  // 2. Try parsing directly
  try {
    return JSON.parse(cleaned) as AiInsights;
  } catch { /* fall through */ }

  // 3. Extract JSON objects using brace-depth counting (handles nested braces)
  //    This works even when the model outputs reasoning text before/after the JSON
  for (let i = 0; i < cleaned.length; i++) {
    if (cleaned[i] !== "{") continue;
    let depth = 0;
    let inString = false;
    let escape = false;
    for (let j = i; j < cleaned.length; j++) {
      const ch = cleaned[j];
      if (escape) { escape = false; continue; }
      if (ch === "\\") { escape = true; continue; }
      if (ch === '"') { inString = !inString; continue; }
      if (inString) continue;
      if (ch === "{") depth++;
      if (ch === "}") depth--;
      if (depth === 0) {
        const candidate = cleaned.slice(i, j + 1);
        try {
          const obj = JSON.parse(candidate);
          if (obj.about && obj.problem && obj.solution) return obj as AiInsights;
        } catch { /* try next { */ }
        break;
      }
    }
  }

  return null;
}
