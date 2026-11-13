import type { Metadata } from "next";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import disclaimer from "@/content/ai-disclaimer.md";

export const metadata: Metadata = {
  title: "AI Disclaimer | Founders Hook",
  description: "AI Disclaimer for Founders Hook.",
};

export default function AiDisclaimerPage() {
  return (
    <main className="min-h-screen bg-[#FAF8F4] text-[#1a1a1a]">
      <header className="border-b border-[#e8e4dc] bg-[#FAF8F4]">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5 lg:px-8">
          <Link href="/" className="font-bold tracking-tight text-[#1a1a1a]">
            Founders Hook
          </Link>
          <Link
            href="/"
            className="text-sm font-medium text-[#6B7A2F] transition-colors hover:text-[#4f5b22]"
          >
            Back to home
          </Link>
        </div>
      </header>

      <article className="mx-auto max-w-4xl px-6 py-16 lg:px-8 lg:py-24">
        <div className="text-[15px] leading-8 text-[#555]">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ children }) => (
                <h1 className="mb-5 border-b border-[#d4d0c8] pb-10 text-4xl font-bold tracking-tight text-[#1a1a1a] sm:text-5xl">
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className="mb-4 mt-12 text-2xl font-bold leading-tight text-[#1a1a1a]">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="mb-3 mt-8 text-lg font-semibold text-[#1a1a1a]">
                  {children}
                </h3>
              ),
              p: ({ children }) => <p className="mb-4">{children}</p>,
              ol: ({ children }) => (
                <ol className="my-4 list-decimal space-y-1 pl-6">{children}</ol>
              ),
              ul: ({ children }) => (
                <ul className="my-4 list-disc space-y-1 pl-6">{children}</ul>
              ),
              a: ({ children, href }) => (
                <a className="text-[#6B7A2F] hover:underline" href={href}>
                  {children}
                </a>
              ),
              hr: () => <hr className="my-8 border-[#d4d0c8]" />,
            }}
          >
            {disclaimer}
          </ReactMarkdown>
        </div>
      </article>
    </main>
  );
}
