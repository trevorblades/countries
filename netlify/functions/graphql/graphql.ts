import { ApolloServer } from "@apollo/server";
import {
  handlers,
  startServerAndCreateLambdaHandler,
} from "@as-integrations/aws-lambda";
import { readFileSync } from "node:fs";
import { resolvers } from "./resolvers";

const typeDefs = readFileSync("../../../schema.graphqls", "utf8");

const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
});

export const handler = startServerAndCreateLambdaHandler(
  server,
  handlers.createAPIGatewayProxyEventV2RequestHandler()
);
