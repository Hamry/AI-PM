import type { Handler } from 'aws-lambda';

interface GreetingEvent {
  arguments: {
    name?: string;
  };
}

interface GreetingResponse {
  message: string;
  timestamp: string;
}

export const handler: Handler<GreetingEvent, GreetingResponse> = async (event) => {
  const name = event.arguments?.name || 'User';

  return {
    message: `Hello, ${name}! Welcome to your Todo App.`,
    timestamp: new Date().toISOString(),
  };
};
