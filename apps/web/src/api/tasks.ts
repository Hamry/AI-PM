import type { Task, TaskDraft, TaskStatus, Estimation } from "@fractalist/shared-ui";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

async function authHeaders(getToken: () => Promise<string | null>) {
  const token = await getToken();
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
}

export async function fetchTasks(getToken: () => Promise<string | null>): Promise<Task[]> {
  const res = await fetch(`${API}/tasks`, { headers: await authHeaders(getToken) });
  if (!res.ok) throw new Error(`fetch tasks failed: ${res.status}`);
  return res.json();
}

export async function createTask(
  getToken: () => Promise<string | null>,
  draft: TaskDraft
): Promise<Task> {
  const res = await fetch(`${API}/tasks`, {
    method: "POST",
    headers: await authHeaders(getToken),
    body: JSON.stringify(draft),
  });
  if (!res.ok) throw new Error(`create task failed: ${res.status}`);
  return res.json();
}

export async function patchTask(
  getToken: () => Promise<string | null>,
  id: number,
  update: {
    title?: string;
    description?: string;
    due_date?: string | null;
    estimation?: Estimation | null;
  }
): Promise<Task> {
  const res = await fetch(`${API}/tasks/${id}`, {
    method: "PATCH",
    headers: await authHeaders(getToken),
    body: JSON.stringify(update),
  });
  if (!res.ok) throw new Error(`patch task failed: ${res.status}`);
  return res.json();
}

export async function patchTaskStatus(
  getToken: () => Promise<string | null>,
  id: number,
  status: TaskStatus
): Promise<Task> {
  const res = await fetch(`${API}/tasks/${id}`, {
    method: "PATCH",
    headers: await authHeaders(getToken),
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error(`patch task failed: ${res.status}`);
  return res.json();
}
