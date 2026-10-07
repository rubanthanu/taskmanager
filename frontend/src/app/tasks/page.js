"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Clock,
  PlayCircle,
  Plus,
  Search,
  Kanban,
  List,
  Trash2,
  Edit3,
  X,
  Calendar,
  AlertCircle,
  Inbox,
  CheckSquare,
} from "lucide-react";
import { KanbanColumn, StatusBadge } from "../../components/TaskBoard";
import WorkspaceLoading from "../../components/WorkspaceLoading";
import Dialog from "../../components/Dialog";
import Navbar from "../../components/Navbar";
import { triggerTaskCelebration } from "../../lib/confetti";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function TasksPage() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);
  const [busy, setBusy] = useState(false);

  // New task form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [showDescriptionField, setShowDescriptionField] = useState(false);
  const [saving, setSaving] = useState(false);

  // Edit task state
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editStatus, setEditStatus] = useState("TODO");

  // Filter, Search, and View states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [viewMode, setViewMode] = useState("board"); // "board" or "list"
  const [sortBy, setSortBy] = useState("newest"); // "newest", "oldest", "title"
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [successToast, setSuccessToast] = useState("");

  const showToast = (message) => {
    setSuccessToast(message);
    setTimeout(() => {
      setSuccessToast("");
    }, 3500);
  };

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

        if (meData.user.role !== "USER") {
          router.replace("/admin");
          return;
        }

        const tasksResponse = await fetch(`${API}/api/tasks`, {
          credentials: "include",
          signal: controller.signal,
        });

        if (tasksResponse.status === 401) {
          router.replace("/login");
          return;
        }

        const tasksData = await tasksResponse.json();

        if (!tasksResponse.ok) {
          throw new Error(tasksData.message || "Could not load tasks");
        }

        setUser(meData.user);
        setTasks(tasksData.tasks || []);
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

  async function handleCreate(event) {
    event.preventDefault();
    if (!title.trim()) return;

    setError("");
    setSaving(true);

    try {
      const payload = {
        title: title.trim(),
        description: description.trim() ? description.trim() : undefined,
      };

      const response = await fetch(`${API}/api/tasks`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 401) {
        router.replace("/login");
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not create task");
      }

      setTasks((current) => [data.task, ...current]);
      setTitle("");
      setDescription("");
      setShowDescriptionField(false);
      showToast("Task created successfully!");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function startEdit(task) {
    setError("");
    setEditingId(task.id);
    setEditTitle(task.title);
    setEditDescription(task.description ?? "");
    setEditStatus(task.status);
  }

  async function handleUpdate(event) {
    event?.preventDefault();
    if (!editTitle.trim()) return;

    setError("");
    setBusy(true);

    try {
      const response = await fetch(`${API}/api/tasks/${editingId}`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: editTitle.trim(),
          description: editDescription.trim() ? editDescription.trim() : null,
          status: editStatus,
        }),
      });

      if (response.status === 401) {
        router.replace("/login");
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not update task");
      }

      setTasks((current) =>
        current.map((task) => (task.id === data.task.id ? data.task : task))
      );

      if (editStatus === "DONE") {
        triggerTaskCelebration();
      }

      setEditingId(null);
      showToast("Task updated successfully!");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  // Quick single-click status progression
  async function handleQuickStatusChange(task, nextStatus) {
    setBusy(true);
    setError("");

    try {
      const response = await fetch(`${API}/api/tasks/${task.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: nextStatus,
        }),
      });

      if (response.status === 401) {
        router.replace("/login");
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not update status");
      }

      setTasks((current) =>
        current.map((t) => (t.id === data.task.id ? data.task : t))
      );

      if (nextStatus === "DONE") {
        triggerTaskCelebration();
        showToast("Task completed! ");
      } else {
        showToast(`Moved to ${nextStatus === "IN_PROGRESS" ? "In Progress" : "To Do"}`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(taskId) {
    setError("");
    setBusy(true);

    try {
      const response = await fetch(`${API}/api/tasks/${taskId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.status === 401) {
        router.replace("/login");
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not delete task");
      }

      setTasks((current) => current.filter((task) => task.id !== taskId));

      if (editingId === taskId) {
        setEditingId(null);
      }
      setTaskToDelete(null);
      showToast("Task deleted.");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  // Filtered & Sorted Tasks
  const filteredTasks = useMemo(() => {
    return tasks
      .filter((t) => {
        if (statusFilter !== "ALL" && t.status !== statusFilter) return false;
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          t.title.toLowerCase().includes(q) ||
          (t.description && t.description.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => {
        if (sortBy === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
        if (sortBy === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
        if (sortBy === "title") return a.title.localeCompare(b.title);
        return 0;
      });
  }, [tasks, statusFilter, searchQuery, sortBy]);

  // Status Metrics
  const metrics = useMemo(() => {
    const total = tasks.length;
    const todo = tasks.filter((t) => t.status === "TODO").length;
    const inProgress = tasks.filter((t) => t.status === "IN_PROGRESS").length;
    const done = tasks.filter((t) => t.status === "DONE").length;
    const rate = total > 0 ? Math.round((done / total) * 100) : 0;
    return { total, todo, inProgress, done, rate };
  }, [tasks]);

  const formatDate = (iso) => {
    if (!iso) return "";
    const date = new Date(iso);
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  };

  if (loading) return <WorkspaceLoading />;

  if (!user) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-slate-50 p-6">
        <p role="alert" className="text-rose-600 font-medium">
          {error || "Authenticating session..."}
        </p>
      </div>
    );
  }

  return (
    <div className="app-shell min-h-[100dvh] flex flex-col bg-[var(--background)] text-slate-900 transition-colors">
      <Navbar user={user} onLogout={handleLogout} loggingOut={loggingOut} />

      {/* Floating Success Toast */}
      {successToast && (
        <div role="status"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-xl border border-slate-900/10 bg-teal-700 text-white px-4 py-3 shadow-xl backdrop-blur-md animate-in slide-in-from-bottom-4 duration-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span className="text-xs font-medium">{successToast}</span>
        </div>
      )}

      <main className="workspace-main flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-10 py-8 space-y-7">
        {/* Workspace Header & Productivity KPI Overview */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
                  My Tasks
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200/80">
                  {metrics.total} {metrics.total === 1 ? "task" : "tasks"}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-500">
                A little structure. A lot more focus.
              </p>
            </div>

            {/* Quick Completion Pill */}
            <div className="flex items-center gap-4 px-4 py-2.5 rounded-xl border border-slate-200/90 bg-[var(--card)] shadow-xs">
              <div className="flex flex-col">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Workspace Completion
                </span>
                <span className="text-base font-bold text-slate-900">
                  {metrics.rate}%
                </span>
              </div>
              <div className="w-24 bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                <div
                  className="bg-teal-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${metrics.rate}%` }}
                />
              </div>
            </div>
          </div>

          {/* Metric KPI Cards - Professional White Look */}
          <div className="metric-grid grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
            <div className="p-4 sm:p-5 rounded-xl border border-slate-200/90 bg-[var(--card)] shadow-xs hover:border-slate-300 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Total Tasks
                </span>
                <div className="p-2 rounded-lg bg-slate-100 text-slate-700">
                  <CheckSquare className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-2 text-2xl sm:text-3xl font-semibold text-slate-900">
                {metrics.total}
              </p>
            </div>

            <div className="p-4 sm:p-5 rounded-xl border border-amber-200/90 bg-[var(--card)] shadow-xs hover:border-amber-300 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
                  To Do
                </span>
                <div className="p-2 rounded-lg bg-amber-50 text-amber-600 border border-amber-200/60">
                  <Clock className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-2 text-2xl sm:text-3xl font-semibold text-slate-900">
                {metrics.todo}
              </p>
            </div>

            <div className="p-4 sm:p-5 rounded-xl border border-teal-200/90 bg-[var(--card)] shadow-xs hover:border-teal-300 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-teal-700 uppercase tracking-wider">
                  In Progress
                </span>
                <div className="p-2 rounded-lg bg-teal-50 text-teal-600 border border-teal-200/60">
                  <PlayCircle className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-2 text-2xl sm:text-3xl font-semibold text-slate-900">
                {metrics.inProgress}
              </p>
            </div>

            <div className="p-4 sm:p-5 rounded-xl border border-emerald-200/90 bg-[var(--card)] shadow-xs hover:border-emerald-300 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
                  Done
                </span>
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200/60">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-2 text-2xl sm:text-3xl font-semibold text-slate-900">
                {metrics.done}
              </p>
            </div>
          </div>
        </div>

        {/* Global Error Notice */}
        {error && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"
          >
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-rose-600" />
            <div className="flex-1">
              <p className="font-semibold">Notice</p>
              <p className="text-xs mt-0.5">{error}</p>
            </div>
            <button
              onClick={() => setError("")}
              aria-label="Dismiss notice"
              className="p-1 rounded-lg hover:bg-rose-100 text-rose-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Create Task Card */}
        <section className="rounded-xl border border-slate-200/90 bg-[var(--card)] p-4 sm:p-5 shadow-xs">
          <form onSubmit={handleCreate} className="space-y-3.5">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1">
                <label htmlFor="task-title-input" className="block text-xs font-medium text-slate-600 mb-2">New task</label>
                <input
                  id="task-title-input"
                  type="text"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="What needs to get done?"
                  maxLength={200}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-600 focus:bg-[var(--card)] focus:outline-none focus:ring-2 focus:ring-teal-100 transition-all"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowDescriptionField(!showDescriptionField)}
                  className={`px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                    showDescriptionField || description
                      ? "border-teal-300 bg-teal-50 text-teal-700"
                      : "border-slate-200 hover:border-slate-300 bg-[var(--card)] text-slate-600"
                  }`}
                >
                  {showDescriptionField ? "Hide notes" : "+ Add notes"}
                </button>

                <button
                  type="submit"
                  id="create-task-btn"
                  disabled={saving || !title.trim()}
                  className="flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-teal-700 active:scale-[0.99] disabled:opacity-50 transition-all shrink-0"
                >
                  <Plus className="h-4 w-4" />
                  <span>{saving ? "Adding..." : "Add Task"}</span>
                </button>
              </div>
            </div>

            {/* Expandable Description Area */}
            {showDescriptionField && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-150">
                <label htmlFor="task-description-input" className="block text-xs font-medium text-slate-600 mb-2">Notes</label>
                <textarea
                  id="task-description-input"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Optional details, notes, or acceptance criteria..."
                  rows={2}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-600 focus:bg-[var(--card)] focus:outline-none focus:ring-2 focus:ring-teal-100 transition-all"
                />
              </div>
            )}
          </form>
        </section>

        {/* Toolbar: Search, Filter Tabs, Sort, and View Mode Toggle */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3.5">
          {/* Left: Search input */}
          <div className="relative flex-1 max-w-md">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              aria-label="Search tasks"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-[var(--card)] pl-10 pr-8 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100 shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Right: Filters & View Switch */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Status Filter Chips */}
            <div className="flex items-center rounded-xl border border-slate-200 bg-[var(--card)] p-1 shadow-2xs">
              {[
                { label: "All", value: "ALL" },
                { label: "To Do", value: "TODO" },
                { label: "In Progress", value: "IN_PROGRESS" },
                { label: "Done", value: "DONE" },
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setStatusFilter(tab.value)}
                  aria-pressed={statusFilter === tab.value}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    statusFilter === tab.value
                      ? "bg-teal-700 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <select
              aria-label="Sort tasks"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-xl border border-slate-200 bg-[var(--card)] px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100 shadow-2xs"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="title">Alphabetical</option>
            </select>

            {/* View Mode Toggle: Board vs List */}
            <div className="flex items-center rounded-xl border border-slate-200 bg-[var(--card)] p-1 shadow-2xs">
              <button
                type="button"
                onClick={() => setViewMode("board")}
                aria-pressed={viewMode === "board"}
                title="Kanban Board View"
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === "board"
                    ? "bg-slate-100 text-teal-700 font-bold"
                    : "text-slate-400 hover:text-slate-700"
                }`}
              >
                <Kanban className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                aria-pressed={viewMode === "list"}
                title="List View"
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === "list"
                    ? "bg-slate-100 text-teal-700 font-bold"
                    : "text-slate-400 hover:text-slate-700"
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Task Edit Modal Overlay */}
        {editingId && (
          <Dialog onClose={() => { if (!busy) setEditingId(null); }} labelledBy="edit-dialog-title">
            <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-[var(--card)] p-6 shadow-2xl animate-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <Edit3 className="h-5 w-5 text-teal-600" />
                  <h3 id="edit-dialog-title" className="font-bold text-lg text-slate-900">
                    Edit Task
                  </h3>
                </div>
                <button
                  onClick={() => setEditingId(null)}
                  aria-label="Close task editor"
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleUpdate} className="mt-5 space-y-4">
                <div>
                  <label
                    htmlFor="edit-task-title"
                    className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
                  >
                    Task Title
                  </label>
                  <input
                    id="edit-task-title"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    required
                    maxLength={200}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-teal-600 focus:bg-[var(--card)] focus:ring-2 focus:ring-teal-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="edit-task-description"
                    className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
                  >
                    Description
                  </label>
                  <textarea
                    id="edit-task-description"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows={3}
                    placeholder="Add detailed task notes or links..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 focus:outline-none focus:border-teal-600 focus:bg-[var(--card)] focus:ring-2 focus:ring-teal-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="edit-task-status"
                    className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
                  >
                    Status
                  </label>
                  <select
                    id="edit-task-status"
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-teal-600 focus:bg-[var(--card)] focus:ring-2 focus:ring-teal-100"
                  >
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="DONE">Done</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    disabled={busy}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={busy || !editTitle.trim()}
                    className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-sm font-semibold text-white shadow-xs disabled:opacity-50 transition-all"
                  >
                    {busy ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </Dialog>
        )}

        {/* Delete Confirmation Modal */}
        {taskToDelete && (
          <Dialog onClose={() => { if (!busy) setTaskToDelete(null); }} labelledBy="delete-dialog-title">
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-[var(--card)] p-6 shadow-2xl animate-in zoom-in-95 duration-150">
              <div className="flex items-center gap-3 text-rose-600">
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200">
                  <Trash2 className="h-5 w-5" />
                </div>
                <h3 id="delete-dialog-title" className="font-bold text-lg text-slate-900">
                  Delete Task?
                </h3>
              </div>
              <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-slate-900">
                  &ldquo;{taskToDelete.title}&rdquo;
                </span>
                ? This action cannot be undone.
              </p>
              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setTaskToDelete(null)}
                  disabled={busy}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(taskToDelete.id)}
                  disabled={busy}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-sm font-semibold text-white shadow-xs disabled:opacity-50"
                >
                  {busy ? "Deleting..." : "Delete Permanently"}
                </button>
              </div>
            </div>
          </Dialog>
        )}

        {/* Empty State */}
        {filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 p-12 text-center bg-[var(--card)] shadow-xs">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 mb-4 border border-teal-100">
              <Inbox className="h-7 w-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              {searchQuery || statusFilter !== "ALL"
                ? "No matching tasks found"
                : "Your workspace is clear!"}
            </h3>
            <p className="mt-1 max-w-sm text-xs text-slate-500">
              {searchQuery || statusFilter !== "ALL"
                ? "Try adjusting your search terms or filters to find what you're looking for."
                : "Create your first task above to kickstart your productivity."}
            </p>
            {(searchQuery || statusFilter !== "ALL") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("ALL");
                }}
                className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all border border-slate-200"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : viewMode === "board" ? (
          /* Kanban Board View - Clean Professional Columns */
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3 gap-5">
            {/* Column: To Do */}
            <KanbanColumn
              title="To Do"
              count={filteredTasks.filter((t) => t.status === "TODO").length}
              icon={<Clock className="h-4 w-4 text-amber-600" />}
              badgeColor="bg-amber-50 text-amber-700 border-amber-200/80"
              tasks={filteredTasks.filter((t) => t.status === "TODO")}
              onEdit={startEdit}
              onDelete={(task) => setTaskToDelete(task)}
              onQuickStatus={handleQuickStatusChange}
              busy={busy}
              formatDate={formatDate}
            />

            {/* Column: In Progress */}
            <KanbanColumn
              title="In Progress"
              count={filteredTasks.filter((t) => t.status === "IN_PROGRESS").length}
              icon={<PlayCircle className="h-4 w-4 text-teal-600" />}
              badgeColor="bg-teal-50 text-teal-700 border-teal-200/80"
              tasks={filteredTasks.filter((t) => t.status === "IN_PROGRESS")}
              onEdit={startEdit}
              onDelete={(task) => setTaskToDelete(task)}
              onQuickStatus={handleQuickStatusChange}
              busy={busy}
              formatDate={formatDate}
            />

            {/* Column: Done */}
            <KanbanColumn
              title="Done"
              count={filteredTasks.filter((t) => t.status === "DONE").length}
              icon={<CheckCircle2 className="h-4 w-4 text-emerald-600" />}
              badgeColor="bg-emerald-50 text-emerald-700 border-emerald-200/80"
              tasks={filteredTasks.filter((t) => t.status === "DONE")}
              onEdit={startEdit}
              onDelete={(task) => setTaskToDelete(task)}
              onQuickStatus={handleQuickStatusChange}
              busy={busy}
              formatDate={formatDate}
            />
          </div>
        ) : (
          /* List View - Clean Professional Rows */
          <div className="space-y-2.5">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-slate-200/90 bg-[var(--card)] p-4 sm:p-5 shadow-xs hover:shadow-sm hover:border-slate-300 transition-all"
              >
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  {/* Status Circle Button */}
                  <button
                    onClick={() => {
                      const next =
                        task.status === "TODO"
                          ? "IN_PROGRESS"
                          : task.status === "IN_PROGRESS"
                          ? "DONE"
                          : "TODO";
                      handleQuickStatusChange(task, next);
                    }}
                    title={`Current: ${task.status}. Click to advance.`}
                    disabled={busy}
                    className="mt-0.5 shrink-0 rounded-full p-1 transition-all hover:scale-110"
                  >
                    {task.status === "DONE" ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    ) : task.status === "IN_PROGRESS" ? (
                      <PlayCircle className="h-5 w-5 text-teal-600" />
                    ) : (
                      <div className="h-5 w-5 rounded-full border-2 border-slate-300 hover:border-teal-600" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h3
                        className={`font-semibold text-sm sm:text-base break-words ${
                          task.status === "DONE"
                            ? "line-through text-slate-400"
                            : "text-slate-900"
                        }`}
                      >
                        {task.title}
                      </h3>
                      <StatusBadge status={task.status} />
                    </div>

                    {task.description && (
                      <p className="mt-1 text-xs sm:text-sm text-slate-600 break-words leading-relaxed">
                        {task.description}
                      </p>
                    )}

                    <div className="mt-2 flex items-center gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDate(task.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* List Item Action Buttons */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <button
                    onClick={() => startEdit(task)}
                    disabled={busy}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all shadow-2xs"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => setTaskToDelete(task)}
                    disabled={busy}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-200 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-all shadow-2xs"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
