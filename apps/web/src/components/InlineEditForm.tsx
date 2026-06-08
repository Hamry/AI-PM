import { useEffect, useRef, useState } from "react";
import type { Task, Estimation } from "@fractalist/shared-ui";

interface TaskUpdate {
  title?: string;
  description?: string;
  due_date?: string | null;
  estimation?: Estimation | null;
}

interface InlineEditFormProps {
  task: Task;
  onSubmit: (id: number, update: TaskUpdate) => Promise<void>;
  onCancel: () => void;
}

export function InlineEditForm({ task, onSubmit, onCancel }: InlineEditFormProps) {
  const [title, setTitle] = useState(task.title);
  const [note, setNote] = useState(task.description);
  const [estimateMinutes, setEstimateMinutes] = useState(
    task.estimation ? String(task.estimation.predicted_minutes) : ""
  );
  const [dueDate, setDueDate] = useState(
    task.due_date ? task.due_date.slice(0, 16) : ""
  );
  const [submitting, setSubmitting] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    titleRef.current?.focus();
    titleRef.current?.select();
  }, []);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") onCancel();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || submitting) return;
    const mins = parseInt(estimateMinutes, 10);
    setSubmitting(true);
    try {
      const update: TaskUpdate = {
        title: title.trim(),
        description: note.trim(),
        due_date: dueDate ? new Date(dueDate).toISOString() : null,
        estimation:
          mins > 0
            ? {
                predicted_minutes: mins,
                confidence_score: task.estimation?.confidence_score ?? 1.0,
                last_updated: new Date().toISOString(),
              }
            : null,
      };
      await onSubmit(task.id, update);
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    "text-xs text-text-primary bg-surface-muted rounded-lg px-2.5 py-1.5 border border-border outline-none focus:ring-1 focus:ring-primary/40 placeholder:text-text-muted disabled:opacity-50";

  return (
    <form
      onSubmit={handleSubmit}
      onKeyDown={handleKeyDown}
      className="flex flex-col gap-3 p-4 rounded-xl bg-surface border-2 border-primary/30 shadow-sm"
    >
      <input
        ref={titleRef}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Task title"
        disabled={submitting}
        className="w-full text-sm font-medium text-text-primary bg-transparent outline-none placeholder:text-text-muted disabled:opacity-50"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            handleSubmit(e as unknown as React.FormEvent);
          }
        }}
      />

      <div className="flex items-center gap-2 flex-wrap">
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Add a note…"
          disabled={submitting}
          className={`${inputClass} flex-1 min-w-0`}
        />

        <div className="flex items-center gap-1 shrink-0">
          <span className="material-symbols-outlined text-[14px] text-text-muted">
            timer
          </span>
          <input
            type="number"
            min="1"
            value={estimateMinutes}
            onChange={(e) => setEstimateMinutes(e.target.value)}
            placeholder="min"
            disabled={submitting}
            className={`${inputClass} w-16 text-center`}
          />
        </div>

        <input
          type="datetime-local"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          disabled={submitting}
          className={`${inputClass} shrink-0`}
        />
      </div>

      <div className="flex justify-end items-center gap-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="px-3 py-1.5 rounded-lg text-sm font-medium text-text-secondary hover:bg-surface-muted transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!title.trim() || submitting}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-text-primary text-surface text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40"
        >
          {submitting ? "Saving…" : "Save"}
        </button>
      </div>
    </form>
  );
}
