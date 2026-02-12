import { useState, useCallback } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../../amplify/data/resource';

const client = generateClient<Schema>();

export function useGreeting() {
  const [greeting, setGreeting] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGreeting = useCallback(async (name?: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, errors } = await client.queries.getGreeting({
        name: name ?? undefined,
      });

      if (errors) {
        throw new Error(errors[0].message);
      }

      if (data) {
        setGreeting(data.message);
      }

      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch greeting';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    greeting,
    loading,
    error,
    fetchGreeting,
  };
}
