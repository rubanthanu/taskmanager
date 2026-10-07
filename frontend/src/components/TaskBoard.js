"use client";
import { Calendar, RotateCcw, ChevronRight, Edit3, Trash2 } from "lucide-react";
// Kanban Column Component
export function KanbanColumn({
  title,
  count,
  icon,
  badgeColor,
  tasks,
  onEdit,
  onDelete,
  onQuickStatus,
  busy,
  formatDate,
}) {
  return (
    <div className="flex flex-col rounded-2xl border border-slate-200/80 bg-slate-100/60 p-3.5 sm:p-4 min-h-[280px]">
      {/* Column Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="font-bold text-sm tracking-wide text-slate-800">
            {title}
          </h2>
        </div>
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-bold border shadow-2xs ${badgeColor}`}
        >
          {count}
        </span>
      </div>

      {/* Cards List */}
      <div className="flex-1 space-y-3">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="group rounded-xl border border-slate-200/90 bg-[var(--card)] p-4 shadow-xs hover:shadow-sm hover:border-slate-300 transition-all duration-150"
          >
            <div className="flex items-start justify-between gap-2">
              <h3
                className={`font-semibold text-sm leading-snug break-words ${
                  task.status === "DONE"
                    ? "line-through text-slate-400"
                    : "text-slate-900"
                }`}
              >
                {task.title}
              </h3>
            </div>

            {task.description && (
              <p className="mt-1.5 text-xs text-slate-600 line-clamp-3 leading-relaxed break-words">
                {task.description}
              </p>
            )}

            <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
              <span className="flex items-center gap-1 font-medium">
                <Calendar className="h-3 w-3" />
                {formatDate(task.createdAt)}
              </span>

              {/* Status Quick Flow */}
              <div className="flex items-center gap-1">
                {task.status !== "TODO" && (
                  <button
                    type="button"
                    onClick={() =>
                      onQuickStatus(
                        task,
                        task.status === "DONE" ? "IN_PROGRESS" : "TODO"
                      )
                    }
                    title="Move back"
                    disabled={busy}
                    className="p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </button>
                )}

                {task.status !== "DONE" && (
                  <button
                    type="button"
                    onClick={() =>
                      onQuickStatus(
                        task,
                        task.status === "TODO" ? "IN_PROGRESS" : "DONE"
                      )
                    }
                    title={
                      task.status === "TODO"
                        ? "Move to In Progress"
                        : "Mark Complete"
                    }
                    disabled={busy}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200/60 font-semibold text-[11px] transition-all"
                  >
                    <span>
                      {task.status === "TODO" ? "Start" : "Done"}
                    </span>
                    <ChevronRight className="h-3 w-3" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => onEdit(task)}
                  disabled={busy}
                  title="Edit task"
                  className="p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => onDelete(task)}
                  disabled={busy}
                  title="Delete task"
                  className="p-1 rounded-md hover:bg-rose-50 text-slate-400 hover:text-rose-600"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {tasks.length === 0 && (
          <div className="h-28 flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 text-slate-400 text-xs">
            <span>No tasks in this lane</span>
          </div>
        )}
      </div>
    </div>
  );
}

// Status Badge Component
export function StatusBadge({ status }) {
  if (status === "DONE") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
        Done
      </span>
    );
  }
  if (status === "IN_PROGRESS") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200">
        <span className="h-1.5 w-1.5 rounded-full bg-teal-600 " />
        In Progress
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
      To Do
    </span>
  );
}
