import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HackRank.lol",
  description: "The digital battleground where only one link reigns supreme. Hijack the #1 spot, drive traffic, and assert dominance.",
  openGraph: {
    title: "HackRank.lol",
    description: "The digital battleground where only one link reigns supreme.",
    url: "https://hackrank.lol",
    siteName: "HackRank",
    images: [
      {
        url: "https://hackrank.lol/og-image.png",
        width: 1200,
        height: 630,
      },
    ],
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full bg-black text-terminal-green font-mono flex flex-col" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
        {children}
      </body>
    </html>
  );
}
