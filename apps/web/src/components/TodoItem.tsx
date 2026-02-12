interface TodoItemProps {
  id: string;
  content: string;
  isDone: boolean;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  onToggle: (id: string, isDone: boolean) => void;
  onDelete: (id: string) => void;
}

const priorityColors: Record<string, string> = {
  LOW: '#22c55e',
  MEDIUM: '#f59e0b',
  HIGH: '#ef4444',
};

export function TodoItem({
  id,
  content,
  isDone,
  priority,
  onToggle,
  onDelete,
}: TodoItemProps) {
  return (
    <li
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 16px',
        backgroundColor: isDone ? '#f3f4f6' : '#ffffff',
        borderRadius: '8px',
        marginBottom: '8px',
        border: '1px solid #e5e7eb',
      }}
    >
      <input
        type="checkbox"
        checked={isDone}
        onChange={() => onToggle(id, isDone)}
        style={{
          width: '20px',
          height: '20px',
          cursor: 'pointer',
        }}
      />
      <span
        style={{
          flex: 1,
          textDecoration: isDone ? 'line-through' : 'none',
          color: isDone ? '#9ca3af' : '#1f2937',
        }}
      >
        {content}
      </span>
      <span
        style={{
          padding: '4px 8px',
          borderRadius: '4px',
          backgroundColor: priorityColors[priority],
          color: '#ffffff',
          fontSize: '12px',
          fontWeight: 'bold',
        }}
      >
        {priority}
      </span>
      <button
        onClick={() => onDelete(id)}
        style={{
          padding: '6px 12px',
          backgroundColor: '#fee2e2',
          color: '#dc2626',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '14px',
        }}
      >
        Delete
      </button>
    </li>
  );
}
