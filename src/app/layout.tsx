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
      <body className="min-h-full bg-black text-terminal-green font-mono flex flex-col">
        {children}
      </body>
    </html>
  );
}
