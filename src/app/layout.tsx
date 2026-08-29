import type { Metadata } from "next";
import "./globals.css";
import IncomingCallNotifier from "@/components/IncomingCallNotifier";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.foundershook.in"),
  title: "Founders Hook — The Exclusive Network for Startup Founders",
  description:
    "Founders Hook is where student and early-stage startup founders publish their ideas, build teams, and connect with talent looking for internships and real startup experience.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
      { url: "https://res.cloudinary.com/t7efuhnd/image/upload/v1786022235/founder_hook_iorswv.jpg" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      { url: "https://res.cloudinary.com/t7efuhnd/image/upload/v1786022235/founder_hook_iorswv.jpg" },
    ],
  },
  openGraph: {
    title: "Founders Hook — The Exclusive Network for Startup Founders",
    description:
      "Founders Hook is where student and early-stage startup founders publish their ideas, build teams, and connect with talent looking for internships and real startup experience.",
    url: "https://www.foundershook.in",
    siteName: "Founders Hook",
    images: [
      {
        url: "https://res.cloudinary.com/t7efuhnd/image/upload/v1786022235/founder_hook_iorswv.jpg",
        width: 1200,
        height: 630,
        alt: "Founders Hook Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Founders Hook",
    url: "https://www.foundershook.in",
    logo: "https://res.cloudinary.com/t7efuhnd/image/upload/v1786022235/founder_hook_iorswv.jpg",
    sameAs: [],
  };

  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.png" type="image/png" sizes="512x512" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />
        <link
          rel="shortcut icon"
          href="https://res.cloudinary.com/t7efuhnd/image/upload/v1786022235/founder_hook_iorswv.jpg"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
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

