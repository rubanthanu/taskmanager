"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Users,
  CheckSquare,
  TrendingUp,
  Search,
  ChevronDown,
  ChevronUp,
  Calendar,
  Mail,
  Clock,
  PlayCircle,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Layers,
} from "lucide-react";
import Navbar from "../../components/Navbar";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function AdminPage() {
  const router = useRouter();

  const [admin, setAdmin] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL"); // ALL, ADMIN, USER
  const [expandedUsers, setExpandedUsers] = useState({});
  const [copiedEmail, setCopiedEmail] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        const meResponse = await fetch(`${API}/api/auth/me`, {
          credentials: "include",
          signal: controller.signal,
        });

        if (meResponse.status === 401) {
          router.replace("/login");
          return;
        }

        const meData = await meResponse.json();

        if (!meResponse.ok) {
          throw new Error(meData.message || "Could not load your account");
        }

        if (meData.user.role !== "ADMIN") {
          router.replace("/tasks");
          return;
        }

        const response = await fetch(`${API}/api/admin/users`, {
          credentials: "include",
          signal: controller.signal,
        });

        if (response.status === 401) {
          router.replace("/login");
          return;
        }

        if (response.status === 403) {
          router.replace("/tasks");
          return;
        }

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Could not load users");
        }

        setAdmin(meData.user);
        setUsers(data.users || []);

        // Expand first 2 users by default for preview
        const initialExpanded = {};
        (data.users || []).slice(0, 3).forEach((u) => {
          initialExpanded[u.id] = true;
        });
        setExpandedUsers(initialExpanded);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    load();

    return () => controller.abort();
  }, [router]);

  async function handleLogout() {
    setError("");
    setLoggingOut(true);

    try {
      const response = await fetch(`${API}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      router.replace("/login");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoggingOut(false);
    }
  }

  const toggleUserExpanded = (userId) => {
    setExpandedUsers((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  const copyToClipboard = (email) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(""), 2000);
  };

  // Aggregated system metrics
  const systemMetrics = useMemo(() => {
    const totalUsers = users.length;
    const adminCount = users.filter((u) => u.role === "ADMIN").length;
    const memberCount = totalUsers - adminCount;

    let totalTasks = 0;
    let completedTasks = 0;
    let inProgressTasks = 0;
    let todoTasks = 0;

    users.forEach((u) => {
      totalTasks += u.tasks.length;
      u.tasks.forEach((t) => {
        if (t.status === "DONE") completedTasks++;
        else if (t.status === "IN_PROGRESS") inProgressTasks++;
        else todoTasks++;
      });
    });

    const completionRate =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return {
      totalUsers,
      adminCount,
      memberCount,
      totalTasks,
      completedTasks,
      inProgressTasks,
      todoTasks,
      completionRate,
    };
  }, [users]);

  // Filtered users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (roleFilter !== "ALL" && u.role !== roleFilter) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const matchUser =
        u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
      const matchTask = u.tasks.some(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.description && t.description.toLowerCase().includes(q))
      );
      return matchUser || matchTask;
    });
  }, [users, roleFilter, searchQuery]);

  const formatDate = (iso) => {
    if (!iso) return "";
    const date = new Date(iso);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc] text-slate-500">
        <div className="relative flex h-14 w-14 items-center justify-center">
          <div className="absolute h-full w-full rounded-full border-3 border-indigo-600/20 border-t-indigo-600 animate-spin" />
          <ShieldCheck className="h-5 w-5 text-indigo-600" />
        </div>
        <p className="mt-4 text-xs font-semibold tracking-wider uppercase text-slate-500">
          Loading Admin Control Center...
        </p>
      </div>
    );
  }

  if (!admin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-6">
        <p role="alert" className="text-rose-600 font-medium">
          {error || "Authenticating administrator access..."}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-900 transition-colors">
      <Navbar user={admin} onLogout={handleLogout} loggingOut={loggingOut} />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-7">
        {/* Admin Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-violet-50 text-violet-700 border border-violet-200">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                  System Administration
                </h1>
                <p className="text-sm text-slate-500">
                  Global tenant analytics, account directory, and cross-user task oversight
                </p>
              </div>
            </div>
          </div>

          {/* System Status Badge */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs font-semibold self-start sm:self-center">
            <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
            <span>Database Connected & Synced</span>
          </div>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"
          >
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-rose-600" />
            <p className="flex-1">{error}</p>
          </div>
        )}

        {/* Executive KPI Overview Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          <div className="p-5 rounded-xl border border-slate-200/90 bg-white shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Users
              </span>
              <div className="p-2 rounded-lg bg-indigo-50 text-indigo-700">
                <Users className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900">
              {systemMetrics.totalUsers}
            </p>
            <p className="mt-1 text-xs text-slate-500 font-medium">
              {systemMetrics.adminCount} Admins · {systemMetrics.memberCount} Members
            </p>
          </div>

          <div className="p-5 rounded-xl border border-slate-200/90 bg-white shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Tasks
              </span>
              <div className="p-2 rounded-lg bg-violet-50 text-violet-700">
                <CheckSquare className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900">
              {systemMetrics.totalTasks}
            </p>
            <p className="mt-1 text-xs text-slate-500 font-medium">
              Across all user workspaces
            </p>
          </div>

          <div className="p-5 rounded-xl border border-slate-200/90 bg-white shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Global Completion
              </span>
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900">
              {systemMetrics.completionRate}%
            </p>
            <p className="mt-1 text-xs text-slate-500 font-medium">
              {systemMetrics.completedTasks} completed
            </p>
          </div>

          <div className="p-5 rounded-xl border border-slate-200/90 bg-white shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Active in Flight
              </span>
              <div className="p-2 rounded-lg bg-amber-50 text-amber-700">
                <Layers className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900">
              {systemMetrics.inProgressTasks + systemMetrics.todoTasks}
            </p>
            <p className="mt-1 text-xs text-slate-500 font-medium">
              {systemMetrics.inProgressTasks} In Progress · {systemMetrics.todoTasks} To Do
            </p>
          </div>
        </div>

        {/* Directory Search & Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3.5">
          <div className="relative flex-1 max-w-md">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, or task..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 shadow-2xs"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-xl border border-slate-200 bg-white p-1 shadow-2xs">
              {[
                { label: "All Accounts", value: "ALL" },
                { label: "Admins", value: "ADMIN" },
                { label: "Members", value: "USER" },
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setRoleFilter(tab.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    roleFilter === tab.value
                      ? "bg-slate-900 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* User Directory List */}
        <div className="space-y-3.5">
          {filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 p-12 text-center bg-white shadow-xs">
              <Users className="h-10 w-10 text-slate-400 mb-2" />
              <p className="font-semibold text-slate-800">
                No matching accounts found
              </p>
              <p className="text-xs text-slate-500">
                Try refining your search keyword or selected filter.
              </p>
            </div>
          ) : (
            filteredUsers.map((u) => {
              const isExpanded = !!expandedUsers[u.id];
              const userDone = u.tasks.filter((t) => t.status === "DONE").length;
              const userRate =
                u.tasks.length > 0
                  ? Math.round((userDone / u.tasks.length) * 100)
                  : 0;

              return (
                <section
                  key={u.id}
                  className="rounded-xl border border-slate-200/90 bg-white shadow-xs hover:border-slate-300 transition-all overflow-hidden"
                >
                  {/* User Header Summary Bar */}
                  <div
                    onClick={() => toggleUserExpanded(u.id)}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/70 transition-colors"
                  >
                    <div className="flex items-center gap-3.5">
                      {/* Avatar */}
                      <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 font-bold text-sm text-white shadow-xs">
                        {u.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .substring(0, 2)}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2 className="text-sm sm:text-base font-bold text-slate-900">
                            {u.name}
                          </h2>
                          {u.role === "ADMIN" ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-violet-50 text-violet-700 border border-violet-200">
                              <ShieldCheck className="h-3 w-3" />
                              Admin
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                              Member
                            </span>
                          )}
                        </div>

                        <div className="mt-1 flex items-center gap-3 text-xs text-slate-500">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(u.email);
                            }}
                            className="flex items-center gap-1 hover:text-slate-900 group"
                            title="Click to copy email"
                          >
                            <Mail className="h-3.5 w-3.5 text-slate-400" />
                            <span>{u.email}</span>
                            {copiedEmail === u.email ? (
                              <Check className="h-3 w-3 text-emerald-600" />
                            ) : (
                              <Copy className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                            )}
                          </button>

                          {u.createdAt && (
                            <span className="hidden sm:flex items-center gap-1 text-slate-400">
                              <Calendar className="h-3.5 w-3.5" />
                              Joined {formatDate(u.createdAt)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right User Stats & Expand Arrow */}
                    <div className="flex items-center gap-4 self-end sm:self-center">
                      <div className="flex items-center gap-3 text-right">
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-slate-900">
                            {u.tasks.length} {u.tasks.length === 1 ? "task" : "tasks"}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            {userRate}% complete
                          </span>
                        </div>
                        <div className="w-16 bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200 hidden sm:block">
                          <div
                            className="bg-indigo-600 h-full rounded-full"
                            style={{ width: `${userRate}%` }}
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-700 bg-white"
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expandable Task Inspection Drawer */}
                  {isExpanded && (
                    <div className="px-4 sm:px-5 pb-5 pt-2 border-t border-slate-100 bg-slate-50/60">
                      <div className="mb-2.5 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-500">
                        <span>Assigned Tasks</span>
                        <span>Status & Timestamp</span>
                      </div>

                      {u.tasks.length === 0 ? (
                        <div className="py-5 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl bg-white">
                          No tasks logged by this user yet.
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {u.tasks.map((task) => (
                            <div
                              key={task.id}
                              className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl border border-slate-200/90 bg-white p-3 shadow-2xs"
                            >
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-sm text-slate-900 break-words">
                                  {task.title}
                                </h3>
                                {task.description && (
                                  <p className="mt-1 text-xs text-slate-600 leading-relaxed break-words">
                                    {task.description}
                                  </p>
                                )}
                              </div>

                              <div className="flex items-center gap-3 shrink-0 self-start sm:self-center">
                                <AdminTaskStatusBadge status={task.status} />
                                <span className="text-[11px] text-slate-400">
                                  {formatDate(task.createdAt)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </section>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}

function AdminTaskStatusBadge({ status }) {
  if (status === "DONE") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <CheckCircle2 className="h-3 w-3" />
        Done
      </span>
    );
  }
  if (status === "IN_PROGRESS") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
        <PlayCircle className="h-3 w-3" />
        In Progress
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
      <Clock className="h-3 w-3" />
      To Do
    </span>
  );
}