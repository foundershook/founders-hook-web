import type { Metadata } from "next";
import "./globals.css";
import IncomingCallNotifier from "@/components/IncomingCallNotifier";

export const metadata: Metadata = {
  title: "Founders Hook — The Exclusive Network for Startup Founders",
  description:
    "Founders Hook is where student and early-stage startup founders publish their ideas, build teams, and connect with talent looking for internships and real startup experience.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-ink-950 text-sand-200 antialiased">
        {children}
        <IncomingCallNotifier />
      </body>
    </html>
  );
}

