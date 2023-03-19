import { ApolloServer } from "@apollo/server";
import {
  handlers,
  startServerAndCreateLambdaHandler,
} from "@as-integrations/aws-lambda";
import { schema } from "./schema";

const server = new ApolloServer({
  schema,
  introspection: true,
});

// TODO: add usage reporting and schema reporting
// https://www.apollographql.com/docs/apollo-server/api/plugin/schema-reporting
export const handler = startServerAndCreateLambdaHandler(
  server,
  handlers.createAPIGatewayProxyEventRequestHandler()
);
