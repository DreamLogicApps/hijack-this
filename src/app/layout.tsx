import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HIJACKTHIS.SITE // Single-Link Monopoly Game",
  description: "Pay to hijack the single focal link on the internet! Outbid the reigning champion to control the spotlight.",
  openGraph: {
    title: "HIJACKTHIS.SITE // Single-Link Monopoly Game",
    description: "Pay to hijack the single focal link on the internet! Outbid the reigning champion to control the spotlight.",
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
