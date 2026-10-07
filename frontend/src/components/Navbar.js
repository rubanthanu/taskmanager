"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CheckSquare, ShieldCheck, LogOut, CheckCircle2, ChevronRight, ArrowUpRight } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
export default function Navbar({ user, onLogout, loggingOut }) {
 const pathname = usePathname();
 const initials = (user?.name || "User").split(" ").map(n => n[0]).join("").slice(0,2).toUpperCase();
 const links = user?.role === "ADMIN" ? [{href:"/admin",label:"Admin Panel",icon:ShieldCheck}] : [{href:"/tasks",label:"My Tasks",icon:CheckSquare}];
 return <>
 <aside className="fixed inset-y-0 left-0 z-40 hidden w-[232px] flex-col border-r border-slate-200 bg-[var(--card)] px-5 py-7 lg:flex">
 <Link href={links[0].href} className="flex items-center gap-2.5 px-2 font-semibold text-xl tracking-tight"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-700 text-white"><CheckCircle2 size={20}/></span>TaskFlow</Link>
 <div className="mt-10 mb-4 flex items-center gap-3 rounded-xl border border-slate-200 p-3"><span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-semibold">{initials}</span><div className="min-w-0"><p className="truncate text-xs font-semibold">Personal workspace</p><p className="mt-1 text-[11px] text-slate-500">{user?.role === "ADMIN" ? "Administrator" : "Team Member"}</p></div></div>
 <p className="px-3 py-3 text-[10px] font-medium uppercase tracking-[.14em] text-slate-500">Workspace</p>
 <nav aria-label="Workspace navigation" className="space-y-1">{links.map(({href,label,icon:Icon}) => <Link key={href} href={href} aria-current={pathname === href ? "page" : undefined} className={"flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors " + (pathname === href ? "bg-teal-50 text-teal-700" : "text-slate-600 hover:bg-slate-50")}><Icon size={18}/>{label}</Link>)}</nav>
 <div className="mt-auto rounded-xl bg-slate-50 p-4"><CheckCircle2 className="text-teal-700" size={20}/><p className="mt-3 text-sm font-medium">One task at a time.</p><p className="mt-1 text-xs leading-relaxed text-slate-500">Keep the next step clear, and the big picture in view.</p><Link href="/" className="mt-4 flex items-center gap-2 text-xs font-medium text-teal-700">About TaskFlow<ArrowUpRight size={14}/></Link></div>
 <div className="mt-5 flex items-center gap-3 px-2"><span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-teal-700 text-white text-xs font-medium">{initials}</span><div className="min-w-0"><p className="truncate text-xs font-semibold">{user?.name}</p><p className="truncate mt-1 text-[11px] text-slate-500">{user?.email}</p></div></div>
 </aside>
 <header className="sticky top-0 z-30 border-b border-slate-200 bg-[var(--card)]"><div className="flex h-[72px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-10">
 <div className="hidden items-center gap-2 text-xs text-slate-500 lg:flex">Workspace<ChevronRight size={13}/><span className="font-medium text-slate-800">{pathname === "/admin" ? "Admin Panel" : "My Tasks"}</span></div>
 <Link href={links[0].href} className="flex items-center gap-2 text-base font-semibold lg:hidden"><CheckCircle2 className="text-teal-700" size={23}/>TaskFlow</Link>
 <div className="flex items-center gap-3"><span className="hidden text-xs text-slate-500 sm:block">Your space to get things done</span><ThemeToggle/><button type="button" id="logout-btn" onClick={onLogout} disabled={loggingOut} aria-label="Sign out" className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"><LogOut size={14}/><span className="hidden sm:inline">{loggingOut ? "Signing out..." : "Logout"}</span></button></div>
 </div></header>
 </>;
}
