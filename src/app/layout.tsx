import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ATSBoost-AI | AI-Powered Resume Optimization",
  description:
    "AI that customizes your resume for every job — and gets you shortlisted.",
  keywords: [
    "resume optimization",
    "ATS",
    "job application",
    "AI resume",
    "career tools",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
