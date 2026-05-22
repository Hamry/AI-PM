import type { TaskId } from "../types/bindings";

interface UpNextTask {
  id: TaskId;
  title: string;
}

interface FocusTimerProps {
  activeTaskTitle?: string;
  totalSeconds: number;
  secondsRemaining: number;
  isRunning: boolean;
  upNextTasks?: UpNextTask[];
  onStart: () => void;
  onPause: () => void;
  onStop: () => void;
  onRestart: () => void;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export function FocusTimer({
  activeTaskTitle,
  totalSeconds,
  secondsRemaining,
  isRunning,
  upNextTasks = [],
  onStart,
  onPause,
  onStop,
  onRestart,
}: FocusTimerProps) {
  const progressPct = totalSeconds > 0
    ? ((totalSeconds - secondsRemaining) / totalSeconds) * 100
    : 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl bg-surface border border-border p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold tracking-widest text-text-muted uppercase">
            Focus Mode
          </span>
          <span className="size-2 rounded-full bg-focus-red animate-pulse" />
        </div>

        <div className="flex flex-col items-center gap-1.5">
          <span className="font-mono text-5xl font-bold text-text-primary tracking-tight">
            {formatTime(secondsRemaining)}
          </span>
          {activeTaskTitle && (
            <span className="text-xs text-text-secondary text-center truncate w-full px-2 text-center">
              {activeTaskTitle}
            </span>
          )}
        </div>

        <div className="h-1 rounded-full bg-surface-muted overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-1000"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        <div className="flex justify-center gap-3">
          <button
            onClick={onRestart}
            className="size-9 rounded-full flex items-center justify-center hover:bg-surface-muted transition-colors text-text-secondary"
            title="Restart"
          >
            <span className="material-symbols-outlined text-[18px]">restart_alt</span>
          </button>
          <button
            onClick={isRunning ? onPause : onStart}
            className="size-10 rounded-full flex items-center justify-center bg-text-primary hover:opacity-90 transition-opacity text-surface"
            title={isRunning ? "Pause" : "Start"}
          >
            <span className="material-symbols-outlined text-[18px]">
              {isRunning ? "pause" : "play_arrow"}
            </span>
          </button>
          <button
            onClick={onStop}
            className="size-9 rounded-full flex items-center justify-center hover:bg-surface-muted transition-colors text-text-secondary"
            title="Stop"
          >
            <span className="material-symbols-outlined text-[18px]">stop</span>
          </button>
        </div>
      </div>

      {upNextTasks.length > 0 && (
        <div>
          <p className="text-[10px] font-bold tracking-widest text-text-muted uppercase mb-2 px-1">
            Up Next
          </p>
          <div className="flex flex-col gap-2">
            {upNextTasks.map((task, i) => (
              <div key={task.id} className="flex items-start gap-2.5 px-1">
                <span className="text-xs font-bold text-text-muted w-4 shrink-0 pt-0.5">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-sm text-text-secondary leading-snug">{task.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
