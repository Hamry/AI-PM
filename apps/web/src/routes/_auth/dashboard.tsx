import { createFileRoute } from "@tanstack/react-router";
import { useUser, useAuth } from "@clerk/react";
import { useState, useEffect, useRef } from "react";
import {
  DashboardLayout,
  Sidebar,
  TaskCard,
  FocusTimer,
  type Task,
  type TaskDraft,
  type Estimation,
} from "@fractalist/shared-ui";
import { fetchTasks, createTask, patchTask, patchTaskStatus } from "../../api/tasks";
import { InlineTaskForm } from "../../components/InlineTaskForm";
import { InlineEditForm } from "../../components/InlineEditForm";

export const Route = createFileRoute("/_auth/dashboard")({
  component: RouteComponent,
});

const FOCUS_SESSION_SECONDS = 25 * 60;

function RouteComponent() {
  const { user } = useUser();
  const { getToken } = useAuth();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"active" | "completed">("active");
  const [focusTaskId, setFocusTaskId] = useState<number | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState(FOCUS_SESSION_SECONDS);
  const [timerRunning, setTimerRunning] = useState(false);
  const [showInlineForm, setShowInlineForm] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    async function loadTasks() {
      setIsLoading(true);
      setLoadError(null);
      try {
        const data = await fetchTasks(getToken);
        setTasks(data);
        if (data.length > 0) setFocusTaskId(data[0].id);
      } catch (err) {
        setLoadError("Could not load tasks. Is the backend running?");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadTasks();
  }, []);

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
    const newStatus = checked ? "Completed" : "Todo";
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );
    patchTaskStatus(getToken, taskId, newStatus).catch((err) =>
      console.error("Failed to update task status:", err)
    );
  }

  async function handleCreateTask(draft: TaskDraft) {
    const newTask = await createTask(getToken, draft);
    setTasks((prev) => [newTask, ...prev]);
    if (focusTaskId === null) setFocusTaskId(newTask.id);
    setShowInlineForm(false);
  }

  async function handleUpdateTask(
    id: number,
    update: {
      title?: string;
      description?: string;
      due_date?: string | null;
      estimation?: Estimation | null;
    }
  ) {
    const updated = await patchTask(getToken, id, update);
    setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
    setEditingTaskId(null);
  }

  const displayedTasks = tasks.filter((t) =>
    activeTab === "completed"
      ? t.status === "Completed"
      : t.status !== "Completed" && t.status !== "Archived"
  );

  const focusTask = tasks.find((t) => t.id === focusTaskId) ?? null;
  const focusTaskSeconds = focusTask?.estimation
    ? focusTask.estimation.predicted_minutes * 60
    : FOCUS_SESSION_SECONDS;

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
    <>
      <DashboardLayout
        sidebar={
          <Sidebar
            aiSuggestion="You have tasks waiting. Pick one and start a focus session."
          />
        }
        mainSlot={
          <div className="flex flex-col h-full overflow-hidden">
            <div className="mb-5 shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold text-text-primary">
                    {greeting},{" "}
                    <span className="font-extrabold">
                      {user?.firstName ?? "there"}
                    </span>
                  </h1>
                  <p className="text-sm text-text-muted mt-0.5">{dateStr}</p>
                </div>
                <button
                  onClick={() => setShowInlineForm(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-text-primary text-surface text-sm font-medium hover:opacity-90 transition-opacity"
                >
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
              {showInlineForm && (
                <InlineTaskForm
                  onSubmit={handleCreateTask}
                  onCancel={() => setShowInlineForm(false)}
                />
              )}

              {isLoading && (
                <div className="flex flex-col gap-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-16 rounded-xl bg-surface-muted animate-pulse"
                    />
                  ))}
                </div>
              )}

              {!isLoading && loadError && (
                <p className="text-sm text-red-500 py-6 text-center">{loadError}</p>
              )}

              {!isLoading && !loadError && displayedTasks.length === 0 && (
                <p className="text-text-muted text-sm py-12 text-center">
                  {activeTab === "completed"
                    ? "No completed tasks yet."
                    : "No active tasks. Add one!"}
                </p>
              )}

              {!isLoading &&
                displayedTasks.map((task) =>
                  editingTaskId === task.id ? (
                    <InlineEditForm
                      key={task.id}
                      task={task}
                      onSubmit={handleUpdateTask}
                      onCancel={() => setEditingTaskId(null)}
                    />
                  ) : (
                    <TaskCard
                      key={task.id}
                      task={task}
                      isActive={task.id === focusTaskId}
                      onStatusChange={(checked) =>
                        handleStatusChange(task.id, checked)
                      }
                      actionSlot={
                        <>
                          <button
                            onClick={() => setEditingTaskId(task.id)}
                            className="ml-1 shrink-0 size-7 rounded-lg flex items-center justify-center hover:bg-surface-muted text-text-muted transition-colors"
                            title="Edit task"
                          >
                            <span className="material-symbols-outlined text-base">
                              edit
                            </span>
                          </button>
                          <button
                            onClick={() => {
                              const secs = task.estimation
                                ? task.estimation.predicted_minutes * 60
                                : FOCUS_SESSION_SECONDS;
                              setFocusTaskId(task.id);
                              setSecondsRemaining(secs);
                              setTimerRunning(true);
                            }}
                            className="ml-1 shrink-0 size-7 rounded-lg flex items-center justify-center hover:bg-surface-muted text-text-muted transition-colors"
                            title="Focus on this task"
                          >
                            <span className="material-symbols-outlined text-base">
                              timer
                            </span>
                          </button>
                        </>
                      }
                    />
                  )
                )}
            </div>
          </div>
        }
        rightSlot={
          <FocusTimer
            activeTaskTitle={focusTask?.title}
            totalSeconds={focusTaskSeconds}
            secondsRemaining={secondsRemaining}
            isRunning={timerRunning}
            upNextTasks={upNextTasks}
            onStart={() => setTimerRunning(true)}
            onPause={() => setTimerRunning(false)}
            onStop={() => {
              setTimerRunning(false);
              setSecondsRemaining(focusTaskSeconds);
            }}
            onRestart={() => {
              setSecondsRemaining(focusTaskSeconds);
              setTimerRunning(true);
            }}
          />
        }
      />
    </>
  );
}
