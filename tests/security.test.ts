import { describe, expect, it } from "vitest";
import { validatePassword, PASSWORD_MIN_LENGTH } from "../src/lib/password-policy";
import {
  cleanString,
  cleanStringArray,
  isResumeUrl,
  isSafeHttpUrl,
  isSafeHttpsUrl,
  isValidEmail,
  isValidUsername,
} from "../src/lib/validation";
import { escapeRegex, normalizeSearchInput, MAX_SEARCH_LENGTH } from "../src/lib/search";
import { assertPublicUrl } from "../src/lib/safe-fetch";
import { rateLimit } from "../src/lib/rate-limit";
import { hashIdentifier } from "../src/lib/audit";

describe("password policy", () => {
  it("accepts a strong password", () => {
    expect(validatePassword("CorrectHorse9!")).toBeNull();
  });

  it("rejects short passwords", () => {
    expect(validatePassword("Short1!")).toContain(String(PASSWORD_MIN_LENGTH));
  });

  it("rejects common passwords", () => {
    expect(validatePassword("password1234")).toMatch(/too common/i);
  });

  it("requires three character classes", () => {
    expect(validatePassword("alllowercase12")).toMatch(/three of/i);
  });

  it("rejects values over bcrypt's 72-byte limit", () => {
    expect(validatePassword(`A1!${"a".repeat(80)}`)).toMatch(/72 bytes/i);
  });

  it("rejects non-strings", () => {
    expect(validatePassword(undefined)).toMatch(/required/i);
  });
});

describe("input validation", () => {
  it("only accepts http(s) URLs", () => {
    expect(isSafeHttpUrl("https://example.com")).toBe(true);
    expect(isSafeHttpUrl("http://example.com")).toBe(true);
    expect(isSafeHttpUrl("javascript:alert(1)")).toBe(false);
    expect(isSafeHttpUrl("data:text/html,<script>")).toBe(false);
    expect(isSafeHttpUrl("not a url")).toBe(false);
  });

  it("requires https for media URLs", () => {
    expect(isSafeHttpsUrl("https://example.com/a.png")).toBe(true);
    expect(isSafeHttpsUrl("http://example.com/a.png")).toBe(false);
  });

  it("only permits PDF resume payloads", () => {
    expect(isResumeUrl("data:application/pdf;base64,AAAA")).toBe(true);
    expect(isResumeUrl("data:text/html;base64,AAAA")).toBe(false);
    expect(isResumeUrl("http://example.com/cv.pdf")).toBe(false);
    expect(isResumeUrl("https://example.com/cv.pdf")).toBe(true);
  });

  it("validates emails and usernames", () => {
    expect(isValidEmail("a@b.co")).toBe(true);
    expect(isValidEmail("a@b")).toBe(false);
    expect(isValidUsername("founder_01")).toBe(true);
    expect(isValidUsername("ab")).toBe(false);
    expect(isValidUsername("bad name")).toBe(false);
  });

  it("caps string and array sizes", () => {
    expect(cleanString("  hi  ", 10)).toBe("hi");
    expect(cleanString("toolong", 3)).toBeNull();
    expect(cleanStringArray(["a", "b"], 2, 5)).toEqual(["a", "b"]);
    expect(cleanStringArray(["a", "b", "c"], 2, 5)).toBeNull();
    expect(cleanStringArray(["a", ""], 2, 5)).toBeNull();
  });
});

describe("search escaping", () => {
  it("escapes regex metacharacters", () => {
    expect(escapeRegex("a.*b(c)")).toBe("a\\.\\*b\\(c\\)");
  });

  it("trims and truncates search input", () => {
    expect(normalizeSearchInput("  hello  ")).toBe("hello");
    expect(normalizeSearchInput("x".repeat(200))).toHaveLength(MAX_SEARCH_LENGTH);
  });
});

describe("SSRF protection", () => {
  it.each([
    "http://127.0.0.1",
    "http://localhost",
    "http://10.0.0.1",
    "http://172.16.0.1",
    "http://192.168.1.1",
    "http://169.254.169.254/latest/meta-data",
    "http://[::1]",
    "http://0.0.0.0",
  ])("rejects %s", async (url) => {
    await expect(assertPublicUrl(url)).rejects.toThrow();
  });

  it("rejects non-http protocols and embedded credentials", async () => {
    await expect(assertPublicUrl("file:///etc/passwd")).rejects.toThrow(/http/i);
    await expect(assertPublicUrl("http://user:pass@example.com")).rejects.toThrow(
      /credentials/i
    );
  });

  it("accepts a public IP literal", async () => {
    await expect(assertPublicUrl("http://93.184.216.34")).resolves.toBeInstanceOf(URL);
  });
});

describe("rate limiting", () => {
  it("blocks after the configured limit", async () => {
    const key = `test-${Date.now()}-${Math.random()}`;
    expect((await rateLimit(key, 2, 60)).allowed).toBe(true);
    expect((await rateLimit(key, 2, 60)).allowed).toBe(true);
    const blocked = await rateLimit(key, 2, 60);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });
});

describe("audit helpers", () => {
  it("hashes identifiers without leaking them", () => {
    const hash = hashIdentifier("Founder@Example.com");
    expect(hash).toHaveLength(12);
    expect(hash).toBe(hashIdentifier("founder@example.com"));
    expect(hash).not.toContain("@");
  });
});
