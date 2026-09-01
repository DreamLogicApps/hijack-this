import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HijackIt.lol",
  description: "The ultimate king-of-the-hill link battle.",
  openGraph: {
    title: "HijackIt.lol",
    description: "The ultimate king-of-the-hill link battle.",
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
