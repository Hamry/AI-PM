import { useState, useEffect, useCallback } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../../amplify/data/resource';

const client = generateClient<Schema>();

type Todo = Schema['Todo']['type'];

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Subscribe to real-time updates
  useEffect(() => {
    const subscription = client.models.Todo.observeQuery().subscribe({
      next: ({ items }) => {
        setTodos([...items]);
        setLoading(false);
      },
      error: (err) => {
        console.error('Subscription error:', err);
        setError('Failed to sync todos');
        setLoading(false);
      },
    });

    return () => subscription.unsubscribe();
  }, []);

  const createTodo = useCallback(async (content: string, priority: 'LOW' | 'MEDIUM' | 'HIGH' = 'MEDIUM') => {
    try {
      setError(null);
      const { errors } = await client.models.Todo.create({
        content,
        isDone: false,
        priority,
      });
      if (errors) {
        throw new Error(errors[0].message);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create todo';
      setError(message);
      throw err;
    }
  }, []);

  const toggleTodo = useCallback(async (id: string, currentIsDone: boolean) => {
    try {
      setError(null);
      const { errors } = await client.models.Todo.update({
        id,
        isDone: !currentIsDone,
      });
      if (errors) {
        throw new Error(errors[0].message);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update todo';
      setError(message);
      throw err;
    }
  }, []);

  const deleteTodo = useCallback(async (id: string) => {
    try {
      setError(null);
      const { errors } = await client.models.Todo.delete({ id });
      if (errors) {
        throw new Error(errors[0].message);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete todo';
      setError(message);
      throw err;
    }
  }, []);

  return {
    todos,
    loading,
    error,
    createTodo,
    toggleTodo,
    deleteTodo,
  };
}
