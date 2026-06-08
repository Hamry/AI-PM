import { Task, TaskStatus } from "../types/bindings";
import * as Checkbox from "@radix-ui/react-checkbox";
import * as Tooltip from "@radix-ui/react-tooltip";

interface TaskCardProps {
  task: Task;
  isActive?: boolean;
  actionSlot?: React.ReactNode;
  onStatusChange?: (checked: boolean) => void;
}

function statusBadgeClasses(status: TaskStatus): string {
  const map: Record<TaskStatus, string> = {
    Todo:          "bg-slate-100 text-slate-500",
    InProgress:    "bg-amber-100 text-amber-700",
    Completed:     "bg-primary/10 text-primary",
    PendingReview: "bg-violet-100 text-violet-700",
    Archived:      "bg-slate-100 text-slate-400",
  };
  return map[status];
}

function formatTimeInfo(task: Task): string | null {
  const parts: string[] = [];
  if (task.estimation) {
    const m = task.estimation.predicted_minutes;
    parts.push(m >= 60
      ? `${Math.floor(m / 60)}h${m % 60 > 0 ? ` ${m % 60}m` : ""}`
      : `${m}m`);
  }
  if (task.due_date) {
    const d = new Date(task.due_date);
    parts.push(`Due ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`);
  }
  return parts.length > 0 ? parts.join(" · ") : null;
}

export function TaskCard({ task, isActive, actionSlot, onStatusChange }: TaskCardProps) {
  const isCompleted = task.status === "Completed";
  const timeInfo = formatTimeInfo(task);

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-xl bg-surface border transition-shadow hover:shadow-sm ${
        isActive ? "border-l-4 border-l-primary border-border" : "border-border"
      }`}
    >
      <Checkbox.Root
        checked={isCompleted}
        onCheckedChange={(checked) => onStatusChange?.(checked === true)}
        className="size-5 rounded-full border-2 border-slate-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary flex items-center justify-center shrink-0 mt-0.5 transition-colors"
      >
        <Checkbox.Indicator>
          <svg className="size-3 text-white" viewBox="0 0 12 12" fill="none">
            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Checkbox.Indicator>
      </Checkbox.Root>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <h3
                className={`text-sm font-medium truncate max-w-[280px] ${
                  isCompleted ? "line-through text-text-muted" : "text-text-primary"
                }`}
              >
                {task.title}
              </h3>
            </Tooltip.Trigger>
            <Tooltip.Content
              className="bg-text-primary text-surface text-xs px-2 py-1 rounded-lg"
              sideOffset={4}
            >
              {task.title}
            </Tooltip.Content>
          </Tooltip.Root>

          <span className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full shrink-0 ${statusBadgeClasses(task.status)}`}>
            {task.status === "PendingReview" ? "Review" : task.status}
          </span>
        </div>

        {(task.description || timeInfo) && (
          <div className="flex items-center gap-1.5 mt-1 min-w-0">
            {task.description && (
              <span className="text-xs text-text-muted italic truncate">
                {task.description}
              </span>
            )}
            {task.description && timeInfo && <span className="text-text-muted text-xs shrink-0">•</span>}
            {timeInfo && <span className="text-xs text-text-muted shrink-0">{timeInfo}</span>}
          </div>
        )}

        {task.metadata.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {task.metadata.tags.map((tag) => (
              <span key={tag} className="text-[10px] font-medium px-2 py-0.5 rounded bg-surface-muted text-text-secondary uppercase tracking-wide">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {actionSlot}
    </div>
  );
}
