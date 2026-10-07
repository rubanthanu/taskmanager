"use client";

import Link from "next/link";
import {
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Kanban,
  ShieldCheck,
  Zap,
} from "lucide-react";
import ThemeToggle from "../components/ThemeToggle";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-900 overflow-hidden">
      {/* Navigation Header */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/90 bg-white/95 backdrop-blur-md shadow-2xs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <span className="font-bold text-lg tracking-tight text-slate-900">
              TaskFlow
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/login"
              className="px-3.5 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold shadow-xs hover:bg-indigo-700 active:scale-95 transition-all"
            >
              <span>Get Started</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 pt-16 pb-20 max-w-5xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-indigo-200 bg-indigo-50 text-indigo-700 text-xs font-semibold mb-6">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Professional Task & Project Management</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 max-w-3xl leading-[1.15]">
          Organize, execute, and deliver tasks with{" "}
          <span className="text-indigo-600">
            pure clarity.
          </span>
        </h1>

        <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
          Clean task management featuring interactive Kanban boards,
          real-time workspace completion tracking, and granular administrative governance.
        </p>

        {/* Action CTAs */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-3.5">
          <Link
            href="/register"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3 rounded-xl bg-indigo-600 text-white font-semibold text-sm shadow-xs hover:bg-indigo-700 active:scale-95 transition-all"
          >
            <span>Start Free Workspace</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-semibold text-sm hover:bg-slate-50 active:scale-95 transition-all shadow-2xs"
          >
            <span>Sign In to Dashboard</span>
          </Link>
        </div>

        {/* Feature Highlights Grid */}
        <div className="mt-16 w-full grid grid-cols-1 md:grid-cols-3 gap-5 text-left">
          <div className="p-5 sm:p-6 rounded-xl border border-slate-200/90 bg-white shadow-xs">
            <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center mb-3.5">
              <Kanban className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Interactive Kanban & List
            </h3>
            <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
              Switch smoothly between Kanban lane boards and compact lists.
              Advance tasks with one-click status transitions.
            </p>
          </div>

          <div className="p-5 sm:p-6 rounded-xl border border-slate-200/90 bg-white shadow-xs">
            <div className="h-10 w-10 rounded-xl bg-violet-50 text-violet-700 flex items-center justify-center mb-3.5">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Role-Based Governance
            </h3>
            <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
              Strict isolation separating member task management from
              tenant-wide administrative directories and user oversight.
            </p>
          </div>

          <div className="p-5 sm:p-6 rounded-xl border border-slate-200/90 bg-white shadow-xs">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3.5">
              <Zap className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Productivity Tracking
            </h3>
            <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
              Real-time workspace completion rates, lane counts, and
              rewarding celebratory feedback as you complete items.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 py-6 text-center text-xs text-slate-500">
        <p>© 2026 TaskFlow. Professional task and workflow software.</p>
      </footer>
    </div>
  );
}
