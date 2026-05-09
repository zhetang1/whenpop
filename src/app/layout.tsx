import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WhenPop – Find a time that works for everyone",
  description: "Create scheduling polls and find the best time to meet.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50">
        <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center">
          <a href="/" className="flex items-center gap-2 group">
            <span className="text-2xl">📅</span>
            <span className="font-bold text-xl text-indigo-600 group-hover:text-indigo-700">
              WhenPop
            </span>
          </a>
        </header>
        <main className="max-w-3xl mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
