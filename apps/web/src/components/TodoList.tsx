import { useState } from 'react';
import { useTodos } from '../hooks/useTodos';
import { TodoItem } from './TodoItem';

export function TodoList() {
  const { todos, loading, error, createTodo, toggleTodo, deleteTodo } = useTodos();
  const [newTodoContent, setNewTodoContent] = useState('');
  const [newTodoPriority, setNewTodoPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoContent.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await createTodo(newTodoContent.trim(), newTodoPriority);
      setNewTodoContent('');
    } catch {
      // Error is handled in the hook
    } finally {
      setIsSubmitting(false);
    }
  };

  const pendingCount = todos.filter((t) => !t.isDone).length;
  const completedCount = todos.filter((t) => t.isDone).length;

  return (
    <div style={{ width: '100%', padding: '20px' }}>
      {/* Add Todo Form */}
      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '24px',
        }}
      >
        <input
          type="text"
          value={newTodoContent}
          onChange={(e) => setNewTodoContent(e.target.value)}
          placeholder="What needs to be done?"
          disabled={isSubmitting}
          style={{
            flex: 1,
            padding: '12px 16px',
            fontSize: '16px',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            outline: 'none',
          }}
        />
        <select
          value={newTodoPriority}
          onChange={(e) => setNewTodoPriority(e.target.value as 'LOW' | 'MEDIUM' | 'HIGH')}
          disabled={isSubmitting}
          style={{
            padding: '12px 16px',
            fontSize: '16px',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            backgroundColor: '#ffffff',
            cursor: 'pointer',
          }}
        >
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
        </select>
        <button
          type="submit"
          disabled={isSubmitting || !newTodoContent.trim()}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            backgroundColor: '#4f46e5',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            cursor: isSubmitting || !newTodoContent.trim() ? 'not-allowed' : 'pointer',
            opacity: isSubmitting || !newTodoContent.trim() ? 0.6 : 1,
          }}
        >
          {isSubmitting ? 'Adding...' : 'Add'}
        </button>
      </form>

      {/* Error Message */}
      {error && (
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: '#fee2e2',
            color: '#dc2626',
            borderRadius: '8px',
            marginBottom: '16px',
          }}
        >
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && todos.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
          Loading todos...
        </div>
      )}

      {/* Todo List */}
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {todos.length === 0 && !loading ? (
          <li
            style={{
              textAlign: 'center',
              padding: '40px',
              color: '#6b7280',
              backgroundColor: '#f9fafb',
              borderRadius: '8px',
            }}
          >
            No todos yet. Add one above!
          </li>
        ) : (
          todos.map((todo) => (
            <TodoItem
              key={todo.id}
              id={todo.id}
              content={todo.content ?? ''}
              isDone={todo.isDone ?? false}
              priority={todo.priority ?? 'MEDIUM'}
              onToggle={toggleTodo}
              onDelete={deleteTodo}
            />
          ))
        )}
      </ul>

      {/* Stats */}
      {todos.length > 0 && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '16px',
            padding: '12px 16px',
            backgroundColor: '#f3f4f6',
            borderRadius: '8px',
            fontSize: '14px',
            color: '#6b7280',
          }}
        >
          <span>{pendingCount} items remaining</span>
          <span>{completedCount} completed</span>
        </div>
      )}
    </div>
  );
}
