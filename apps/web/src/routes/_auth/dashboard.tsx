import { createFileRoute } from "@tanstack/react-router";
import { useUser } from "@clerk/react";
import { useState, useEffect, useRef } from "react";
import {
  DashboardLayout,
  Sidebar,
  TaskCard,
  FocusTimer,
  type Task,
  type TaskStatus,
} from "@fractalist/shared-ui";

export const Route = createFileRoute("/_auth/dashboard")({
  component: RouteComponent,
});

function makeTask(
  id: number,
  title: string,
  status: TaskStatus,
  opts: Partial<Task> = {}
): Task {
  return {
    id,
    title,
    description: "",
    status,
    due_date: null,
    estimation: null,
    parent_id: null,
    metadata: { tags: [], derived_from: "manual" },
    ...opts,
  };
}

const MOCK_TASKS: Task[] = [
  makeTask(1, "Draft presentation for Q4 roadmap", "InProgress", {
    estimation: { predicted_minutes: 25, confidence_score: 0.85, last_updated: "" },
    metadata: { tags: [], derived_from: "manual" },
  }),
  makeTask(2, "Research competitive dashboard layouts", "Todo", {
    metadata: { tags: ["BREAKDOWN"], derived_from: "ai" },
  }),
  makeTask(3, "Prepare weekly sync agenda", "Todo", {
    due_date: new Date(new Date().setHours(14, 0, 0, 0)).toISOString(),
    metadata: { tags: [], derived_from: "manual" },
  }),
  makeTask(4, "Refine system architecture", "PendingReview", {
    estimation: { predicted_minutes: 60, confidence_score: 0.7, last_updated: "" },
    metadata: { tags: ["DESIGN"], derived_from: "ai" },
  }),
  makeTask(5, "Developer feedback review", "Todo", {
    estimation: { predicted_minutes: 30, confidence_score: 0.9, last_updated: "" },
    metadata: { tags: [], derived_from: "manual" },
  }),
  makeTask(6, "Review system documentation", "Completed", {
    metadata: { tags: [], derived_from: "manual" },
  }),
];

const MOCK_PROJECTS = [
  { id: "p1", name: "Marketing Site", color: "#42d411" },
  { id: "p2", name: "Q4 Roadmap", color: "#3b82f6" },
  { id: "p3", name: "Design System", color: "#f59e0b" },
];

const TASK_PROJECT_MAP: Record<number, { name: string; color: string }> = {
  1: { name: "Marketing Site", color: "#42d411" },
  2: { name: "Design System", color: "#f59e0b" },
  3: { name: "Q4 Roadmap", color: "#3b82f6" },
  4: { name: "Marketing Site", color: "#42d411" },
  5: { name: "Q4 Roadmap", color: "#3b82f6" },
  6: { name: "Design System", color: "#f59e0b" },
};

const FOCUS_SESSION_SECONDS = 25 * 60;

function RouteComponent() {
  const { user } = useUser();
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
  const [activeTab, setActiveTab] = useState<"active" | "completed">("active");
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [focusTaskId, setFocusTaskId] = useState<number>(1);
  const [secondsRemaining, setSecondsRemaining] = useState(FOCUS_SESSION_SECONDS);
  const [timerRunning, setTimerRunning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => {
        setSecondsRemaining((s) => {
          if (s <= 1) {
            setTimerRunning(false);
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerRunning]);

  function handleStatusChange(taskId: number, checked: boolean) {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, status: checked ? "Completed" : "Todo" } : t
      )
    );
  }

  const displayedTasks = tasks.filter((t) =>
    activeTab === "completed"
      ? t.status === "Completed"
      : t.status !== "Completed" && t.status !== "Archived"
  );

  const focusTask = tasks.find((t) => t.id === focusTaskId) ?? null;

  const upNextTasks = tasks
    .filter(
      (t) =>
        t.status !== "Completed" &&
        t.status !== "Archived" &&
        t.id !== focusTaskId
    )
    .slice(0, 4)
    .map((t) => ({ id: t.id, title: t.title }));

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const dateStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <DashboardLayout
      sidebar={
        <Sidebar
          projects={MOCK_PROJECTS}
          activeProjectId={activeProjectId ?? undefined}
          onProjectClick={(id) =>
            setActiveProjectId((prev) => (prev === id ? null : id))
          }
          aiSuggestion="You have 3 tasks that can be optimized today."
        />
      }
      mainSlot={
        <div className="flex flex-col h-full overflow-hidden">
          <div className="mb-5 shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-text-primary">
                  {greeting},{" "}
                  <span className="font-extrabold">{user?.firstName ?? "there"}</span>
                </h1>
                <p className="text-sm text-text-muted mt-0.5">{dateStr}</p>
              </div>
              <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-text-primary text-surface text-sm font-medium hover:opacity-90 transition-opacity">
                <span className="material-symbols-outlined text-[16px]">add</span>
                New Task
              </button>
            </div>
          </div>

          <div className="flex gap-1 mb-4 shrink-0">
            {(["active", "completed"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? "bg-text-primary text-surface"
                    : "text-text-secondary hover:bg-surface-muted"
                }`}
              >
                {tab === "active" ? "Active Tasks" : "Completed"}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-2 overflow-y-auto flex-1 pr-1">
            {displayedTasks.length === 0 && (
              <p className="text-text-muted text-sm py-12 text-center">
                {activeTab === "completed" ? "No completed tasks yet." : "All caught up!"}
              </p>
            )}
            {displayedTasks.map((task) => {
              const proj = TASK_PROJECT_MAP[task.id];
              return (
                <TaskCard
                  key={task.id}
                  task={task}
                  projectName={proj?.name}
                  projectColor={proj?.color}
                  isActive={task.id === focusTaskId}
                  onStatusChange={(checked) => handleStatusChange(task.id, checked)}
                  actionSlot={
                    <button
                      onClick={() => {
                        setFocusTaskId(task.id);
                        setSecondsRemaining(FOCUS_SESSION_SECONDS);
                        setTimerRunning(false);
                      }}
                      className="ml-2 shrink-0 size-7 rounded-lg flex items-center justify-center hover:bg-surface-muted text-text-muted transition-colors"
                      title="Focus on this task"
                    >
                      <span className="material-symbols-outlined text-base">timer</span>
                    </button>
                  }
                />
              );
            })}
          </div>
        </div>
      }
      rightSlot={
        <FocusTimer
          activeTaskTitle={focusTask?.title}
          totalSeconds={FOCUS_SESSION_SECONDS}
          secondsRemaining={secondsRemaining}
          isRunning={timerRunning}
          upNextTasks={upNextTasks}
          onStart={() => setTimerRunning(true)}
          onPause={() => setTimerRunning(false)}
          onStop={() => {
            setTimerRunning(false);
            setSecondsRemaining(FOCUS_SESSION_SECONDS);
          }}
          onRestart={() => {
            setSecondsRemaining(FOCUS_SESSION_SECONDS);
            setTimerRunning(true);
          }}
        />
      }
    />
  );
}
