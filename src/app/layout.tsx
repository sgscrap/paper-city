import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ToastContainer } from "@/components/ui/ToastContainer";
import { NpcDialogue } from '@/components/overlays/NpcDialogue';

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-inter",
});

const fontMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Paper City OS",
  description: "A Coalition Roleplaying System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body
        className={`font-sans bg-bg-main text-text-main ${fontMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <main className="flex-1 overflow-hidden relative">
          {children}
          <ToastContainer />
          <NpcDialogue />
        </main>
      </body>
    </html>
  );
}
