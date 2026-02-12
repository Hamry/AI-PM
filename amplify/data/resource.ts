import { type ClientSchema, a, defineData } from '@aws-amplify/backend';
import { greetingFunction } from '../functions/greeting/resource';

const schema = a.schema({
  Todo: a
    .model({
      content: a.string().required(),
      isDone: a.boolean().default(false),
      priority: a.enum(['LOW', 'MEDIUM', 'HIGH']),
    })
    .authorization((allow) => [allow.owner()]),

  // Custom query that invokes the Lambda function
  getGreeting: a
    .query()
    .arguments({
      name: a.string(),
    })
    .returns(
      a.customType({
        message: a.string().required(),
        timestamp: a.string().required(),
      })
    )
    .handler(a.handler.function(greetingFunction))
    .authorization((allow) => [allow.authenticated()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
});
