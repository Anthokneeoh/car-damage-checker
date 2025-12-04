import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css"; // <--- THIS WAS MISSING! This loads Tailwind.

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "InsurTech AI Damage Assessor",
  description: "AI-powered vehicle damage detection",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* This applies the font and styles to the entire app */}
      <body className={inter.className}>{children}</body>
    </html>
  );
}