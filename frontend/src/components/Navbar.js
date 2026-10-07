"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CheckSquare, ShieldCheck, LogOut, CheckCircle2 } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

export default function Navbar({ user, onLogout, loggingOut }) {
  const pathname = usePathname();

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/90 bg-white/95 backdrop-blur-md transition-colors shadow-2xs">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Left Brand & Navigation */}
          <div className="flex items-center gap-6 sm:gap-8">
            <Link
              href={user?.role === "ADMIN" ? "/admin" : "/tasks"}
              className="flex items-center gap-2.5 group"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs group-hover:scale-105 transition-all">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-lg tracking-tight text-slate-900">
                    TaskFlow
                  </span>
                  <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/80">
                    Pro
                  </span>
                </div>
              </div>
            </Link>

            {/* Nav Links */}
            <nav className="hidden md:flex items-center gap-1.5">
              <Link
                href="/tasks"
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  pathname === "/tasks"
                    ? "bg-slate-100 text-slate-900 font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <CheckSquare className="h-4 w-4" />
                <span>My Tasks</span>
              </Link>

              {user?.role === "ADMIN" && (
                <Link
                  href="/admin"
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    pathname === "/admin"
                      ? "bg-violet-50 text-violet-700 font-semibold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <ShieldCheck className="h-4 w-4" />
                  <span>Admin Panel</span>
                </Link>
              )}
            </nav>
          </div>

          {/* Right Controls & Profile */}
          <div className="flex items-center gap-3 sm:gap-4">
            <ThemeToggle />

            {user && (
              <div className="flex items-center gap-3 pl-2 sm:pl-3 border-l border-slate-200">
                <div className="flex items-center gap-2.5">
                  <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 font-semibold text-xs text-white shadow-xs">
                    {getInitials(user.name)}
                    <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                  </div>
                  <div className="hidden lg:flex flex-col text-left">
                    <span className="text-sm font-semibold leading-tight text-slate-900">
                      {user.name}
                    </span>
                    <span className="text-[11px] text-slate-500 flex items-center gap-1">
                      {user.role === "ADMIN" ? (
                        <span className="text-violet-700 font-semibold">Administrator</span>
                      ) : (
                        <span>Team Member</span>
                      )}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  id="logout-btn"
                  onClick={onLogout}
                  disabled={loggingOut}
                  title="Sign out of your account"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 border border-slate-200 bg-white transition-all disabled:opacity-50 shadow-2xs"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">
                    {loggingOut ? "Signing out..." : "Logout"}
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
