import type { Metadata } from "next";
import "./globals.css";

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
      <body
        style={{ fontFamily: "'Times New Roman', Calibri, Georgia, serif" }}
        className="bg-ink-950 text-sand-200 antialiased"
      >
        {children}
      </body>
    </html>
  );
}
