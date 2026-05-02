import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import GlobalSearch from "@/components/intelligence/GlobalSearch";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Financial Distress Intelligence Platform",
  description: "Enterprise-grade financial monitoring for Australian companies",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-slate-950 text-slate-50 antialiased`} suppressHydrationWarning>
        <div className="flex">
          <Sidebar />
          <main className="flex-1 ml-64 min-h-screen">
            <header className="h-16 border-b border-slate-800 flex items-center justify-between px-8 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
              <div className="flex items-center gap-6 flex-1 max-w-2xl ml-8">
                <GlobalSearch />
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right mr-4">
                  <p className="text-sm font-medium">Analyst Terminal</p>
                  <p className="text-xs text-slate-500 italic">Connected to AU-EAST-1</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold">A</div>
              </div>
            </header>
            <div className="p-8">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
