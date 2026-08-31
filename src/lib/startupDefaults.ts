// Default icons and banner themes for startups without user-uploaded media

export const CATEGORY_ICON_MAP: Record<string, string[]> = {
  "AI / ML": ["🧠", "🤖", "⚡", "🔮", "✨", "🧬"],
  "Artificial Intelligence": ["🧠", "🤖", "⚡", "🔮", "✨", "🧬"],
  "Climate Tech": ["🌱", "🌍", "⚡", "🍃", "☀️", "🌊"],
  "Cybersecurity": ["🛡️", "🔒", "🔐", "👁️", "⚔️"],
  "Aerospace": ["🚀", "🛰️", "🛸", "🌌", "🪐", "✈️"],
  "FinTech": ["💳", "📈", "🪙", "💎", "📊", "🏦"],
  "Fintech": ["💳", "📈", "🪙", "💎", "📊", "🏦"],
  "HealthTech": ["🩺", "🧬", "💊", "❤️", "🔬", "🏥"],
  "EdTech": ["🎓", "📚", "💡", "✏️", "🎯", "🧠"],
  "E-Commerce": ["🛒", "🛍️", "📦", "🏷️", "💳"],
  "E-commerce": ["🛒", "🛍️", "📦", "🏷️", "💳"],
  "Consumer": ["📱", "🎧", "🎮", "☕", "🍕", "✨"],
  "SaaS": ["⚡", "☁️", "💻", "🚀", "📊", "🔧"],
  "Developer Tools": ["💻", "⚡", "🛠️", "⚙️", "🔧", "📦"],
  "Web3 / Crypto": ["⛓️", "🪙", "💎", "🌐", "🔑"],
  "Consulting": ["💼", "📊", "💡", "🤝", "📈"],
  "Other": ["🚀", "💡", "⚡", "🔥", "🌟", "🎯"],
};

export const DEFAULT_ICONS = [
  "🚀",
  "⚡",
  "💡",
  "🧠",
  "🌱",
  "🛡️",
  "🔮",
  "💎",
  "🎯",
  "🔥",
  "🦄",
  "🌐",
  "⚙️",
  "🌟",
  "🪐",
  "📡",
];

// Simple deterministic hash for string
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Returns a deterministic fallback icon (emoji) for a startup
 */
export function getDefaultStartupIcon(name?: string, category?: string, id?: string): string {
  const seed = (name || "") + (id || "") + (category || "");
  const hash = hashString(seed || "startup");

  if (category && CATEGORY_ICON_MAP[category]) {
    const list = CATEGORY_ICON_MAP[category];
    return list[hash % list.length];
  }

  return DEFAULT_ICONS[hash % DEFAULT_ICONS.length];
}

export type BannerPreset = {
  id: string;
  name: string;
  bgGradient: string;
  accentColor: string;
  patternType: "grid" | "dots" | "waves" | "mesh" | "circles" | "glow";
};

export const BANNER_PRESETS: BannerPreset[] = [
  {
    id: "cyber-indigo",
    name: "Cyber Indigo",
    bgGradient: "linear-gradient(135deg, #0b0f19 0%, #1e1b4b 50%, #312e81 100%)",
    accentColor: "#6366f1",
    patternType: "grid",
  },
  {
    id: "neon-cyan",
    name: "Neon Cyan",
    bgGradient: "linear-gradient(135deg, #04131f 0%, #064e3b 50%, #0e7490 100%)",
    accentColor: "#06b6d4",
    patternType: "mesh",
  },
  {
    id: "sunset-amber",
    name: "Sunset Amber",
    bgGradient: "linear-gradient(135deg, #1c1005 0%, #78350f 50%, #b45309 100%)",
    accentColor: "#f59e0b",
    patternType: "glow",
  },
  {
    id: "deep-violet",
    name: "Deep Violet",
    bgGradient: "linear-gradient(135deg, #130a21 0%, #581c87 50%, #86198f 100%)",
    accentColor: "#a855f7",
    patternType: "dots",
  },
  {
    id: "emerald-matrix",
    name: "Emerald Matrix",
    bgGradient: "linear-gradient(135deg, #022013 0%, #064e3b 50%, #047857 100%)",
    accentColor: "#10b981",
    patternType: "grid",
  },
  {
    id: "crimson-horizon",
    name: "Crimson Horizon",
    bgGradient: "linear-gradient(135deg, #1f0808 0%, #881337 50%, #9f1239 100%)",
    accentColor: "#f43f5e",
    patternType: "waves",
  },
  {
    id: "midnight-cobalt",
    name: "Midnight Cobalt",
    bgGradient: "linear-gradient(135deg, #030d21 0%, #172554 50%, #1e40af 100%)",
    accentColor: "#3b82f6",
    patternType: "circles",
  },
  {
    id: "carbon-gold",
    name: "Carbon Gold",
    bgGradient: "linear-gradient(135deg, #121214 0%, #262626 50%, #404040 100%)",
    accentColor: "#fbbf24",
    patternType: "mesh",
  },
];

/**
 * Returns a deterministic banner preset for a startup
 */
export function getDefaultStartupBanner(name?: string, category?: string, id?: string): BannerPreset {
  const seed = (name || "") + (id || "") + (category || "");
  const hash = hashString(seed || "banner");
  return BANNER_PRESETS[hash % BANNER_PRESETS.length];
}
