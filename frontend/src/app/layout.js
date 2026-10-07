import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "../components/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "TaskFlow — Modern Task & Workflow Management",
  description:
    "Organize, prioritize, and accelerate your productivity with intelligent task tracking and collaborative team workflows.",
  keywords: "task manager, productivity, todo, project management, kanban",
  authors: [{ name: "TaskFlow Team" }],
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-[var(--background)] dark:bg-[var(--background)] text-slate-900 transition-colors duration-200 selection:bg-teal-500/20 selection:text-teal-600 dark:selection:text-teal-400">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
