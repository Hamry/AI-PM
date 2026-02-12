import { defineFunction } from '@aws-amplify/backend';

export const greetingFunction = defineFunction({
  name: 'greeting-function',
  entry: './handler.ts',
});
